import type { ReactNode } from 'react';
import {
  Search, Calendar, MapPin, Users,
  ArrowLeft, ExternalLink, Info
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface LeapClass {
  id: string;
  title: string;
  org: string;
  modality: string;
  date: string;
  time: string;
  venue: string;
  slots: number;
  subtheme: string;
  image: string;
  orgLogo: string | null;
  googleFormUrl: string;
  description: string;
}

interface HomeProps {
  user: FirebaseUser | null;
  classes: LeapClass[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc';
  onSortChange: (sort: 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc') => void;
  filteredAndSortedClasses: LeapClass[];
  uniqueDays: string[];
  selectedDay: string | null;
  onDaySelect: (day: string | null) => void;
  viewingClass: LeapClass | null;
  onClassSelect: (leapClass: LeapClass | null) => void;
  onSignIn: () => void;
  onHeroScroll: () => void;
  HeroSection: ReactNode;
  HeroExtras: ReactNode | null;
  renderClassCard: (item: LeapClass, index: number) => ReactNode;
}

const HOME_FLIES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 16.7 + (i % 4) * 19) % 96 + 2,
  y: (i * 12.1 + (i % 6) * 11) % 94 + 2,
  size: 2 + (i % 3),
  delay: (i * 0.57) % 6.5,
  dur: 3.2 + (i % 5) * 0.58,
}));

export default function Home({
  user,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filteredAndSortedClasses,
  uniqueDays,
  selectedDay,
  onDaySelect,
  viewingClass,
  onClassSelect,
  onSignIn,
  HeroSection,
  HeroExtras,
  renderClassCard,
}: HomeProps) {
  const displayedDays = uniqueDays.slice(0, 5);
  const activeDay = selectedDay && displayedDays.includes(selectedDay)
    ? selectedDay
    : (displayedDays[0] ?? null);
  const activeDayClasses = activeDay
    ? filteredAndSortedClasses.filter((item) => item.date === activeDay)
    : [];

  return (
    <main className="flex-grow hero-bg" style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {HOME_FLIES.map((f) => (
          <span
            key={f.id}
            className="firefly"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.size,
              height: f.size,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.dur}s`,
              boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(250,225,133,0.62)`,
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'transparent' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 15%, rgba(222,154,73,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        {HeroSection}
        {/* Bottom fade to cream */}
      </section>

      {HeroExtras}

      {/* ── CLASS CATALOG ─────────────────────────────────────────────── */}
      <section id="classes-section" style={{ padding: '1.5rem 0 5rem', background: 'linear-gradient(180deg, #fffdf6 0%, #fff8e8 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Search + Sort bar */}
          <div style={{
            background: 'rgba(255, 252, 241, 0.9)',
            backdropFilter: 'blur(16px)',
            borderRadius: 24,
            border: '1px solid rgba(224,183,136,0.26)',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.75rem',
            boxShadow: '0 18px 42px rgba(51, 75, 70, 0.08)',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap' as const,
            alignItems: 'center',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#7c6b4b' }}
              />
              <input
                type="text"
                placeholder="Search classes, orgs, or topics…"
                className="leap-search"
                style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc')}
              aria-label="Sort events"
              className="leap-select"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <option value="title-asc">Title (A–Z)</option>
              <option value="title-desc">Title (Z–A)</option>
              <option value="slots-desc">Most Slots</option>
              <option value="slots-asc">Fewest Slots</option>
            </select>
          </div>

          {/* Two-column layout: Sidebar + Main */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}>

            {/* ── SIDEBAR ── */}
            <aside style={{
              background: 'rgba(255, 252, 241, 0.94)',
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              border: '1px solid rgba(224,183,136,0.26)',
              padding: '1.25rem 1.05rem',
              boxShadow: '0 18px 42px rgba(51, 75, 70, 0.08)',
              position: 'sticky',
              top: '5rem',
            }}>
              <p style={{
                fontFamily: "'Tropikal', serif",
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#334b46',
                marginBottom: '0.15rem',
              }}>LEAP</p>
              <p style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#de9a49',
                marginBottom: '0.2rem',
              }}>Days</p>
              <p style={{
                fontSize: '0.72rem',
                color: '#567069',
                marginBottom: '1rem',
                fontWeight: 500,
              }}>Choose a day to focus your class list.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
                {displayedDays.map((day, dayIndex) => {
                  const isActive = activeDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => { onDaySelect(day); }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '0.72rem 0.8rem',
                        borderRadius: 14,
                        border: isActive ? '1px solid rgba(250,225,133,0.45)' : '1px solid rgba(249,236,182,0.08)',
                        background: isActive
                          ? 'linear-gradient(145deg, rgba(222,154,73,0.16), rgba(250,225,133,0.14))'
                          : 'rgba(255,255,255,0.72)',
                        cursor: 'pointer',
                        transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
                        textAlign: 'left',
                        position: 'relative',
                        boxShadow: isActive ? '0 10px 24px rgba(222,154,73,0.2)' : 'none',
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: -1, top: '17%', bottom: '17%',
                          width: 4, borderRadius: 99,
                          background: '#de9a49',
                        }} />
                      )}
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: isActive ? '#b05a32' : '#7c6b4b',
                      }}>
                        Day {String(dayIndex + 1).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontFamily: "'Tropikal', serif",
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#334b46',
                        marginTop: '0.15rem',
                      }}>
                        {day}
                      </span>
                      <span style={{
                        marginTop: '0.2rem',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: isActive ? '#de9a49' : '#567069',
                      }}>
                        Tap to preview classes
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div>
              {!user ? (
                /* Sign-in prompt */
                <div style={{
                  background: 'rgba(255, 252, 241, 0.94)',
                  borderRadius: 28,
                  border: '1px solid rgba(224,183,136,0.26)',
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 18px 44px rgba(51,75,70,0.08)',
                }}>
                  <div className="leap-detail-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem' }}>
                    <Info size={28} />
                  </div>
                  <h3 style={{
                    fontFamily: "'Tropikal', serif",
                    fontSize: 'clamp(1.45rem, 2.4vw, 2rem)', fontWeight: 700, marginBottom: '0.5rem',
                    color: '#334b46',
                  }}>Sign in to see classes</h3>
                  <p style={{ color: '#567069', fontSize: '1rem', marginBottom: '2rem' }}>
                    You must be signed in with your DLSU account to view and register for LEAP classes.
                  </p>
                  <button onClick={onSignIn} className="btn-leap-primary" style={{ padding: '0.95rem 2.4rem', fontSize: '0.95rem', borderRadius: 16 }}>
                    Sign In Now
                  </button>
                </div>

              ) : (
                /* Selected Day Preview View */
                <div style={{
                  background: 'rgba(255, 252, 241, 0.96)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 26,
                  border: '1px solid rgba(224,183,136,0.26)',
                  padding: '1.35rem 1.35rem',
                  boxShadow: '0 16px 40px rgba(51,75,70,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <p style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.22em',
                        color: '#fae185',
                        marginBottom: '0.25rem',
                      }}>
                        Day Preview
                      </p>
                      <h2 style={{
                        fontFamily: "'Tropikal', serif",
                        fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)',
                        fontWeight: 700,
                        color: '#334b46',
                        lineHeight: 1.05,
                      }}>
                        {activeDay ?? 'No day available'}
                      </h2>
                    </div>
                    <div style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#b05a32',
                      border: '1px solid rgba(222,154,73,0.24)',
                      background: 'rgba(255,255,255,0.8)',
                      borderRadius: 999,
                      padding: '0.26rem 0.62rem',
                    }}>
                      {activeDayClasses.length} total
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {activeDayClasses.slice(0, 3).map((item, index) => renderClassCard(item, index))}
                  </div>

                  {activeDayClasses.length > 3 && (
                    <p style={{
                      marginTop: '1rem',
                      fontSize: '0.78rem',
                      color: '#567069',
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                      Showing 3 of {activeDayClasses.length} classes for this day.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {user && viewingClass && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(8, 10, 8, 0.72)',
            backdropFilter: 'blur(6px)',
            padding: 'clamp(0.75rem, 2.5vw, 1.5rem)',
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => onClassSelect(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(1040px, 94vw)',
              maxHeight: 'calc(100vh - 2rem)',
              background: 'linear-gradient(180deg, #fffdf6 0%, #fff8ea 100%)',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(224,183,136,0.3)',
              boxShadow: '0 24px 64px rgba(51,75,70,0.16)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => onClassSelect(null)}
              className="leap-see-more"
              style={{
                position: 'absolute',
                top: 18,
                right: 22,
                zIndex: 2,
                color: '#334b46',
                background: 'rgba(255, 252, 241, 0.96)',
                border: '1px solid rgba(224,183,136,0.28)',
                borderRadius: 999,
                padding: '0.35rem 0.7rem',
              }}
            >
              Close <ArrowLeft size={16} style={{ transform: 'rotate(135deg)' }} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[340px_1fr]" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <div style={{ position: 'relative', minHeight: 250, maxHeight: 'calc(100vh - 2rem)' }}>
                <img src={viewingClass.image} alt={viewingClass.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.34), rgba(0,0,0,0.08) 45%, transparent)' }} />
                <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {viewingClass.orgLogo && (
                    <img
                      src={viewingClass.orgLogo}
                      alt={viewingClass.org}
                      style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(222,154,73,0.6)' }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="leap-detail-badge" style={{ color: '#334b46', background: 'rgba(255,252,241,0.92)', borderColor: 'rgba(224,183,136,0.3)' }}>{viewingClass.subtheme}</span>
                </div>
              </div>

              <div style={{ padding: 'clamp(1.1rem, 2.4vw, 2rem)', overflowY: 'auto', maxHeight: 'calc(100vh - 2rem)' }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 3.4vw, 2.35rem)', fontWeight: 700, color: '#334b46', marginBottom: '0.5rem' }}>
                  {viewingClass.title}
                </h1>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#de9a49', marginBottom: '2rem' }}>
                  Organized by {viewingClass.org}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { icon: <Calendar size={20} />, label: 'Date & Time', value: `${viewingClass.date} · ${viewingClass.time}` },
                    { icon: <MapPin size={20} />, label: 'Location', value: `${viewingClass.venue} (${viewingClass.modality})` },
                    { icon: <Users size={20} />, label: 'Slots Available', value: `${viewingClass.slots} participants` },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="leap-detail-icon-wrap">{item.icon}</div>
                      <div>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c6b4b', marginBottom: 2 }}>{item.label}</p>
                        <p style={{ fontWeight: 600, color: '#334b46' }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(224,183,136,0.28)', paddingTop: '1.5rem', marginBottom: '1.75rem' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#334b46', marginBottom: '0.75rem' }}>About this class</h3>
                  <p style={{ color: '#567069', lineHeight: 1.7, fontSize: '1rem' }}>{viewingClass.description || 'No description provided.'}</p>
                </div>

                <a
                  href={viewingClass.googleFormUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-leap-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '1rem 2.2rem', borderRadius: 14, fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}
                >
                  Register via Google Forms <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}