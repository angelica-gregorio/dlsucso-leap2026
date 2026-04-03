import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex-grow"
  >
    {children}
  </motion.div>
);

interface PageHeroProps {
  title: string;
  subtitle: string;
  accent: string;
}

const PageHero = ({ title, subtitle, accent }: PageHeroProps) => (
  <div className="page-hero" style={{ paddingTop: '10rem', paddingBottom: '4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div className="page-hero-glow" />
    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#de9a49', marginBottom: '1rem' }}>
      {accent}
    </motion.p>
    <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      className="page-hero-title">
      {title}
    </motion.h1>
    <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
      className="page-hero-subtitle">
      {subtitle}
    </motion.p>
    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
      style={{ width: 60, height: 2, background: 'linear-gradient(90deg,transparent,#de9a49,transparent)', margin: '2rem auto 0' }} />
  </div>
);

export default function MainEvents() {
  const events = [
    {
      tag: 'Opening Ceremony', date: 'June 20, 2026', time: '8:00 AM', venue: 'Henry Sy Sr. Hall Grounds',
      title: 'LEAP 2026 Kickoff Rally',
      desc: 'The grand opening of LEAP 2026. Live performances, special guest speakers, surprise acts, and the ceremonial launch of a week that will change how you see learning.',
      img: 'https://picsum.photos/seed/kickoff2026/800/450', accent: '#de9a49',
    },
    {
      tag: 'Midweek Special', date: 'June 23, 2026', time: '3:00 PM', venue: 'Agno Food Court Plaza',
      title: 'Nayon Night Market',
      desc: 'An open-air celebration of Filipino creativity — food, crafts, live music, and student showcases filling the campus with the spirit of a traditional Filipino market.',
      img: 'https://picsum.photos/seed/nightmarket/800/450', accent: '#4ab09a',
    },
    {
      tag: 'Closing Ceremony', date: 'June 26, 2026', time: '6:00 PM', venue: 'Teresa Yuchengco Auditorium',
      title: 'Culminating Night',
      desc: 'A grand celebration of everything the week produced — student output showcases, awards night, and a closing concert that sends LEAP 2026 off with a bang.',
      img: 'https://picsum.photos/seed/culminating2026/800/450', accent: '#b05a32',
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
                <img src={ev.img} alt={ev.title} className="event-img" referrerPolicy="no-referrer" />
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
