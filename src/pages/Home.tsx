import { useState, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Search, Calendar, MapPin, Users, ExternalLink, Info, X } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface LeapClass {
  id: string; title: string; org: string; modality: string; date: string;
  time: string; venue: string; slots: number; subtheme: string; image: string;
  orgLogo: string | null; googleFormUrl: string; description: string;
}
interface HomeProps {
  user: FirebaseUser | null; classes: LeapClass[];
  searchQuery: string; onSearchChange: (query: string) => void;
  sortBy: 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc';
  onSortChange: (sort: 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc') => void;
  filteredAndSortedClasses: LeapClass[]; uniqueDays: string[];
  selectedDay: string | null; onDaySelect: (day: string | null) => void;
  viewingClass: LeapClass | null; onClassSelect: (leapClass: LeapClass | null) => void;
  onSignIn: () => void; onHeroScroll: () => void;
  HeroSection: ReactNode; HeroExtras: ReactNode | null;
  renderClassCard: (item: LeapClass, index: number) => ReactNode;
}

const HOME_FLIES = Array.from({ length: 30 }, (_, i) => ({
  id: i, x: (i * 16.7 + (i % 4) * 19) % 96 + 2, y: (i * 12.1 + (i % 6) * 11) % 94 + 2,
  size: 2 + (i % 3), delay: (i * 0.57) % 6.5, dur: 3.2 + (i % 5) * 0.58,
}));

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

export default function Home({
  user, searchQuery, onSearchChange, sortBy, onSortChange,
  filteredAndSortedClasses, uniqueDays, selectedDay, onDaySelect,
  viewingClass, onClassSelect, onSignIn, HeroSection, HeroExtras, renderClassCard,
}: HomeProps) {
  const w = useWindowWidth();
  const isDesktop = w >= 1024;
  const isWide = w >= 1280;

  const displayedDays = uniqueDays.slice(0, 5);
  const [activeDay, setActiveDay] = useState<string | null>(displayedDays[0] ?? null);

  // Refs for each day section so we can scroll to them and observe them
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingTo = useRef(false);

  // Update activeDay on scroll using IntersectionObserver
  useEffect(() => {
    if (!isDesktop || displayedDays.length === 0) return;

    const observers: IntersectionObserver[] = [];

    displayedDays.forEach((day) => {
      const el = dayRefs.current[day];
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only update if not programmatically scrolling
            if (entry.isIntersecting && !isScrollingTo.current) {
              setActiveDay(day);
              onDaySelect(day);
            }
          });
        },
        {
          root: null,
          // Trigger when top of section crosses upper 40% of viewport
          rootMargin: '-10% 0px -55% 0px',
          threshold: 0,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isDesktop, displayedDays.join(',')]);

  // Scroll to a day section when sidebar button is clicked
  const scrollToDay = (day: string) => {
    const el = dayRefs.current[day];
    if (!el) return;
    setActiveDay(day);
    onDaySelect(day);
    isScrollingTo.current = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Release lock after scroll settles
    setTimeout(() => { isScrollingTo.current = false; }, 900);
  };

  const panelStyle = {
    background: 'linear-gradient(145deg, rgba(255,252,241,0.98), rgba(253,247,228,0.96))',
    backdropFilter: 'blur(12px)',
    borderRadius: 20,
    border: '1px solid rgba(222,154,73,0.24)',
    boxShadow: '0 2px 0 rgba(222,154,73,0.12), 0 18px 42px rgba(51,75,70,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
  } as const;

  const accentLine = (
    <div style={{ position: 'absolute', top: 0, left: '1rem', right: '1rem', height: 2, borderRadius: '0 0 2px 2px', background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.5), transparent)' }} />
  );

  return (
    <main className="flex-grow hero-bg" style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      {/* Fireflies */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {HOME_FLIES.map(f => (
          <span key={f.id} className="firefly" style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.size, height: f.size, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s`, boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(250,225,133,0.62)` }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: 'transparent' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 15%, rgba(222,154,73,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {HeroSection}
        </section>
        {HeroExtras}

        {/* ── CLASS CATALOG ── */}
        <section id="classes-section" style={{
          padding: '2rem 0 6rem',
          background: `
            radial-gradient(ellipse 55% 35% at 15% 25%, rgba(74,176,154,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 45% 30% at 88% 75%, rgba(222,154,73,0.07) 0%, transparent 50%),
            linear-gradient(180deg, #fffdf6 0%, #fdf8ec 25%, #f9f1da 55%, #f4e8c4 80%, #efdba8 100%)
          `,
          width: '100%', boxSizing: 'border-box', overflowX: 'hidden', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 0%, rgba(222,154,73,0.4) 20%, rgba(250,225,133,0.7) 50%, rgba(222,154,73,0.4) 80%, transparent 100%)' }} />

          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(0.75rem, 3vw, 1.5rem)', boxSizing: 'border-box', width: '100%' }}>

            {/* Search bar */}
            <div style={{ ...panelStyle, padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, alignItems: 'center', boxSizing: 'border-box' as const, width: '100%' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#7c6b4b', pointerEvents: 'none' }} />
                <input type="text" placeholder="Search classes, orgs, or topics…" className="leap-search"
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', boxSizing: 'border-box' }}
                  value={searchQuery} onChange={e => onSearchChange(e.target.value)} />
              </div>
              <select value={sortBy} onChange={e => onSortChange(e.target.value as 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc')} aria-label="Sort classes" className="leap-select" style={{ padding: '0.75rem 1.25rem', flexShrink: 0 }}>
                <option value="title-asc">Title (A–Z)</option>
                <option value="title-desc">Title (Z–A)</option>
                <option value="slots-desc">Most Slots</option>
                <option value="slots-asc">Fewest Slots</option>
              </select>
            </div>

            {/* Layout grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '240px 1fr' : '1fr', gap: '1.25rem', alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>

              {/* Sidebar — sticky, highlights active day on scroll */}
              <aside style={{ ...panelStyle, padding: '1.25rem 1.05rem', position: isDesktop ? 'sticky' : 'static', top: '5rem', boxSizing: 'border-box' as const }}>
                {accentLine}
                <p style={{ fontFamily: "'Tropikal', serif", fontSize: '1.2rem', fontWeight: 700, color: '#334b46', marginBottom: '0.15rem' }}>LEAP</p>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#de9a49', marginBottom: '0.2rem' }}>Days</p>
                <p style={{ fontSize: '0.72rem', color: '#567069', marginBottom: '1rem', fontWeight: 500 }}>
                  {isDesktop ? 'Scroll through classes or click a day to jump.' : 'Tap a day to preview its classes.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
                  {displayedDays.map((day, idx) => {
                    const isActive = activeDay === day;
                    return (
                      <button key={day} onClick={() => isDesktop ? scrollToDay(day) : onDaySelect(day)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        padding: '0.72rem 0.8rem', borderRadius: 14,
                        border: isActive ? '1px solid rgba(250,225,133,0.5)' : '1px solid rgba(222,154,73,0.12)',
                        background: isActive ? 'linear-gradient(145deg, rgba(222,154,73,0.18), rgba(250,225,133,0.14))' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', position: 'relative',
                        boxShadow: isActive ? '0 8px 22px rgba(222,154,73,0.22), inset 0 1px 0 rgba(255,255,255,0.6)' : '0 1px 4px rgba(51,75,70,0.06)',
                        width: '100%',
                      }}>
                        {isActive && <div style={{ position: 'absolute', left: -1, top: '17%', bottom: '17%', width: 4, borderRadius: 99, background: 'linear-gradient(180deg,#fae185,#de9a49)' }} />}
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: isActive ? '#b05a32' : '#7c6b4b' }}>Day {String(idx + 1).padStart(2, '0')}</span>
                        <span style={{ fontFamily: "'Tropikal', serif", fontSize: '1rem', fontWeight: 700, color: isActive ? '#334b46' : '#567069', marginTop: '0.15rem' }}>{day}</span>
                        <span style={{ marginTop: '0.2rem', fontSize: '0.68rem', fontWeight: 600, color: isActive ? '#de9a49' : '#7c6b4b' }}>
                          {isDesktop ? `${filteredAndSortedClasses.filter(c => c.date === day).length} classes` : 'Tap to preview'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Main content */}
              {isDesktop ? (
                !user ? (
                  <div style={{ ...panelStyle, padding: '3.5rem 2rem', textAlign: 'center' }}>
                    <div className="leap-detail-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem' }}><Info size={28} /></div>
                    <h3 style={{ fontFamily: "'Tropikal', serif", fontSize: 'clamp(1.45rem, 2.4vw, 2rem)', fontWeight: 700, marginBottom: '0.5rem', color: '#334b46' }}>Sign in to see classes</h3>
                    <p style={{ color: '#567069', fontSize: '1rem', marginBottom: '2rem' }}>You must be signed in with your DLSU account to view and register for LEAP classes.</p>
                    <button onClick={onSignIn} className="btn-leap-primary" style={{ padding: '0.95rem 2.4rem', fontSize: '0.95rem', borderRadius: 16 }}>Sign In Now</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {displayedDays.map((day, dayIdx) => {
                      const dayClasses = filteredAndSortedClasses.filter(c => c.date === day);
                      return (
                        <div
                          key={day}
                          ref={el => { dayRefs.current[day] = el; }}
                          style={{ ...panelStyle, padding: '1.5rem', position: 'relative', scrollMarginTop: '6rem' }}
                        >
                          {accentLine}
                          {/* Day header */}
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <div>
                              <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#de9a49', marginBottom: '0.25rem' }}>
                                Day {String(dayIdx + 1).padStart(2, '0')}
                              </p>
                              <h2 style={{ fontFamily: "'Tropikal', serif", fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', fontWeight: 700, color: '#334b46', lineHeight: 1.05 }}>{day}</h2>
                            </div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b05a32', border: '1px solid rgba(222,154,73,0.3)', background: 'rgba(255,252,241,0.9)', borderRadius: 999, padding: '0.26rem 0.72rem', boxShadow: '0 2px 8px rgba(222,154,73,0.15)' }}>
                              {dayClasses.length} classes
                            </div>
                          </div>

                          {dayClasses.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#7c6b4b', fontSize: '0.9rem', padding: '2rem 0' }}>No classes found for this day.</p>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: isWide ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem' }}>
                              {dayClasses.map((item, idx) => renderClassCard(item, idx))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : null}
            </div>
          </div>
        </section>

        {/* Mobile bottom-sheet drawer — unchanged */}
        {!isDesktop && selectedDay && user && createPortal(
          <div onClick={() => onDaySelect(null)} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(8,10,8,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '100vw', maxHeight: '85dvh', background: 'linear-gradient(180deg, #fffdf6 0%, #f9f1da 100%)', borderRadius: '24px 24px 0 0', border: '1px solid rgba(222,154,73,0.3)', boxShadow: '0 -12px 48px rgba(51,75,70,0.18)', overflowY: 'auto', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0' }}>
                <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(222,154,73,0.3)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem 0.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#de9a49', marginBottom: '0.2rem' }}>Day Preview</p>
                  <h2 style={{ fontFamily: "'Tropikal', serif", fontSize: '1.4rem', fontWeight: 700, color: '#334b46', lineHeight: 1.1 }}>{selectedDay}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b05a32', border: '1px solid rgba(222,154,73,0.28)', background: 'rgba(255,252,241,0.9)', borderRadius: 999, padding: '0.22rem 0.55rem' }}>
                    {filteredAndSortedClasses.filter(c => c.date === selectedDay).length} total
                  </span>
                  <button onClick={() => onDaySelect(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(51,75,70,0.08)', border: '1px solid rgba(224,183,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334b46' }} aria-label="Close"><X size={16} /></button>
                </div>
              </div>
              <div style={{ padding: '0.5rem 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredAndSortedClasses.filter(c => c.date === selectedDay).length === 0
                  ? <p style={{ textAlign: 'center', color: '#7c6b4b', fontSize: '0.9rem', padding: '2rem 0' }}>No classes found for this day.</p>
                  : filteredAndSortedClasses.filter(c => c.date === selectedDay).map((item, idx) => renderClassCard(item, idx))}
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Class detail modal — unchanged */}
        {user && viewingClass && createPortal(
          <div onClick={() => onClassSelect(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(8,10,8,0.78)', backdropFilter: 'blur(6px)', padding: 'clamp(0.5rem, 2vw, 1.5rem)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 'min(1040px, 96vw)', maxHeight: 'calc(100dvh - 2rem)', background: 'linear-gradient(180deg, #fffdf6 0%, #f9f1da 100%)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(222,154,73,0.3)', boxShadow: '0 24px 64px rgba(51,75,70,0.18)', position: 'relative', margin: '1rem auto' }}>
              <button onClick={() => onClassSelect(null)} style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,252,241,0.96)', border: '1px solid rgba(222,154,73,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334b46' }} aria-label="Close"><X size={18} /></button>
              <div style={{ display: 'grid', gridTemplateColumns: w >= 640 ? 'min(340px, 38%) 1fr' : '1fr', maxHeight: 'calc(100dvh - 2rem)', overflow: 'auto' }}>
                <div style={{ position: 'relative', minHeight: w >= 640 ? 300 : 200, maxHeight: w >= 640 ? 'calc(100dvh - 2rem)' : 240, overflow: 'hidden' }}>
                  <img src={viewingClass.image} alt={viewingClass.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} referrerPolicy="no-referrer" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {viewingClass.orgLogo && <img src={viewingClass.orgLogo} alt={viewingClass.org} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(222,154,73,0.6)' }} referrerPolicy="no-referrer" />}
                    {viewingClass.subtheme && <span className="leap-detail-badge">{viewingClass.subtheme}</span>}
                  </div>
                </div>
                <div style={{ padding: 'clamp(1.1rem, 2.4vw, 2rem)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', fontWeight: 800, color: '#334b46', lineHeight: 1.1, marginBottom: '0.4rem' }}>{viewingClass.title}</h1>
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#de9a49' }}>Organized by {viewingClass.org}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { icon: <Calendar size={18} />, label: 'Date & Time', value: `${viewingClass.date} · ${viewingClass.time}` },
                      { icon: <MapPin size={18} />, label: 'Location', value: `${viewingClass.venue} (${viewingClass.modality})` },
                      { icon: <Users size={18} />, label: 'Slots', value: `${viewingClass.slots} participants` },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>{item.icon}</div>
                        <div>
                          <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c6b4b', marginBottom: 2 }}>{item.label}</p>
                          <p style={{ fontWeight: 600, color: '#334b46', fontSize: '0.88rem' }}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(222,154,73,0.22)', paddingTop: '1rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#334b46', marginBottom: '0.6rem' }}>About this class</h3>
                    <p style={{ color: '#567069', lineHeight: 1.75, fontSize: '0.95rem' }}>{viewingClass.description || 'No description provided.'}</p>
                  </div>
                  <a href={viewingClass.googleFormUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-leap-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.9rem 2rem', borderRadius: 14, fontSize: '0.9rem', textDecoration: 'none' }}>
                    Register via Google Forms <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </main>
  );
}