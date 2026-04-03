import type { ReactNode } from 'react';
import {
  Search, Calendar, MapPin, Users, ChevronRight, ChevronLeft,
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
  currentPage: number;
  onPageChange: (page: number) => void;
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
  currentPage,
  onPageChange,
  viewingClass,
  onClassSelect,
  onSignIn,
  HeroSection,
  HeroExtras,
  renderClassCard,
}: HomeProps) {
  const ITEMS_PER_PAGE = 6;

  const selectedDayClasses = selectedDay
    ? filteredAndSortedClasses.filter((item) => item.date === selectedDay)
    : [];
  const selectedDayTotalPages = Math.max(1, Math.ceil(selectedDayClasses.length / ITEMS_PER_PAGE));
  const selectedDayPageItems = selectedDayClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const dayGroups = uniqueDays.map((day) => ({
    day,
    classes: filteredAndSortedClasses.filter((item) => item.date === day),
  }));

  const heroBackground = 'linear-gradient(180deg, rgba(7, 18, 8, 0.98) 0%, rgba(22, 43, 29, 0.96) 40%, rgba(42, 90, 70, 0.94) 74%, rgba(42, 90, 70, 0.94) 100%)';

  return (
    <main className="flex-grow" style={{ background: heroBackground, position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>

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
      <section id="classes-section" style={{ padding: '1.5rem 0 5rem', background: 'transparent' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Search + Sort bar */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(40, 81, 71, 0.9) 0%, rgba(26, 58, 52, 0.92) 100%)',
            backdropFilter: 'blur(16px)',
            borderRadius: 24,
            border: '1px solid rgba(249,236,182,0.14)',
            padding: '1.15rem 1.35rem',
            marginBottom: '1.75rem',
            boxShadow: '0 18px 42px rgba(12, 28, 25, 0.22)',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap' as const,
            alignItems: 'center',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b8a7a' }}
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
            gridTemplateColumns: '220px 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}>

            {/* ── SIDEBAR ── */}
            <aside style={{
              background: 'linear-gradient(180deg, rgba(40, 81, 71, 0.92) 0%, rgba(26, 58, 52, 0.95) 100%)',
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              border: '1px solid rgba(249,236,182,0.14)',
              padding: '1.15rem 1rem',
              boxShadow: '0 18px 42px rgba(12, 28, 25, 0.2)',
              position: 'sticky',
              top: '5rem',
            }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: '#f9ecb6',
                marginBottom: '0.25rem',
              }}>LEAP</p>
              <p style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(249,236,182,0.72)',
                marginBottom: '1rem',
              }}>Days</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {uniqueDays.map((day, dayIndex) => {
                  const count = filteredAndSortedClasses.filter(c => c.date === day).length;
                  const isActive = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => { onDaySelect(isActive ? null : day); onPageChange(1); }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 12,
                        border: 'none',
                        background: isActive ? 'rgba(222,154,73,0.18)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: '20%', bottom: '20%',
                          width: 3, borderRadius: 99,
                          background: '#de9a49',
                        }} />
                      )}
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                          color: isActive ? '#fae185' : 'rgba(249,236,182,0.6)',
                      }}>
                        Day {String(dayIndex + 1).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontSize: '0.85rem', fontWeight: 700,
                          color: isActive ? '#f9ecb6' : 'rgba(249,236,182,0.86)',
                        marginTop: '0.1rem',
                      }}>
                        {day.split(',')[0]}
                      </span>
                      <span style={{
                        marginTop: '0.2rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                          color: isActive ? '#fae185' : 'rgba(249,236,182,0.58)',
                      }}>
                        {count} classes
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
                  background: 'linear-gradient(180deg, rgba(40, 81, 71, 0.92) 0%, rgba(26, 58, 52, 0.96) 100%)',
                  borderRadius: 28,
                  border: '1px solid rgba(249,236,182,0.14)',
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 18px 44px rgba(12,28,25,0.24)',
                }}>
                  <div className="leap-detail-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem' }}>
                    <Info size={28} />
                  </div>
                  <h3 style={{
                    fontFamily: "'Tropikal', serif",
                    fontSize: 'clamp(1.45rem, 2.4vw, 2rem)', fontWeight: 700, marginBottom: '0.5rem',
                    color: '#f9ecb6',
                  }}>Sign in to see classes</h3>
                  <p style={{ color: 'rgba(249,236,182,0.72)', fontSize: '1rem', marginBottom: '2rem' }}>
                    You must be signed in with your DLSU account to view and register for LEAP classes.
                  </p>
                  <button onClick={onSignIn} className="btn-leap-primary" style={{ padding: '0.95rem 2.4rem', fontSize: '0.95rem', borderRadius: 16 }}>
                    Sign In Now
                  </button>
                </div>

              ) : selectedDay === null ? (
                /* All Days View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {dayGroups.map(({ day, classes: dayClasses }, dayIndex) => {
                    const previewClasses = dayClasses.slice(0, 3);
                    return (
                      <div key={day} style={{
                          background: 'linear-gradient(180deg, rgba(40, 81, 71, 0.9) 0%, rgba(26, 58, 52, 0.94) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 26,
                          border: '1px solid rgba(249,236,182,0.12)',
                        padding: '1.35rem 1.35rem',
                          boxShadow: '0 16px 40px rgba(12,28,25,0.18)',
                      }}>
                        {/* Day header */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                          <div>
                            <p style={{
                              fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.22em', color: '#fae185', marginBottom: '0.25rem',
                            }}>Day {String(dayIndex + 1).padStart(2, '0')}</p>
                            <h2 style={{
                              fontFamily: "'Tropikal', serif",
                              fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', fontWeight: 700, color: '#f9ecb6', lineHeight: 1.05,
                            }}>{day}</h2>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(249,236,182,0.72)', marginTop: '0.2rem', fontWeight: 500 }}>
                              {dayClasses.length} classes available
                            </p>
                          </div>
                          {dayClasses.length > 3 && (
                            <button
                              onClick={() => { onDaySelect(day); onPageChange(1); }}
                              className="leap-see-more"
                            >
                              See All <ChevronRight size={16} />
                            </button>
                          )}
                        </div>

                        {/* Cards grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '1rem',
                        }}>
                          {previewClasses.map((item, index) => renderClassCard(item, index))}
                        </div>

                        {/* Subtle divider between days */}
                        {dayIndex < dayGroups.length - 1 && (
                          <div style={{
                            marginTop: '1.5rem',
                            height: 1,
                            background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.3), transparent)',
                          }} />
                        )}
                      </div>
                    );
                  })}

                  {filteredAndSortedClasses.length === 0 && (
                    <div style={{ padding: '4rem 0', textAlign: 'center', color: '#6b8a7a' }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No classes found</p>
                      <p style={{ fontSize: '0.9rem' }}>Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>

              ) : (
                /* Selected Day Paginated View */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => { onDaySelect(null); onPageChange(1); }}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(249,236,182,0.18)',
                        borderRadius: 10,
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#f9ecb6',
                      }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#fae185' }}>Filtered Day</p>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#f9ecb6' }}>{selectedDay}</h2>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {selectedDayPageItems.map((item, index) => renderClassCard(item, index))}
                  </div>

                  {selectedDayTotalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        className="leap-page-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.2rem', fontWeight: 700 }}
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f9ecb6' }}>
                        Page {currentPage} of {selectedDayTotalPages}
                      </span>
                      <button
                        disabled={currentPage === selectedDayTotalPages}
                        onClick={() => onPageChange(Math.min(selectedDayTotalPages, currentPage + 1))}
                        className="leap-page-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.2rem', fontWeight: 700 }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
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
              background: 'linear-gradient(180deg, rgba(40, 81, 71, 0.96) 0%, rgba(26, 58, 52, 0.98) 100%)',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(249,236,182,0.16)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
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
                color: '#f9ecb6',
                background: 'rgba(10, 20, 16, 0.86)',
                border: '1px solid rgba(250, 225, 133, 0.24)',
                borderRadius: 999,
                padding: '0.35rem 0.7rem',
              }}
            >
              Close <ArrowLeft size={16} style={{ transform: 'rotate(135deg)' }} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[340px_1fr]" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <div style={{ position: 'relative', minHeight: 250, maxHeight: 'calc(100vh - 2rem)' }}>
                <img src={viewingClass.image} alt={viewingClass.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.08) 45%, transparent)' }} />
                <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {viewingClass.orgLogo && (
                    <img
                      src={viewingClass.orgLogo}
                      alt={viewingClass.org}
                      style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(222,154,73,0.6)' }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="leap-detail-badge">{viewingClass.subtheme}</span>
                </div>
              </div>

              <div style={{ padding: 'clamp(1.1rem, 2.4vw, 2rem)', overflowY: 'auto', maxHeight: 'calc(100vh - 2rem)' }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 3.4vw, 2.35rem)', fontWeight: 700, color: '#f9ecb6', marginBottom: '0.5rem' }}>
                  {viewingClass.title}
                </h1>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fae185', marginBottom: '2rem' }}>
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
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(249,236,182,0.68)', marginBottom: 2 }}>{item.label}</p>
                        <p style={{ fontWeight: 600, color: '#f9ecb6' }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(222,154,73,0.2)', paddingTop: '1.5rem', marginBottom: '1.75rem' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#f9ecb6', marginBottom: '0.75rem' }}>About this class</h3>
                  <p style={{ color: 'rgba(249,236,182,0.82)', lineHeight: 1.7, fontSize: '1rem' }}>{viewingClass.description || 'No description provided.'}</p>
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