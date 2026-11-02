import { EVENTS } from '../data/plan.js';
import { SimpleRow } from './plan/ui.jsx';

const SPOTS = [
  ['After-party', 'De La Nonna', "Arts District, minutes from Seventh/Place. Buyout ~100–120, patio, and Let's Go Disco next door."],
  ['Bach dinner', 'Manuela', 'Arts District garden at Hauser & Wirth. Garden buyout ~80, no room fee, food from ~$40pp.'],
  ['Intimate ceremony', 'Kim Sing Theatre', 'Chinatown. ~75 seated, courtyard, BYO catering, from ~$3k.'],
  ['Intimate ceremony', 'Secret House of Ivy', 'Downey. Ivy garden up to ~92, BYO alcohol.'],
  ['Intimate ceremony', 'Maxwell House', 'Old Town Pasadena. Boutique package ~40, flat rate, nonprofit.'],
  ['Bach party', 'Idle Hour', 'NoHo. 1941 barrel-shaped bar, events up to ~50.'],
];

export default function EventsTab({ api }) {
  return (
    <section className="wp-panel">
      <div><h2>Around the day</h2><p className="desc">Events before and after the wedding.</p></div>
      <div className="grid">
        {EVENTS.map(ev => (
          <div className="card" key={ev.id}>
            <h3>{ev.title}</h3>
            <span className="when">{ev.when}</span>
            <div className="tasks">{ev.tasks.map(([id, text]) => <SimpleRow key={id} id={id} text={text} api={api} />)}</div>
          </div>
        ))}
      </div>
      <div className="block">
        <div><h3>Spots from the venue search</h3><p className="desc">Places from the original shortlist that fit a smaller event.</p></div>
        <div className="spots">
          {SPOTS.map(([fit, name, text]) => <div className="spot" key={name}><span className="fit">{fit}</span><b>{name}</b>{text}</div>)}
        </div>
      </div>
    </section>
  );
}
