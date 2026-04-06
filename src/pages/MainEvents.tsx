import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { PageWrapper, PageHero } from '../components/PageCommon';

export default function MainEvents() {
  const events = [
    {
      tag: 'Opening Ceremony', date: 'June 20, 2026', time: '8:00 AM', venue: 'Henry Sy Sr. Hall Grounds',
      title: 'LEAP 2026 Kickoff Rally',
      desc: 'The grand opening of LEAP 2026. Live performances, special guest speakers, surprise acts, and the ceremonial launch of a week that will change how you see learning.',
      img: '/images/event-kickoff.svg', accent: '#de9a49',
    },
    {
      tag: 'Midweek Special', date: 'June 23, 2026', time: '3:00 PM', venue: 'Agno Food Court Plaza',
      title: 'Nayon Night Market',
      desc: 'An open-air celebration of Filipino creativity — food, crafts, live music, and student showcases filling the campus with the spirit of a traditional Filipino market.',
      img: '/images/event-night-market.svg', accent: '#4ab09a',
    },
    {
      tag: 'Closing Ceremony', date: 'June 26, 2026', time: '6:00 PM', venue: 'Teresa Yuchengco Auditorium',
      title: 'Culminating Night',
      desc: 'A grand celebration of everything the week produced — student output showcases, awards night, and a closing concert that sends LEAP 2026 off with a bang.',
      img: '/images/event-culminating.svg', accent: '#b05a32',
    },
  ];

  return (
    <PageWrapper>
      <PageHero title="Major Events" subtitle="Landmark moments that define the LEAP experience" accent="LEAP 2026 · Schedule" />
      <main className="container mx-auto px-4 pb-24 max-w-5xl">
        <div className="events-list">
          {events.map((ev, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.55 }} className="event-card">
              <div className="event-img-wrap">
                <img src={ev.img} alt={ev.title} className="event-img" />
                <div className="event-img-overlay" />
                <span className="event-tag" style={{ background: ev.accent }}>{ev.tag}</span>
              </div>
              <div className="event-body">
                <div className="event-meta">
                  <span className="event-meta-item"><Calendar size={13} />{ev.date}</span>
                  <span className="event-meta-item"><Clock size={13} />{ev.time}</span>
                  <span className="event-meta-item"><MapPin size={13} />{ev.venue}</span>
                </div>
                <h3 className="event-title">{ev.title}</h3>
                <p className="event-desc">{ev.desc}</p>
                <div className="event-cta">
                  <div className="event-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="event-divider-line" style={{ background: ev.accent }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </PageWrapper>
  );
}
