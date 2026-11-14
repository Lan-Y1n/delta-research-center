import { useEffect, useRef, useState } from 'react';
import { CONTACT } from '../data/contact';
import { COOPERATION_COPY, SITE } from '../data/site';
import Reveal from '../components/ui/Reveal';

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return; } catch { /* Fall through for browsers without clipboard permission. */ }
  }
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = document.getSelection();
  const savedRanges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.append(textarea);
  textarea.select();
  try { if (!document.execCommand('copy')) throw new Error('Copy unavailable'); }
  finally {
    textarea.remove();
    focused?.focus({ preventScroll: true });
    selection?.removeAllRanges();
    savedRanges.forEach(range => selection?.addRange(range));
  }
}

export default function Cooperation() {
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); }; }, []);
  const copy = async (value: string, label: string) => {
    let message: string;
    try { await copyText(value); message = `${COOPERATION_COPY.copied}${label}`; }
    catch { message = COOPERATION_COPY.copyFailed; }
    if (!mounted.current) return;
    if (timer.current) clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(''), 2600);
  };
  const rows = [
    { label: COOPERATION_COPY.phone, value: CONTACT.phone },
    { label: COOPERATION_COPY.location, value: CONTACT.location },
    { label: COOPERATION_COPY.email, value: CONTACT.email },
  ];

  return <section className="page page-coop">
    <div className="coop-head"><div className="p-eyebrow">{COOPERATION_COPY.eyebrow}</div><h1 className="p-title"><span>{COOPERATION_COPY.title}</span><i>{COOPERATION_COPY.en}</i></h1>
      <p className="coop-lede">{COOPERATION_COPY.intro}<span className="ph">{COOPERATION_COPY.note}</span></p>
    </div>
    <div className="coop-grid"><div className="coop-main">
      <a className="coop-mail" href={`mailto:${CONTACT.email}`} aria-label={`${COOPERATION_COPY.emailLabel} ${CONTACT.email} ${SITE.placeholder}`}>
        <span className="cm-k">{COOPERATION_COPY.emailLabel} <span className="ph-badge">{SITE.placeholder}</span></span><span className="cm-v">{CONTACT.email}</span><span className="cm-note">{COOPERATION_COPY.emailNote}</span><span className="arw" aria-hidden="true">↗</span>
      </a>
      <div className="coop-rows">{rows.map(row => <div className="coop-row" key={row.label}>
        <span className="cr-k">{row.label}</span><span className="cr-v">{row.value}</span><span className="ph-badge">{SITE.placeholder}</span>
        <button className="copy-btn" type="button" aria-label={`${COOPERATION_COPY.copy}${row.label}`} onClick={() => { void copy(row.value, row.label); }}>{COOPERATION_COPY.copy}</button>
      </div>)}</div>
      <Reveal className="coop-extra">{COOPERATION_COPY.extras.map(extra => <div className="ce-block" key={extra.title}><b>{extra.title}</b><p>{extra.body}</p><span className="ph-badge">{SITE.pending}</span></div>)}</Reveal>
    </div><aside className="coop-side"><div className="side-panel"><div className="side-kicker">{COOPERATION_COPY.social}</div>
      <div className="socials">{CONTACT.socials.map(social => <a className="social" href={social.url} target="_blank" rel="noopener noreferrer" key={social.name} aria-label={`${social.name} ${COOPERATION_COPY.pending}`}>
        <span className="so-name">{social.name}</span><span className="so-handle">{social.handle}<i>{COOPERATION_COPY.pending} · {SITE.placeholder}</i></span><span className="arw" aria-hidden="true">↗</span>
      </a>)}</div><p className="ph">{COOPERATION_COPY.socialNote}</p>
    </div></aside></div>
    <div className={`toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{toast}</div>
  </section>;
}
