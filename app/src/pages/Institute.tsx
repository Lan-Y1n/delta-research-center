import { useParams } from 'react-router-dom';
import { getInstitute, leaderOf } from '../data/institutes';
import { projectsOf } from '../data/projects';
import { ABOUT_COPY, FIELD_COPY, SITE } from '../data/site';
import InstituteHero from '../components/institute/InstituteHero';
import DirectionList from '../components/institute/DirectionList';
import FacilityGrid from '../components/institute/FacilityGrid';
import LeaderCard from '../components/institute/LeaderCard';
import ProjectList from '../components/institute/ProjectList';
import DataPanel from '../components/institute/DataPanel';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import NotFound from './NotFound';

export default function Institute() {
  const { slug } = useParams();
  const institute = getInstitute(slug);
  if (!institute) return <NotFound />;
  const leader = leaderOf(institute);
  const projectCount = String(projectsOf(institute.slug).length).padStart(2, '0');
  const force = FIELD_COPY.force;

  return <section className={`page page-field${institute.force ? ' page-force' : ''}`}>
    <InstituteHero institute={institute} />
    <div className="field-body"><div className="field-main">
      <Reveal className="blk"><SectionHeading no="01" title={institute.force ? force.intro : FIELD_COPY.intro} badge={SITE.pending} />
        {institute.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </Reveal>
      {institute.force ? <>
        <Reveal className="blk"><SectionHeading no="02" title={force.organization} badge={SITE.pending} />
          <div className="org"><div className="org-top"><b>{force.organizationRoot.title}</b><i>{force.organizationRoot.en}</i></div>
            <div className="org-line" aria-hidden="true" /><div className="org-cols">{force.organizationChildren.map(unit => <div className="org-col" key={unit.title}><b>{unit.title}</b><i>{unit.en}</i></div>)}</div>
            <p className="ph">{force.organizationNote}</p>
          </div>
        </Reveal>
        <Reveal className="blk"><SectionHeading no="03" title={force.units} badge={SITE.pending} /><FacilityGrid items={institute.units} /></Reveal>
        <Reveal className="blk"><SectionHeading no="04" title={force.equipment} badge={SITE.pending} />
          <div className="spec-list" role="table" aria-label={force.equipment}>{institute.equipment.map((equipment, index) => <div className="spec-row" role="row" key={equipment.t}>
            <span className="sp-no" role="cell">{String(index + 1).padStart(2, '0')}</span><b role="cell">{equipment.t}</b><span className="sp-d" role="cell">{equipment.d}</span><span className="ph-badge" role="cell">{SITE.placeholder}</span>
          </div>)}</div>
        </Reveal>
        <Reveal className="blk"><SectionHeading no="05" title={force.duties} badge={SITE.pending} /><FacilityGrid items={institute.duties} columns={2} /></Reveal>
        <Reveal className="blk"><SectionHeading no="06" title={force.people} badge={SITE.pending} /><p>{force.peopleSummary}</p><p className="ph">{force.peopleNote}</p></Reveal>
        <Reveal className="blk"><SectionHeading no="07" title={force.projects} badge={SITE.sample} /><ProjectList slug={institute.slug} /></Reveal>
      </> : <>
        <Reveal className="blk"><SectionHeading no="02" title={FIELD_COPY.directions} badge={SITE.pending} /><DirectionList items={institute.directions} /></Reveal>
        <Reveal className="blk"><SectionHeading no="03" title={FIELD_COPY.facilities} badge={SITE.pending} /><FacilityGrid items={institute.facilities} /></Reveal>
        <Reveal className="blk"><SectionHeading no="04" title={FIELD_COPY.projects} badge={SITE.sample} /><ProjectList slug={institute.slug} /></Reveal>
      </>}
    </div>
    <aside className="field-side">
      {leader && <LeaderCard leader={leader} />}
      <DataPanel title={FIELD_COPY.status} rows={institute.force ? [
        [FIELD_COPY.code, institute.code], [force.typeLabel, force.type], [FIELD_COPY.leader, force.leader], [FIELD_COPY.projectCount, projectCount],
      ] : [
        [FIELD_COPY.code, institute.code], [FIELD_COPY.institute, institute.cn], [FIELD_COPY.leader, leader?.name ?? '—'], [FIELD_COPY.projectCount, projectCount],
      ]}>{institute.force && <Button to="/cooperation" className="btn-block">{ABOUT_COPY.cooperation}<span aria-hidden="true">→</span></Button>}</DataPanel>
      {institute.force && <div className="side-note"><b>{force.noteTitle}</b><p>{force.note}</p></div>}
    </aside></div>
  </section>;
}
