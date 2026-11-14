import type { Leader } from '../../data/types';
import { FIELD_COPY } from '../../data/site';
import Plate from '../ui/Plate';
import Button from '../ui/Button';

export default function LeaderCard({ leader }: { leader: Leader }) {
  return <div className="leader-card">
    <div className="side-kicker">{FIELD_COPY.director}</div>
    <div className="plate-wrap"><Plate {...leader} /></div>
    <div className="lc-body"><h3 className="lc-name">{leader.name}</h3><div className="lc-role">{leader.role}</div>
      <Button to={`/leader/${leader.slug}`} variant="solid" className="btn-block lc-btn"><span>{FIELD_COPY.profile}</span><i>{FIELD_COPY.profileEn}</i></Button>
    </div>
  </div>;
}
