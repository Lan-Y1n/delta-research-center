import type { Contact, Field, Leader, Project } from './types';
import { LEADERS, replaceLeaders } from './leaders';
import { INSTITUTES, replaceInstitutes } from './institutes';
import { PROJECTS, replaceProjects } from './projects';
import { CONTACT, replaceContact } from './contact';
import { HOME_COPY, SITE } from './site';

/** 后台可编辑的站点信息（其余文案仍为固定 copy） */
export interface EditableSite {
  name: string;
  en: string;
  tagline: string;
  intro: string;
  introNote: string;
  node: string;
  copyright: string;
  disclaimer: string;
}

export interface ContentSnapshot {
  site: EditableSite;
  leaders: Leader[];
  institutes: Field[];
  projects: Project[];
  contact: Contact;
  revision?: number;
  updatedAt?: string;
}

export interface ContentResponse {
  revision: number;
  updatedAt: string;
  content: ContentSnapshot;
}

const listeners = new Set<() => void>();
let version = 0;
let appliedRevision = -1;

export function subscribeContent(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function contentVersion(): number {
  return version;
}

function notify(): void {
  version += 1;
  listeners.forEach((listener) => { listener(); });
}

/** 当前生效的内容快照（供预渲染注入与种子文件生成） */
export function snapshotContent(): ContentSnapshot {
  return {
    site: {
      name: SITE.name,
      en: SITE.en,
      tagline: SITE.tagline,
      intro: HOME_COPY.intro,
      introNote: HOME_COPY.introNote,
      node: SITE.node,
      copyright: SITE.copyright,
      disclaimer: SITE.disclaimer,
    },
    leaders: LEADERS.map((leader) => ({ ...leader })),
    institutes: INSTITUTES.map((field) => ({ ...field })),
    projects: PROJECTS.map((project) => ({ ...project })),
    contact: { ...CONTACT, socials: CONTACT.socials.map((social) => ({ ...social })) },
  };
}

/** 把后台内容写进各数据模块（原址替换，组件里的导入无需改动） */
export function applyContent(input: unknown): void {
  if (!input || typeof input !== 'object') return;
  const next = input as Partial<ContentSnapshot>;

  if (next.site) {
    const site = next.site;
    if (typeof site.name === 'string') SITE.name = site.name;
    if (typeof site.en === 'string') SITE.en = site.en;
    if (typeof site.tagline === 'string') SITE.tagline = site.tagline;
    if (typeof site.intro === 'string') HOME_COPY.intro = site.intro;
    if (typeof site.introNote === 'string') HOME_COPY.introNote = site.introNote;
    if (typeof site.node === 'string') SITE.node = site.node;
    if (typeof site.copyright === 'string') SITE.copyright = site.copyright;
    if (typeof site.disclaimer === 'string') SITE.disclaimer = site.disclaimer;
  }
  if (Array.isArray(next.leaders)) replaceLeaders(next.leaders as Leader[]);
  if (Array.isArray(next.institutes)) replaceInstitutes(next.institutes as Field[]);
  if (Array.isArray(next.projects)) replaceProjects(next.projects as Project[]);
  if (next.contact) replaceContact(next.contact as Contact);

  if (typeof next.revision === 'number') appliedRevision = next.revision;
  notify();
}

/** 启动时先应用预渲染注入的内容，保证 hydration 与服务端 HTML 一致 */
export function applyBootstrapContent(): void {
  const boot = (window as unknown as { __CONTENT__?: ContentSnapshot }).__CONTENT__;
  if (boot) applyContent(boot);
}

let started = false;

/** 首次拉取 + 轮询：后台保存后最多 20 秒在其它标签页生效，本页刷新即时生效 */
export async function startContentSync(): Promise<void> {
  await refreshContent();
  if (started) return;
  started = true;
  setInterval(() => {
    if (document.visibilityState === 'visible') void refreshContent();
  }, 20000);
}

export async function refreshContent(): Promise<boolean> {
  try {
    const res = await fetch('/api/content', { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) return false;
    const data = (await res.json()) as ContentResponse;
    const revision = Number(data?.revision ?? 0);
    if (revision === appliedRevision) return false;
    applyContent({ ...data.content, revision, updatedAt: data.updatedAt });
    return true;
  } catch {
    return false;
  }
}

export function bootstrapFromWindow(): void {
  applyBootstrapContent();
}
