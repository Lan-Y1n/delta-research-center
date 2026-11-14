import type { CSSProperties } from 'react';
import type { Leader } from '../../data/types';
import { PLATE_COPY } from '../../data/site';
export default function Plate({ name, en, glyph, hue, no, redacted, image }: Pick<Leader, 'name' | 'en' | 'glyph' | 'hue' | 'no' | 'redacted' | 'image'>) {
  return <div className={`plate ${redacted ? 'is-redacted' : ''}`} style={{ '--hue': hue } as CSSProperties} role="img" aria-label={`${name} · ${redacted ? `${PLATE_COPY.redactedEn} · ${PLATE_COPY.removed}` : PLATE_COPY.portrait}`}>
    {image && !redacted ? <img className="plate-image" src={image} alt={name} draggable={false} /> : <><span className="plate-grid" aria-hidden="true" /><span className="plate-glyph" aria-hidden="true">{glyph}</span></>}
    <span className="plate-idx">{no}</span><span className="plate-name-v">{name}</span>
    {redacted && <span className="plate-redact"><b>{PLATE_COPY.redacted}</b><strong>{PLATE_COPY.redactedEn}</strong><em>{PLATE_COPY.removed}</em></span>}
    <span className="plate-meta"><b>{en}</b><i>{PLATE_COPY.portrait}</i></span>
  </div>;
}
