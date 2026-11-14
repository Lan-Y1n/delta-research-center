// 德尔塔研究中心 · 内容后台 API
// 设计约束：
//  - 零第三方依赖（只用 Node 内置模块），镜像小、攻击面小；
//  - 内容存 JSON（原子写入 + 变更前自动备份），管理端单用户；
//  - 只监听容器网络，外部仅经 nginx 的 /api、/admin、/uploads 访问；
//  - 写操作需要会话 Cookie + X-DRC-Admin 头（SameSite=Strict 之外再加一道 CSRF 防线）。
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 8090);
const DATA_DIR = process.env.DATA_DIR || '/data';
const ADMIN_USER = process.env.ADMIN_USER || 'lany1n';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';
const MAX_UPLOAD = Number(process.env.MAX_UPLOAD_MB || 4) * 1024 * 1024;
const SESSION_TTL = 7 * 24 * 3600;
const FIELD_SLUGS = ['physics', 'biology', 'chemistry', 'mathematics', 'philosophy', 'armed-forces'];
const PROJECT_STATUS = ['planning', 'progress', 'completed', 'hold'];

const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const ADMIN_DIR = path.join(__dirname, 'admin');

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('[fatal] ADMIN_PASSWORD 未设置或少于 8 位');
  process.exit(1);
}
if (!SESSION_SECRET || SESSION_SECRET.length < 16) {
  console.error('[fatal] ADMIN_SESSION_SECRET 未设置或少于 16 位');
  process.exit(1);
}

for (const dir of [DATA_DIR, BACKUP_DIR, UPLOAD_DIR]) fs.mkdirSync(dir, { recursive: true });

// 首次启动：把构建期生成的种子内容复制进数据目录，后台打开就是完整站点内容。
const SEED_FILE = path.join(__dirname, 'content.seed.json');
if (!fs.existsSync(CONTENT_FILE) && fs.existsSync(SEED_FILE)) {
  fs.copyFileSync(SEED_FILE, CONTENT_FILE);
  fs.chmodSync(CONTENT_FILE, 0o600);
  console.log('[drc-admin] 已从 content.seed.json 初始化内容');
}

const passwordHash = crypto.scryptSync(ADMIN_PASSWORD, 'drc-admin-v1', 32);

// ---------- 内容存取 ----------
let cached = null;
let revision = 0;

function readContent() {
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(CONTENT_FILE, 'utf8');
    let parsed = JSON.parse(raw);
    // 兼容两种落盘格式：扁平的 {site,leaders,…} 或早期带 {content:{…}} 包装
    if (parsed && typeof parsed === 'object' && parsed.content && typeof parsed.content === 'object') {
      parsed = { ...parsed.content, revision: parsed.revision ?? 0, updatedAt: parsed.updatedAt ?? '' };
    }
    cached = parsed;
    revision = Number(parsed.revision) || 0;
  } catch {
    cached = null;
  }
  return cached;
}

function writeContentAtomic(content) {
  const data = JSON.stringify(content, null, 2) + '\n';
  const tmp = path.join(DATA_DIR, `.content.${process.pid}.tmp`);
  const fd = fs.openSync(tmp, 'w', 0o600);
  try {
    fs.writeSync(fd, data);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  if (fs.existsSync(CONTENT_FILE)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(CONTENT_FILE, path.join(BACKUP_DIR, `content-${stamp}.json`));
    pruneBackups();
  }
  fs.renameSync(tmp, CONTENT_FILE);
  cached = content;
}

function pruneBackups(keep = 30) {
  const files = fs.readdirSync(BACKUP_DIR).filter(name => name.endsWith('.json')).sort();
  for (const name of files.slice(0, Math.max(0, files.length - keep))) {
    fs.rmSync(path.join(BACKUP_DIR, name), { force: true });
  }
}

// ---------- 校验 ----------
const str = (value, max) => typeof value === 'string' && value.length <= max;
const trimStr = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const isSlug = value => typeof value === 'string' && /^[a-z0-9-]{2,32}$/.test(value);
const isHue = value => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
const isUrl = value => value === '' || (typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value));
const isImageRef = value => value === '' || value === undefined || (typeof value === 'string' && (/^\/uploads\/[a-z0-9-]{8,64}\.(png|jpg|jpeg|webp|avif)$/.test(value) || /^https?:\/\/[^\s]+$/i.test(value)));

function validateItems(list, label, maxItems, errors) {
  if (!Array.isArray(list) || list.length > maxItems) {
    errors.push(`${label} 必须是数组且不超过 ${maxItems} 项`);
    return;
  }
  list.forEach((item, i) => {
    if (!item || !str(item.t, 80) || !str(item.d, 400)) errors.push(`${label}[${i}] 需要标题(≤80)与描述(≤400)`);
  });
}

function validateContent(content) {
  const errors = [];
  if (!content || typeof content !== 'object') return ['内容必须是一个对象'];

  const site = content.site;
  if (!site || typeof site !== 'object') errors.push('缺少 site');
  else {
    if (!trimStr(site.name, 40)) errors.push('站点名称必填且 ≤40 字');
    if (!trimStr(site.en, 80)) errors.push('站点英文名必填且 ≤80 字');
    if (!str(site.tagline || '', 120)) errors.push('标语 ≤120 字');
    if (!str(site.intro || '', 400)) errors.push('简介 ≤400 字');
    if (!str(site.introNote || '', 80)) errors.push('简介注 ≤80 字');
    if (!str(site.node || '', 60)) errors.push('节点标识 ≤60 字');
    if (!str(site.disclaimer || '', 400)) errors.push('免责声明 ≤400 字');
    if (!str(site.copyright || '', 120)) errors.push('版权行 ≤120 字');
  }

  const leaders = content.leaders;
  if (!Array.isArray(leaders) || leaders.length < 1 || leaders.length > 20) errors.push('负责人需要 1–20 位');
  else {
    const slugs = new Set();
    const insts = new Set();
    leaders.forEach((leader, i) => {
      if (!leader || !isSlug(leader.slug)) errors.push(`负责人[${i}] slug 无效`);
      else if (slugs.has(leader.slug)) errors.push(`负责人 slug 重复：${leader.slug}`);
      else slugs.add(leader.slug);
      if (!trimStr(leader.name, 40)) errors.push(`负责人[${i}] 姓名必填且 ≤40 字`);
      if (!str(leader.en || '', 60)) errors.push(`负责人[${i}] 英文名 ≤60 字`);
      if (!str(leader.glyph || '', 4)) errors.push(`负责人[${i}] 字形 ≤4 字`);
      if (!str(leader.role || '', 60)) errors.push(`负责人[${i}] 职务 ≤60 字`);
      if (!str(leader.roleEn || '', 80)) errors.push(`负责人[${i}] 英文职务 ≤80 字`);
      if (!FIELD_SLUGS.includes(leader.inst)) errors.push(`负责人[${i}] 所属领域无效`);
      else if (insts.has(leader.inst)) errors.push(`领域 ${leader.inst} 已有负责人`);
      else insts.add(leader.inst);
      if (!isHue(leader.hue)) errors.push(`负责人[${i}] 色值需要 #RRGGBB`);
      if (!isImageRef(leader.image)) errors.push(`负责人[${i}] 图片地址无效（只允许 /uploads/... 或 http(s) 链接）`);
    });
  }

  const institutes = content.institutes;
  if (!Array.isArray(institutes) || institutes.length < 1 || institutes.length > 10) errors.push('研究院所需要 1–10 个');
  else {
    const slugs = new Set();
    institutes.forEach((field, i) => {
      if (!field || !FIELD_SLUGS.includes(field.slug)) errors.push(`研究院所[${i}] slug 无效`);
      else if (slugs.has(field.slug)) errors.push(`研究院所 slug 重复：${field.slug}`);
      else slugs.add(field.slug);
      for (const key of ['no', 'cn', 'en', 'code', 'short', 'tag']) {
        if (!str(field[key] || '', 80)) errors.push(`研究院所[${i}] ${key} ≤80 字`);
      }
      if (!Array.isArray(field.intro) || field.intro.length > 6 || field.intro.some(p => !str(p, 800))) {
        errors.push(`研究院所[${i}] intro 需要数组（≤6 段，每段 ≤800 字）`);
      }
      if (field.force) {
        validateItems(field.units || [], `研究院所[${i}].units`, 12, errors);
        validateItems(field.equipment || [], `研究院所[${i}].equipment`, 12, errors);
        validateItems(field.duties || [], `研究院所[${i}].duties`, 12, errors);
      } else {
        validateItems(field.directions || [], `研究院所[${i}].directions`, 8, errors);
        validateItems(field.facilities || [], `研究院所[${i}].facilities`, 8, errors);
      }
    });
  }

  const projects = content.projects;
  if (!Array.isArray(projects) || projects.length > 200) errors.push('项目必须是数组且 ≤200 条');
  else {
    const codes = new Set();
    projects.forEach((project, i) => {
      if (!project || !/^[A-Z0-9-]{3,24}$/.test(String(project.code || ''))) errors.push(`项目[${i}] 编号需 3–24 位大写字母/数字/连字符`);
      else if (codes.has(project.code)) errors.push(`项目编号重复：${project.code}`);
      else codes.add(project.code);
      if (!trimStr(project.name, 60)) errors.push(`项目[${i}] 名称必填且 ≤60 字`);
      if (!FIELD_SLUGS.includes(project.inst)) errors.push(`项目[${i}] 所属领域无效`);
      if (!str(project.desc || '', 400)) errors.push(`项目[${i}] 简介 ≤400 字`);
      if (!Number.isInteger(project.progress) || project.progress < 0 || project.progress > 100) errors.push(`项目[${i}] 进度需 0–100 整数`);
      if (!PROJECT_STATUS.includes(project.status)) errors.push(`项目[${i}] 状态无效`);
    });
  }

  const contact = content.contact;
  if (!contact || typeof contact !== 'object') errors.push('缺少 contact');
  else {
    if (!str(contact.email || '', 80)) errors.push('邮箱 ≤80 字');
    if (!str(contact.phone || '', 40)) errors.push('电话 ≤40 字');
    if (!str(contact.location || '', 80)) errors.push('位置 ≤80 字');
    if (!Array.isArray(contact.socials) || contact.socials.length > 8) errors.push('社交账号 ≤8 条');
    else contact.socials.forEach((social, i) => {
      if (!social || !str(social.name || '', 24) || !str(social.handle || '', 40)) errors.push(`社交[${i}] 名称/账号格式有误`);
      if (!isUrl(social.url)) errors.push(`社交[${i}] 链接需要 http(s) 或留空`);
    });
  }

  if (errors.length) return errors;
  return [];
}

// ---------- 会话 ----------
const b64url = buf => Buffer.from(buf).toString('base64url');
function sign(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}
function issueSession() {
  const payload = b64url(JSON.stringify({ sub: ADMIN_USER, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + SESSION_TTL }));
  return `${payload}.${sign(payload)}`;
}
function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || data.exp * 1000 < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
function parseCookies(header = '') {
  const out = {};
  for (const part of String(header).split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}
function sessionOf(req) {
  return verifySession(parseCookies(req.headers.cookie).drc_admin);
}

// ---------- 登录限流 ----------
const attempts = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= 10;
}
function noteAttempt(ip, ok) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (ok) {
    attempts.delete(ip);
    return;
  }
  if (!entry || entry.resetAt < now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  else entry.count += 1;
}

// ---------- HTTP ----------
function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : Buffer.isBuffer(body) ? 'application/octet-stream' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(payload);
}
const json = (res, status, body, headers) => send(res, status, body, { 'Content-Type': 'application/json; charset=utf-8', ...headers });

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function serveFile(res, filePath, maxAge = 'no-cache') {
  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) throw Object.assign(new Error('not a file'), { code: 'ENOENT' });
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': maxAge,
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  } catch {
    json(res, 404, { error: 'not found' });
  }
}

function sniffImage(buffer) {
  if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'png';
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const { pathname } = url;
  const method = req.method || 'GET';
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

  try {
    // --- 健康检查 ---
    if (pathname === '/api/health') return json(res, 200, { ok: true, revision: readContent()?.revision ?? 0 });

    // --- 内容读取（公开） ---
    if (pathname === '/api/content' && method === 'GET') {
      const content = readContent();
      if (!content) return json(res, 503, { error: 'content not initialized' });
      return json(res, 200, { revision: content.revision ?? 0, updatedAt: content.updatedAt ?? '', content });
    }

    // --- 会话 ---
    if (pathname === '/api/auth/session' && method === 'GET') {
      const session = sessionOf(req);
      return json(res, 200, { authenticated: Boolean(session), user: session?.sub ?? null });
    }
    if (pathname === '/api/auth/login' && method === 'POST') {
      if (rateLimited(ip)) return json(res, 429, { error: '尝试次数过多，请 15 分钟后再试' });
      const body = JSON.parse((await readBody(req, 4096)).toString('utf8') || '{}');
      const given = crypto.scryptSync(String(body.password ?? ''), 'drc-admin-v1', 32);
      const ok = given.length === passwordHash.length && crypto.timingSafeEqual(given, passwordHash);
      const userOk = String(body.username ?? ADMIN_USER) === ADMIN_USER;
      noteAttempt(ip, ok && userOk);
      if (!ok || !userOk) return json(res, 401, { error: '账号或密码不正确' });
      const secure = (req.headers['x-forwarded-proto'] || '').includes('https') ? '; Secure' : '';
      return json(res, 200, { ok: true, user: ADMIN_USER }, {
        'Set-Cookie': `drc_admin=${issueSession()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL}${secure}`,
      });
    }
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const secure = (req.headers['x-forwarded-proto'] || '').includes('https') ? '; Secure' : '';
      return json(res, 200, { ok: true }, { 'Set-Cookie': `drc_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}` });
    }

    // --- 写操作：需要会话 + CSRF 头 ---
    const session = sessionOf(req);
    const needsAuth = pathname.startsWith('/api/content') && method !== 'GET' || pathname.startsWith('/api/upload');
    if (needsAuth) {
      if (!session) return json(res, 401, { error: '未登录或会话已过期' });
      if (req.headers['x-drc-admin'] !== '1') return json(res, 400, { error: '缺少 X-DRC-Admin 头' });
    }

    if (pathname === '/api/content' && method === 'PUT') {
      const body = JSON.parse((await readBody(req, 4 * 1024 * 1024)).toString('utf8') || '{}');
      const errors = validateContent(body.content);
      if (errors.length) return json(res, 400, { error: '内容校验未通过', errors: errors.slice(0, 20) });
      const next = {
        ...body.content,
        revision: (readContent()?.revision ?? 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      writeContentAtomic(next);
      revision = next.revision;
      return json(res, 200, { ok: true, revision: next.revision, updatedAt: next.updatedAt });
    }

    if (pathname === '/api/upload' && method === 'POST') {
      const raw = await readBody(req, MAX_UPLOAD);
      const kind = sniffImage(raw);
      if (!kind) return json(res, 415, { error: '只接受 PNG / JPEG / WebP 图片' });
      const hash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
      const name = `${hash}.${kind}`;
      await fsp.writeFile(path.join(UPLOAD_DIR, name), raw, { mode: 0o644 });
      return json(res, 200, { url: `/uploads/${name}`, bytes: raw.length });
    }

    // --- 上传图片（公开读，文件名内容寻址） ---
    if (pathname.startsWith('/uploads/')) {
      const name = path.basename(pathname);
      if (!/^[a-z0-9-]{8,64}\.(png|jpg|jpeg|webp|avif)$/.test(name)) return json(res, 404, { error: 'not found' });
      return serveFile(res, path.join(UPLOAD_DIR, name), 'public, max-age=31536000, immutable');
    }

    // --- 管理界面静态文件 ---
    if (pathname === '/admin' || pathname === '/admin/') return serveFile(res, path.join(ADMIN_DIR, 'index.html'));
    if (pathname.startsWith('/admin/')) {
      const rel = pathname.slice('/admin/'.length);
      if (!/^[a-zA-Z0-9._-]+$/.test(rel)) return json(res, 404, { error: 'not found' });
      return serveFile(res, path.join(ADMIN_DIR, rel));
    }

    return json(res, 404, { error: 'not found' });
  } catch (error) {
    const status = error?.status || 500;
    if (status === 413) return json(res, 413, { error: '请求体过大' });
    console.error('[error]', method, pathname, error?.message || error);
    return json(res, status, { error: 'server error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[drc-admin] listening on :${PORT} data=${DATA_DIR} revision=${readContent()?.revision ?? 'none'}`);
});
