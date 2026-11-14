import { Link } from 'react-router-dom';
import type { Field } from '../../data/types';
import { FIELD_COPY } from '../../data/site';

export default function InstituteHero({ institute }: { institute: Field }) {
  return <div className="p-head">
    <nav className="p-crumb" aria-label="面包屑"><Link to="/">{FIELD_COPY.home}</Link><i>/</i><span>{FIELD_COPY.fields}</span><i>/</i><b>{institute.cn}</b></nav>
    <div className="p-no"><span>{institute.no}</span> / 06</div>
    <div className="p-eyebrow">{institute.en.toUpperCase()} · {institute.code}</div>
    <h1 className="p-title"><span>{institute.cn}</span><i>{institute.en}</i></h1>
    <div className="p-tag">{institute.tag}</div>
  </div>;
}
