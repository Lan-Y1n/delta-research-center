/* 德尔塔研究中心 · 内容后台（原生 JS，无需构建） */
(() => {
  'use strict';

  const el = id => document.getElementById(id);
  const state = { content: null, revision: 0, updatedAt: '', dirty: false, tab: 'site', selected: {} };
  const q = (root, sel) => root.querySelector(sel);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  // ---------- 通用 ----------
  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: 'same-origin',
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-DRC-Admin': '1', ...(options.headers || {}) },
    });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { error: text }; }
    if (!res.ok) throw Object.assign(new Error(body?.error || `HTTP ${res.status}`), { status: res.status, body });
    return body;
  }

  function toast(message, isError = false) {
    const node = el('toast');
    node.textContent = message;
    node.classList.toggle('is-error', isError);
    node.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('is-visible'), 2600);
  }

  function setDirty(dirty) {
    state.dirty = dirty;
    const node = el('save-state');
    node.classList.toggle('is-dirty', dirty);
    node.classList.remove('is-saved', 'is-error');
    node.textContent = dirty ? '有未保存修改' : '已同步';
  }

  const getPath = (object, path) => path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), object);
  function setPath(object, path, value) {
    const keys = path.split('.');
    let cursor = object;
    keys.slice(0, -1).forEach(key => { cursor = cursor[key]; });
    cursor[keys[keys.length - 1]] = value;
  }

  const STATUS = { planning: '筹备中', progress: '进行中', completed: '已完成', hold: '暂停' };
  const FIELDS = () => (state.content?.institutes || []).map(field => ({ slug: field.slug, cn: field.cn || field.en, force: Boolean(field.force) }));

  // ---------- 输入绑定 ----------
  function bindInputs(root) {
    root.addEventListener('input', event => {
      const target = event.target;
      const path = target.dataset.path;
      if (!path) return;
      const kind = target.dataset.kind || 'text';
      let value;
      if (kind === 'bool') value = target.checked;
      else if (kind === 'number') value = Number(target.value) || 0;
      else if (kind === 'lines') value = target.value.split('\n').map(line => line.trim()).filter(Boolean);
      else value = target.value;
      setPath(state.content, path, value);
      if (kind !== 'lines') setDirty(true);
      else { setDirty(true); }
      if (target.dataset.preview === 'image') render();
    });
    root.addEventListener('change', event => {
      const target = event.target;
      if (target.matches('[data-role="photo-input"]')) return; // 单独处理上传
    });
  }

  // ---------- 侧栏 ----------
  function renderSidebar() {
    const side = el('sidebar');
    const tab = state.tab;
    const heads = { site: '站点', leaders: '负责人', institutes: '研究院所', projects: '研究项目', contact: '合作联系' };
    let html = `<h2>${heads[tab] || '内容'}</h2>`;

    if (tab === 'leaders') {
      (state.content.leaders || []).forEach(leader => {
        const active = state.selected.leaders === leader.slug ? ' is-active' : '';
        html += `<button class="side-item${active}" data-pick="leaders" data-key="${esc(leader.slug)}"><span class="dot" style="background:${esc(leader.hue || '#65c9f4')}"></span><span class="label">${esc(leader.name)}</span><span class="code">${esc(leader.no || '')}</span></button>`;
      });
      html += `<button class="btn small side-add" data-action="add-leader">+ 新增负责人</button>`;
    } else if (tab === 'institutes') {
      (state.content.institutes || []).forEach(field => {
        const active = state.selected.institutes === field.slug ? ' is-active' : '';
        html += `<button class="side-item${active}" data-pick="institutes" data-key="${esc(field.slug)}"><span class="dot"></span><span class="label">${esc(field.cn || field.en)}</span><span class="code">${esc(field.code || '')}</span></button>`;
      });
    } else if (tab === 'projects') {
      (state.content.projects || []).forEach(project => {
        const active = state.selected.projects === project.code ? ' is-active' : '';
        html += `<button class="side-item${active}" data-pick="projects" data-key="${esc(project.code)}"><span class="dot"></span><span class="label">${esc(project.name)}</span><span class="code">${project.progress}%</span></button>`;
      });
      html += `<button class="btn small side-add" data-action="add-project">+ 新增项目</button>`;
    } else {
      html += `<button class="side-item is-active"><span class="dot"></span><span class="label">${heads[tab]}</span></button>`;
    }
    side.innerHTML = html;
  }

  // ---------- 面板 ----------
  function panelSite() {
    const site = state.content.site || {};
    return `<div class="panel-head"><div><h1>站点信息</h1><p>出现在导航、首页首屏与页脚的基础文案。</p></div></div>
    <div class="card">
      <div class="grid-2">
        ${fieldInput('中文名称', 'site.name', site.name, 'name')}
        ${fieldInput('英文名称', 'site.en', site.en)}
      </div>
      ${fieldInput('标语 / 副标题', 'site.tagline', site.tagline)}
      ${fieldArea('简介段落', 'site.intro', site.intro, '介绍研究机构的一段话，显示在首页首屏。')}
      ${fieldInput('简介脚注', 'site.introNote', site.introNote)}
      <div class="grid-2">
        ${fieldInput('节点标识', 'site.node', site.node, '如 NODE · 192.168.10.60')}
        ${fieldInput('版权行', 'site.copyright', site.copyright)}
      </div>
      ${fieldArea('免责声明', 'site.disclaimer', site.disclaimer)}
      <p class="hint">保存后立即生效：前台会重新拉取内容并刷新渲染。</p>
    </div>`;
  }

  function fieldInput(label, path, value, placeholder = '') {
    return `<label class="field"><span>${esc(label)}</span><input data-path="${path}" value="${esc(value)}" placeholder="${esc(placeholder)}" /></label>`;
  }
  function fieldArea(label, path, value, hint = '') {
    const isArray = Array.isArray(value);
    const text = isArray ? value.join('\n') : value ?? '';
    return `<label class="field"><span>${esc(label)}</span><textarea data-path="${path}" data-kind="${isArray ? 'lines' : 'text'}">${esc(text)}</textarea>${hint ? `<em class="hint">${esc(hint)}</em>` : ''}</label>`;
  }

  function panelLeaders() {
    const leaders = state.content.leaders || [];
    if (!leaders.length) return `<div class="empty">还没有负责人，先在左侧新增。</div>`;
    const leader = leaders.find(item => item.slug === state.selected.leaders) || leaders[0];
    state.selected.leaders = leader.slug;
    const idx = leaders.indexOf(leader);
    const p = `leaders.${idx}`;
    return `<div class="panel-head"><div><h1>${esc(leader.name)}</h1><p>首页轮播、院所页负责人卡与个人详情页共用这份数据。</p></div>
      <button class="btn danger small" data-action="del-leader">删除此人</button></div>
    <div class="card">
      <div class="photo-box">
        <div class="photo-preview" ${leader.image ? `style="background-image:url('${esc(leader.image)}')"` : ''}>${leader.image ? '' : '9:16<br/>人物照片'}</div>
        <div class="photo-actions">
          <label class="file-label">上传照片<input type="file" accept="image/png,image/jpeg,image/webp" data-role="photo-input" data-path="${p}.image" /></label>
          ${fieldInput('或填入图片地址', `${p}.image`, leader.image, '/uploads/xxxx.jpg')}
          <button class="btn ghost small" data-action="clear-image" data-path="${p}.image">移除照片</button>
          <span class="hint">建议 9:16 竖图，≥720×1280；上传上限 4 MB。</span>
        </div>
      </div>
      <div class="grid-3">
        ${fieldInput('编号', `${p}.no`, leader.no, '01')}
        ${fieldInput('姓名', `${p}.name`, leader.name)}
        ${fieldInput('英文名', `${p}.en`, leader.en)}
      </div>
      <div class="grid-3">
        ${fieldInput('占位字形', `${p}.glyph`, leader.glyph, '一个汉字或符号')}
        ${fieldInput('主题色', `${p}.hue`, leader.hue, '#65C9F4')}
        <label class="field"><span>所属领域</span><select data-path="${p}.inst">${FIELDS().filter(field => !field.force).map(field => `<option value="${field.slug}" ${field.slug === leader.inst ? 'selected' : ''}>${esc(field.cn)}</option>`).join('')}</select></label>
      </div>
      <div class="grid-2">
        ${fieldInput('职务', `${p}.role`, leader.role)}
        ${fieldInput('英文职务', `${p}.roleEn`, leader.roleEn)}
      </div>
      <label class="field" style="grid-auto-flow:column;justify-content:start;align-items:center;gap:10px"><input type="checkbox" data-path="${p}.redacted" data-kind="bool" ${leader.redacted ? 'checked' : ''} /><span>数据删除（照片与档案以遮蔽样式展示）</span></label>
    </div>`;
  }

  function itemsEditor(label, basePath, items, hint) {
    const rows = (items || []).map((item, i) => `<div class="item-row">
      <input data-path="${basePath}.${i}.t" value="${esc(item.t)}" placeholder="标题" />
      <textarea data-path="${basePath}.${i}.d" placeholder="描述">${esc(item.d)}</textarea>
      <button class="btn danger small" data-action="del-item" data-path="${basePath}.${i}">删</button>
    </div>`).join('');
    return `<div class="section-title"><span>${esc(label)}</span><button class="btn small" data-action="add-item" data-path="${basePath}">+ 添加</button></div>
      ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
      <div class="rows">${rows || '<div class="empty">暂无条目</div>'}</div>`;
  }

  function panelInstitutes() {
    const fields = state.content.institutes || [];
    if (!fields.length) return `<div class="empty">还没有研究院所。</div>`;
    const field = fields.find(item => item.slug === state.selected.institutes) || fields[0];
    state.selected.institutes = field.slug;
    const idx = fields.indexOf(field);
    const p = `institutes.${idx}`;
    const lists = field.force
      ? itemsEditor('下属单位', `${p}.units`, field.units, '展示在“组织架构”区块。') +
        itemsEditor('装备与技术体系', `${p}.equipment`, field.equipment) +
        itemsEditor('任务定位与职能', `${p}.duties`, field.duties)
      : itemsEditor('主要研究方向', `${p}.directions`, field.directions, '每项由标题 + 描述组成。') +
        itemsEditor('研究设施与实验条件', `${p}.facilities`, field.facilities);
    return `<div class="panel-head"><div><h1>${esc(field.cn)}</h1><p>${field.force ? '武装力量是独立分区，不绑定负责人。' : '领域页；负责人信息在“负责人”页维护。'}</p></div></div>
    <div class="card">
      <div class="grid-3">
        ${fieldInput('编号', `${p}.no`, field.no)}
        ${fieldInput('中文名', `${p}.cn`, field.cn)}
        ${fieldInput('英文名', `${p}.en`, field.en)}
      </div>
      <div class="grid-3">
        ${fieldInput('代码', `${p}.code`, field.code)}
        ${fieldInput('简称', `${p}.short`, field.short)}
        ${fieldInput('标签行', `${p}.tag`, field.tag, '物质 · 能量 · 测量')}
      </div>
      ${fieldArea('院所简介（每行一段）', `${p}.intro`, field.intro)}
      ${lists}
    </div>`;
  }

  function panelProjects() {
    const projects = state.content.projects || [];
    if (!projects.length) return `<div class="empty">还没有项目，先在左侧新增。</div>`;
    const project = projects.find(item => item.code === state.selected.projects) || projects[0];
    state.selected.projects = project.code;
    const p = `projects.${projects.indexOf(project)}`;
    return `<div class="panel-head"><div><h1>${esc(project.name)}</h1><p>首页项目卡与项目详情页读取同一条数据，进度条按百分比渲染。</p></div>
      <button class="btn danger small" data-action="del-project">删除此项目</button></div>
    <div class="card">
      <div class="grid-3">
        ${fieldInput('项目编号', `${p}.code`, project.code, 'DRC-PHY-2401')}
        ${fieldInput('项目名称', `${p}.name`, project.name)}
        <label class="field"><span>所属领域</span><select data-path="${p}.inst">${FIELDS().map(field => `<option value="${field.slug}" ${field.slug === project.inst ? 'selected' : ''}>${esc(field.cn)}${field.force ? '（武装力量）' : ''}</option>`).join('')}</select></label>
      </div>
      ${fieldArea('项目简介', `${p}.desc`, project.desc)}
      <div class="grid-3">
        <label class="field"><span>进度（0–100）</span><input type="number" min="0" max="100" data-path="${p}.progress" data-kind="number" value="${project.progress}" /></label>
        <label class="field"><span>状态</span><select data-path="${p}.status">${Object.entries(STATUS).map(([value, label]) => `<option value="${value}" ${value === project.status ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
      </div>
    </div>`;
  }

  function panelContact() {
    const contact = state.content.contact || { socials: [] };
    const socials = (contact.socials || []).map((social, i) => `<div class="item-row">
      <input data-path="contact.socials.${i}.name" value="${esc(social.name)}" placeholder="平台" />
      <input data-path="contact.socials.${i}.handle" value="${esc(social.handle)}" placeholder="@账号" />
      <div style="display:flex;gap:8px"><input data-path="contact.socials.${i}.url" value="${esc(social.url)}" placeholder="https://" /><button class="btn danger small" data-action="del-item" data-path="contact.socials.${i}">删</button></div>
    </div>`).join('');
    return `<div class="panel-head"><div><h1>合作联系</h1><p>合作页的邮箱、电话、位置与社交媒体。留空则前台显示占位样式。</p></div></div>
    <div class="card">
      <div class="grid-3">
        ${fieldInput('邮箱', 'contact.email', contact.email)}
        ${fieldInput('联系方式', 'contact.phone', contact.phone)}
        ${fieldInput('所在位置', 'contact.location', contact.location)}
      </div>
    </div>
    <div class="card">
      <div class="section-title"><span>社交媒体</span><button class="btn small" data-action="add-social">+ 添加</button></div>
      <div class="rows">${socials || '<div class="empty">暂无社交账号</div>'}</div>
    </div>`;
  }

  function renderPanel() {
    const body = el('editor');
    const map = { site: panelSite, leaders: panelLeaders, institutes: panelInstitutes, projects: panelProjects, contact: panelContact };
    body.innerHTML = (map[state.tab] || panelSite)();
    el('meta').textContent = `revision ${state.revision || 0} · 更新于 ${state.updatedAt ? new Date(state.updatedAt).toLocaleString('zh-CN', { hour12: false }) : '—'}`;
  }

  function render() {
    renderSidebar();
    renderPanel();
    document.querySelectorAll('#tabs button').forEach(button => button.classList.toggle('is-active', button.dataset.tab === state.tab));
  }

  // ---------- 交互 ----------
  function wire() {
    bindInputs(el('editor'));

    el('tabs').addEventListener('click', event => {
      const button = event.target.closest('button[data-tab]');
      if (!button) return;
      state.tab = button.dataset.tab;
      render();
    });

    el('sidebar').addEventListener('click', event => {
      const pick = event.target.closest('[data-pick]');
      if (pick) {
        state.selected[pick.dataset.pick] = pick.dataset.key;
        render();
        return;
      }
      const action = event.target.closest('[data-action]');
      if (action) handleAction(action.dataset.action, action);
    });

    el('editor').addEventListener('click', event => {
      const action = event.target.closest('[data-action]');
      if (action) handleAction(action.dataset.action, action);
    });

    el('editor').addEventListener('change', async event => {
      const input = event.target;
      if (input.dataset.role !== 'photo-input') return;
      const file = input.files && input.files[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) return toast('图片超过 4 MB', true);
      try {
        toast('上传中…');
        const res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'X-DRC-Admin': '1', 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || '上传失败');
        setPath(state.content, input.dataset.path, body.url);
        setDirty(true);
        render();
        toast('照片已上传，记得保存');
      } catch (error) {
        toast(error.message, true);
      }
    });

    el('save').addEventListener('click', save);
    el('revert').addEventListener('click', () => { if (state.dirty && !confirm('放弃所有未保存的修改？')) return; load(); });
    el('logout').addEventListener('click', async () => {
      await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
      location.reload();
    });

    window.addEventListener('beforeunload', event => {
      if (state.dirty) { event.preventDefault(); event.returnValue = ''; }
    });
    window.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
    });
  }

  function handleAction(action, node) {
    const basePath = node.dataset.path;
    if (action === 'add-leader') {
      const used = new Set((state.content.leaders || []).map(leader => leader.inst));
      const field = FIELDS().find(item => !item.force && !used.has(item.slug)) || FIELDS()[0];
      const slug = `leader-${Date.now().toString(36).slice(-4)}`;
      state.content.leaders.push({ slug, no: String(state.content.leaders.length + 1).padStart(2, '0'), name: '新负责人', en: 'NEW DIRECTOR', glyph: '新', role: `${field?.cn || ''}负责人`, roleEn: 'DIRECTOR', inst: field?.slug || 'physics', hue: '#65C9F4', image: '' });
      state.selected.leaders = slug;
      setDirty(true);
      render();
      return;
    }
    if (action === 'del-leader') {
      if (!confirm('删除该负责人？关联院所页会失去负责人卡片。')) return;
      state.content.leaders = state.content.leaders.filter(leader => leader.slug !== state.selected.leaders);
      state.selected.leaders = state.content.leaders[0]?.slug;
      setDirty(true);
      render();
      return;
    }
    if (action === 'add-project') {
      const code = `DRC-NEW-${String(Date.now()).slice(-4)}`;
      state.content.projects.unshift({ code, name: '新研究项目', inst: FIELDS()[0]?.slug || 'physics', desc: '项目简介待补充。', progress: 0, status: 'planning' });
      state.selected.projects = code;
      setDirty(true);
      render();
      return;
    }
    if (action === 'del-project') {
      if (!confirm('删除该项目？')) return;
      state.content.projects = state.content.projects.filter(project => project.code !== state.selected.projects);
      state.selected.projects = state.content.projects[0]?.code;
      setDirty(true);
      render();
      return;
    }
    if (action === 'add-item') {
      const list = getPath(state.content, basePath);
      if (!Array.isArray(list)) return;
      list.push({ t: '新条目', d: '' });
      setDirty(true);
      render();
      return;
    }
    if (action === 'del-item') {
      const keys = basePath.split('.');
      const index = Number(keys.pop());
      const list = getPath(state.content, keys.join('.'));
      if (Array.isArray(list) && Number.isInteger(index)) list.splice(index, 1);
      setDirty(true);
      render();
      return;
    }
    if (action === 'add-social') {
      state.content.contact.socials.push({ name: '平台', handle: '@your-handle', url: '' });
      setDirty(true);
      render();
      return;
    }
    if (action === 'clear-image') {
      setPath(state.content, basePath, '');
      setDirty(true);
      render();
      return;
    }
  }

  async function save() {
    const button = el('save');
    button.disabled = true;
    try {
      const res = await api('/api/content', { method: 'PUT', body: JSON.stringify({ content: state.content }) });
      state.revision = res.revision;
      state.updatedAt = res.updatedAt;
      state.content.revision = res.revision;
      state.content.updatedAt = res.updatedAt;
      setDirty(false);
      el('save-state').classList.add('is-saved');
      el('save-state').textContent = '已保存';
      renderPanel();
      toast('已保存并发布');
    } catch (error) {
      el('save-state').classList.add('is-error');
      el('save-state').textContent = '保存失败';
      const details = error.body?.errors?.slice(0, 3).join('；');
      toast(details || error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  async function load() {
    const data = await api('/api/content');
    state.content = data.content;
    state.revision = data.revision;
    state.updatedAt = data.updatedAt;
    state.tab = 'site';
    state.selected = {
      leaders: state.content.leaders?.[0]?.slug,
      institutes: state.content.institutes?.[0]?.slug,
      projects: state.content.projects?.[0]?.code,
    };
    setDirty(false);
    render();
  }

  async function boot() {
    let session = { authenticated: false };
    try { session = await api('/api/auth/session'); } catch { /* 忽略 */ }
    if (!session.authenticated) {
      el('login').hidden = false;
      el('shell').hidden = true;
      el('login-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.target;
        el('login-error').textContent = '';
        try {
          await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: form.username.value, password: form.password.value }) });
          el('login').hidden = true;
          el('shell').hidden = false;
          wire();
          await load();
          toast('已登录');
        } catch (error) {
          el('login-error').textContent = error.message;
        }
      });
      return;
    }
    el('login').hidden = true;
    el('shell').hidden = false;
    wire();
    await load();
  }

  boot().catch(error => {
    el('login').hidden = false;
    el('login-error').textContent = `后台加载失败：${error.message}`;
  });
})();
