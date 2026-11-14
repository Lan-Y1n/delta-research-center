import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { SITE } from '../../data/site';

export default function PlaceholderSection({ no, title, note }: { no: string; title: string; note: string }) {
  return <Reveal className="blk"><SectionHeading no={no} title={title} badge={SITE.pending} /><p className="ph">{note}</p></Reveal>;
}
