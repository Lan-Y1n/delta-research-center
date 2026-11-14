import { NOT_FOUND_COPY } from '../data/site';
import Button from '../components/ui/Button';

export default function NotFound() {
  return <section className="page page-404"><div className="p-eyebrow">{NOT_FOUND_COPY.eyebrow}</div><h1 className="p-title"><span>{NOT_FOUND_COPY.title}</span></h1>
    <p className="ph">{NOT_FOUND_COPY.note}</p><Button to="/" variant="solid">{NOT_FOUND_COPY.back}<span aria-hidden="true">→</span></Button>
  </section>;
}
