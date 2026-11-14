export type InstituteSlug = 'physics' | 'biology' | 'chemistry' | 'mathematics' | 'philosophy';
export type FieldSlug = InstituteSlug | 'armed-forces';
export type LeaderSlug = 'lanyin' | 'huishi' | 'redact-chem' | 'redact-math' | 'zhiyan';
export type ProjectStatus = 'planning' | 'progress' | 'completed' | 'hold';
export interface ContentItem { t: string; d: string }
export interface Leader {
  slug: LeaderSlug; no: string; name: string; en: string; glyph: string;
  role: string; roleEn: string; inst: InstituteSlug; hue: string;
  redacted?: boolean; image?: string;
}
interface FieldBase {
  no: string; cn: string; en: string; code: string; short: string;
  tag: string; intro: string[];
}
export interface Institute extends FieldBase {
  slug: InstituteSlug; leader: LeaderSlug; force?: false;
  directions: ContentItem[]; facilities: ContentItem[];
}
export interface ArmedForcesInstitute extends FieldBase {
  slug: 'armed-forces'; leader: null; force: true;
  units: ContentItem[]; equipment: ContentItem[]; duties: ContentItem[];
}
export type Field = Institute | ArmedForcesInstitute;
export interface Project {
  code: string; name: string; inst: FieldSlug; desc: string;
  progress: number; status: ProjectStatus;
}
export interface Status { cn: string; en: string; cls: ProjectStatus }
export interface Contact {
  email: string; phone: string; location: string;
  socials: { name: string; handle: string; url: string }[];
}
