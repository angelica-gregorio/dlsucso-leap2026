import { useState, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Search, Calendar, MapPin, Users, ExternalLink, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
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

const CLASSES_PER_DAY = 3;

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

/* ─── Decorative palay stalk SVG for day panel headers ─── */
const PalayOrnament = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 120 32"
    width="120"
    height="32"
    style={{ display: 'block', transform: flip ? 'scaleX(-1)' : undefined, opacity: 0.55 }}
  >
    <path d="M4 28 Q20 22 36 24 Q52 26 68 20 Q84 14 104 16" stroke="#de9a49" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    {[20, 36, 52, 68, 84].map((x, i) => {
      const y = i % 2 === 0 ? 20 : 17;
      return (
        <g key={i}>
          <path d={`M${x} ${y+4} Q${x-2} ${y-2} ${x} ${y-8}`} stroke="#8ab84a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <ellipse cx={x - 3} cy={y - 9} rx="3.5" ry="5.5" fill="#de9a49" opacity="0.75" transform={`rotate(-20, ${x-3}, ${y-9})`}/>
          <ellipse cx={x + 3} cy={y - 7} rx="3" ry="4.8" fill="#c89030" opacity="0.65" transform={`rotate(20, ${x+3}, ${y-7})`}/>
        </g>
      );
    })}
    <circle cx="4" cy="28" r="2" fill="#de9a49" opacity="0.5"/>
    <circle cx="104" cy="16" r="2" fill="#de9a49" opacity="0.5"/>
  </svg>
);

/* ─── Woven bayong texture pattern ─── */
const WovenPattern = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" style={{ display: 'none' }}>
    <defs>
      <pattern id="woven-bg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 5 L20 5" stroke="rgba(222,154,73,0.07)" strokeWidth="1"/>
        <path d="M0 15 L20 15" stroke="rgba(222,154,73,0.07)" strokeWidth="1"/>
        <path d="M5 0 L5 20" stroke="rgba(163,120,50,0.05)" strokeWidth="1"/>
        <path d="M15 0 L15 20" stroke="rgba(163,120,50,0.05)" strokeWidth="1"/>
        <rect x="0" y="0" width="5" height="5" fill="rgba(222,154,73,0.03)"/>
        <rect x="10" y="10" width="5" height="5" fill="rgba(222,154,73,0.03)"/>
      </pattern>
    </defs>
  </svg>
);

/* ─── Filipino sun ornament for sidebar ─── */
const SunOrnament = ({ size = 32, opacity = 0.18 }: { size?: number; opacity?: number }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} style={{ opacity }}>
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const inner = 14, outer = i % 3 === 0 ? 26 : 22;
      return (
        <line key={i}
          x1={30 + Math.cos(rad) * inner} y1={30 + Math.sin(rad) * inner}
          x2={30 + Math.cos(rad) * outer} y2={30 + Math.sin(rad) * outer}
          stroke="#de9a49" strokeWidth={i % 3 === 0 ? 1.5 : 1} strokeLinecap="round"
        />
      );
    })}
    <circle cx="30" cy="30" r="10" fill="none" stroke="#de9a49" strokeWidth="1.5"/>
    <circle cx="30" cy="30" r="5" fill="rgba(222,154,73,0.3)"/>
  </svg>
);

/* ─── Vine/botanical left edge decoration ─── */
const VineEdge = () => (
  <svg viewBox="0 0 24 200" width="24" height="200"
    style={{ position: 'absolute', left: -1, top: 20, pointerEvents: 'none', opacity: 0.22 }}>
    <path d="M12 0 Q8 25 12 50 Q16 75 12 100 Q8 125 12 150 Q16 175 12 200"
      stroke="#2a6a30" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {[20, 50, 80, 110, 140, 170].map((y, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return (
        <ellipse key={i}
          cx={12 + side * 7} cy={y}
          rx="5" ry="3.5"
          fill="#3a8040"
          transform={`rotate(${side * 30}, ${12 + side * 7}, ${y})`}
        />
      );
    })}
  </svg>
);

/* ─── Day number badge ─── */
const DayBadge = ({ num, active }: { num: number; active: boolean }) => (
  <svg viewBox="0 0 40 40" width="36" height="36" style={{ flexShrink: 0 }}>
    <circle cx="20" cy="20" r="18"
      fill={active ? 'rgba(222,154,73,0.18)' : 'rgba(222,154,73,0.07)'}
      stroke={active ? 'rgba(222,154,73,0.7)' : 'rgba(222,154,73,0.25)'}
      strokeWidth="1.5"
    />
    {active && (
      <>
        {[0, 60, 120, 180, 240, 300].map((a, i) => {
          const r = (a * Math.PI) / 180;
          return <circle key={i} cx={20 + Math.cos(r) * 14} cy={20 + Math.sin(r) * 14} r="1.2" fill="rgba(222,154,73,0.5)"/>;
        })}
      </>
    )}
    <text x="20" y="24.5" textAnchor="middle"
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 800, fill: active ? '#b05a32' : '#9c8a6a' }}>
      {String(num).padStart(2, '0')}
    </text>
  </svg>
);

/* ─── Ornamental horizontal rule ─── */
const OrnamentalRule = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.6rem 0 1.1rem', padding: '0 0.25rem' }}>
    <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(222,154,73,0.12), rgba(222,154,73,0.45))' }}/>
    <svg viewBox="0 0 20 20" width="14" height="14" style={{ opacity: 0.6 }}>
      <path d="M10 2 L11.8 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8.2 8 Z" fill="#de9a49"/>
    </svg>
    <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(222,154,73,0.45), rgba(222,154,73,0.12))' }}/>
  </div>
);

/* ─── Scattered ambient dot particles ─── */
const AmbientDots = () => {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 23.7 + (i % 5) * 11) % 94 + 3,
    y: (i * 17.3 + (i % 4) * 13) % 88 + 6,
    r: 1.5 + (i % 3) * 0.5,
    op: 0.08 + (i % 4) * 0.04,
  }));
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {dots.map((d, i) => (
        <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r} fill="#de9a49" opacity={d.op}/>
      ))}
    </svg>
  );
};

export default function Home({
  user, searchQuery, onSearchChange, sortBy, onSortChange,
  filteredAndSortedClasses, uniqueDays, onDaySelect,
  viewingClass, onClassSelect, onSignIn, HeroSection, HeroExtras, renderClassCard,
}: HomeProps) {
  const w = useWindowWidth();
  const isMobile = w < 640;
  const isDesktop = w >= 1024;
  const searchStickyTop = isDesktop ? 84 : 76;
  const daysStickyTop = isDesktop ? 172 : 146;

  const displayedDays = uniqueDays.slice(0, 5);
  const [activeDay, setActiveDay] = useState<string | null>(displayedDays[0] ?? null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const catalogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user || displayedDays.length === 0) return;
    const NAV_OFFSET = 100;
    const observers: IntersectionObserver[] = [];
    displayedDays.forEach((day) => {
      const el = daySectionRefs.current[day];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setActiveDay(day); onDaySelect(day); } },
        { rootMargin: `-${NAV_OFFSET}px 0px -55% 0px`, threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [user, displayedDays.join(',')]);

  const scrollToDay = (day: string) => {
    const el = daySectionRefs.current[day];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveDay(day);
    onDaySelect(day);
  };

  const toggleDayExpanded = (day: string) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  useEffect(() => {
    if (!viewingClass) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [viewingClass]);

  /* ── Panel base style ── */
  const panelStyle = {
    background: 'linear-gradient(155deg, rgba(255,253,245,0.99) 0%, rgba(254,249,235,0.97) 60%, rgba(251,243,220,0.95) 100%)',
    backdropFilter: 'blur(12px)',
    borderRadius: 20,
    border: '1px solid rgba(210,175,110,0.28)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 0 rgba(222,154,73,0.1), 0 12px 36px rgba(100,70,30,0.08), 0 4px 12px rgba(100,70,30,0.05)',
  } as const;

  /* ── Top accent line for panels ── */
  const accentLine = (
    <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2, borderRadius: '0 0 2px 2px', background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.6), rgba(250,225,133,0.8), rgba(222,154,73,0.6), transparent)' }} />
  );

  return (
    <main className="flex-grow hero-bg" style={{ position: 'relative', overflow: 'clip', isolation: 'isolate' }}>

      {/* ── Fireflies ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {HOME_FLIES.map(f => (
          <span key={f.id} className="firefly" style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.size, height: f.size, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s`, boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(250,225,133,0.62)` }} />
        ))}
      </div>

      <WovenPattern />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <section className="relative overflow-hidden" style={{ background: 'transparent' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 15%, rgba(222,154,73,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {HeroSection}
        </section>
        {HeroExtras}

        {/* ══════════════════════════════════════════
            CLASS CATALOG
        ══════════════════════════════════════════ */}
        <section
          ref={catalogRef}
          id="classes-section"
          style={{
            padding: isMobile ? '1.25rem 0 4.5rem' : '2.5rem 0 6rem',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'clip',
            // Rich layered background
            background: `
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 15 L60 15 M0 30 L60 30 M0 45 L60 45 M15 0 L15 60 M30 0 L30 60 M45 0 L45 60' stroke='rgba(180,140,60,0.045)' stroke-width='0.8'/%3E%3Crect x='0' y='0' width='15' height='15' fill='rgba(210,170,80,0.018)'/%3E%3Crect x='15' y='15' width='15' height='15' fill='rgba(210,170,80,0.018)'/%3E%3Crect x='30' y='30' width='15' height='15' fill='rgba(210,170,80,0.018)'/%3E%3Crect x='45' y='45' width='15' height='15' fill='rgba(210,170,80,0.018)'/%3E%3C/g%3E%3C/svg%3E"),
              radial-gradient(ellipse 55% 35% at 15% 25%, rgba(74,176,154,0.06) 0%, transparent 55%),
              radial-gradient(ellipse 45% 30% at 88% 75%, rgba(222,154,73,0.07) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,248,220,0.4) 0%, transparent 70%),
              linear-gradient(180deg, #fffdf6 0%, #fdf8ec 20%, #f9f1da 50%, #f4e8c4 78%, #eddaa4 100%)
            `,
          }}
        >
          {/* Top accent stripe */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 0%, rgba(222,154,73,0.35) 15%, rgba(250,225,133,0.75) 50%, rgba(222,154,73,0.35) 85%, transparent 100%)' }} />

          {/* Ambient scattered dots */}
          <AmbientDots />

          {/* Side botanical accents (desktop) */}
          {isDesktop && (
            <>
              <div style={{ position: 'absolute', left: 0, top: '10%', height: '80%', width: 48, pointerEvents: 'none', opacity: 0.18 }}>
                <svg viewBox="0 0 48 600" width="48" height="600" preserveAspectRatio="none">
                  <path d="M24 0 Q18 60 24 120 Q30 180 24 240 Q18 300 24 360 Q30 420 24 480 Q18 540 24 600" stroke="#3a7830" strokeWidth="1.8" fill="none"/>
                  {Array.from({ length: 10 }, (_, i) => {
                    const y = 40 + i * 56;
                    const side = i % 2 === 0 ? -1 : 1;
                    return (
                      <g key={i}>
                        <path d={`M24 ${y} Q${24 + side * 14} ${y - 8} ${24 + side * 22} ${y - 14}`} stroke="#4a9040" strokeWidth="1.4" fill="none"/>
                        <ellipse cx={24 + side * 22} cy={y - 14} rx="7" ry="4" fill="#5aaa48" opacity="0.7" transform={`rotate(${side * 25}, ${24 + side * 22}, ${y - 14})`}/>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div style={{ position: 'absolute', right: 0, top: '10%', height: '80%', width: 48, pointerEvents: 'none', opacity: 0.18, transform: 'scaleX(-1)' }}>
                <svg viewBox="0 0 48 600" width="48" height="600" preserveAspectRatio="none">
                  <path d="M24 0 Q18 60 24 120 Q30 180 24 240 Q18 300 24 360 Q30 420 24 480 Q18 540 24 600" stroke="#3a7830" strokeWidth="1.8" fill="none"/>
                  {Array.from({ length: 10 }, (_, i) => {
                    const y = 40 + i * 56;
                    const side = i % 2 === 0 ? -1 : 1;
                    return (
                      <g key={i}>
                        <path d={`M24 ${y} Q${24 + side * 14} ${y - 8} ${24 + side * 22} ${y - 14}`} stroke="#4a9040" strokeWidth="1.4" fill="none"/>
                        <ellipse cx={24 + side * 22} cy={y - 14} rx="7" ry="4" fill="#5aaa48" opacity="0.7" transform={`rotate(${side * 25}, ${24 + side * 22}, ${y - 14})`}/>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </>
          )}

          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(0.75rem, 3vw, 1.5rem)', boxSizing: 'border-box', width: '100%' }}>

            {/* ── Catalog header ── */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <PalayOrnament />
                  <span style={{
                    fontFamily: "'Tropikal', 'Playfair Display', serif",
                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                    fontWeight: 700,
                    color: '#4a3018',
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 0 rgba(255,255,255,0.9), 0 2px 12px rgba(100,60,10,0.15)',
                  }}>
                    Class Catalog
                  </span>
                  <PalayOrnament flip />
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#b07830', opacity: 0.8 }}>
                  LEAP 2026 · Isang Nayon, Isang Layunin
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div
              id="home-search-bar"
              style={{
                ...panelStyle,
                position: 'sticky',
                top: `${searchStickyTop}px`,
                zIndex: 90,
                padding: '0.9rem 1.1rem',
                marginBottom: '1.75rem',
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap' as const,
                alignItems: 'center',
                boxSizing: 'border-box' as const,
                width: '100%',
              }}
            >
              {/* Subtle woven top edge on search bar */}
              <div style={{ position: 'absolute', top: 0, left: '1rem', right: '1rem', height: 2, borderRadius: '0 0 2px 2px', background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.55), rgba(250,225,133,0.85), rgba(222,154,73,0.55), transparent)' }} />

              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9c7a4a', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search classes, orgs, or topics…"
                  className="leap-search"
                  style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: '1rem', paddingTop: '0.65rem', paddingBottom: '0.65rem', boxSizing: 'border-box', minHeight: 42, fontFamily: "'DM Sans', sans-serif" }}
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                />
              </div>
              <select
                value={sortBy}
                onChange={e => onSortChange(e.target.value as any)}
                aria-label="Sort classes"
                className="leap-select"
                style={{ padding: '0.65rem 1.1rem', flexShrink: 0, minHeight: 42, width: isMobile ? '100%' : 'auto', fontFamily: "'DM Sans', sans-serif" }}
              >
                <option value="title-asc">Title (A–Z)</option>
                <option value="title-desc">Title (Z–A)</option>
                <option value="slots-desc">Most Slots</option>
                <option value="slots-asc">Fewest Slots</option>
              </select>
            </div>

            {/* Layout grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '252px 1fr' : '1fr',
              gap: '1.5rem',
              alignItems: 'start',
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 1,
            }}>

              {/* ════════════════════════════════
                  STICKY SIDEBAR
              ════════════════════════════════ */}
              <aside
                ref={sidebarRef}
                style={{
                  ...panelStyle,
                  padding: '1.4rem 1.1rem 1.25rem',
                  position: 'sticky',
                  top: `${daysStickyTop}px`,
                  maxHeight: isDesktop ? `calc(100vh - ${daysStickyTop + 20}px)` : 'none',
                  overflowY: isDesktop ? 'auto' : 'visible',
                  alignSelf: 'start',
                  boxSizing: 'border-box' as const,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(222,154,73,0.3) transparent',
                }}
              >
                {accentLine}

                {/* Sun ornament top-right */}
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <SunOrnament size={36} opacity={0.22} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <svg viewBox="0 0 16 16" width="14" height="14" style={{ opacity: 0.5 }}>
                    <path d="M8 1 L9.4 5.8 L14.5 5.8 L10.5 8.8 L11.9 13.6 L8 10.6 L4.1 13.6 L5.5 8.8 L1.5 5.8 L6.6 5.8 Z" fill="#de9a49"/>
                  </svg>
                  <p style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: '#3a2a10' }}>LEAP</p>
                </div>
                <p style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#de9a49', marginBottom: '0.15rem' }}>Days</p>

                <OrnamentalRule />

                <p style={{ fontSize: '0.7rem', color: '#7c6040', marginBottom: '1rem', fontWeight: 500, lineHeight: 1.5 }}>
                  Choose a day to jump to its classes.
                </p>

                {/* Mobile horizontal scroll */}
                {!isDesktop && (
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none', scrollSnapType: 'x proximity' }}>
                    {displayedDays.map((day, idx) => {
                      const isActive = activeDay === day;
                      return (
                        <button key={day} onClick={() => scrollToDay(day)} style={{
                          flexShrink: 0, padding: '0.55rem 0.85rem', borderRadius: 10,
                          border: isActive ? '1px solid rgba(222,154,73,0.55)' : '1px solid rgba(210,175,110,0.2)',
                          background: isActive ? 'linear-gradient(145deg, rgba(222,154,73,0.2), rgba(250,225,133,0.15))' : 'rgba(255,253,245,0.7)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: isActive ? '0 4px 14px rgba(222,154,73,0.22), inset 0 1px 0 rgba(255,255,255,0.8)' : '0 1px 4px rgba(100,70,30,0.06)',
                          minHeight: 52, scrollSnapAlign: 'start',
                        }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? '#b05a32' : '#9c7a4a', display: 'block' }}>Day {String(idx + 1).padStart(2, '0')}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? '#3a2a10' : '#6a5040', display: 'block', marginTop: 2 }}>{day}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Desktop vertical day list */}
                {isDesktop && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem' }}>
                    {displayedDays.map((day, idx) => {
                      const isActive = activeDay === day;
                      const dayClassCount = filteredAndSortedClasses.filter(c => c.date === day).length;
                      return (
                        <button key={day} onClick={() => scrollToDay(day)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.68rem 0.75rem', borderRadius: 14,
                          border: isActive ? '1px solid rgba(222,154,73,0.5)' : '1px solid rgba(210,175,110,0.15)',
                          background: isActive
                            ? 'linear-gradient(145deg, rgba(255,248,225,0.95), rgba(254,243,210,0.92))'
                            : 'rgba(255,253,245,0.55)',
                          cursor: 'pointer', transition: 'all 0.22s', textAlign: 'left', position: 'relative',
                          boxShadow: isActive
                            ? '0 6px 20px rgba(180,120,30,0.14), 0 1px 0 rgba(255,255,255,0.9) inset'
                            : '0 1px 3px rgba(100,70,30,0.05)',
                          width: '100%',
                        }}>
                          {/* Active left accent bar */}
                          {isActive && (
                            <div style={{ position: 'absolute', left: -1, top: '15%', bottom: '15%', width: 3, borderRadius: 99, background: 'linear-gradient(180deg, #fae185, #de9a49, #c07830)' }} />
                          )}

                          <DayBadge num={idx + 1} active={isActive} />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: isActive ? '#b05a32' : '#9c7a4a', display: 'block' }}>
                              Day {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: '0.92rem', fontWeight: 700, color: isActive ? '#3a2a10' : '#6a5040', display: 'block', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {day}
                            </span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: isActive ? '#de9a49' : '#9c7a4a', display: 'block', marginTop: '0.1rem' }}>
                              {dayClassCount} {dayClassCount === 1 ? 'class' : 'classes'}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* Sidebar footer ornament */}
                    <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(210,175,110,0.22)', display: 'flex', justifyContent: 'center' }}>
                      <SunOrnament size={28} opacity={0.25} />
                    </div>
                  </div>
                )}
              </aside>

              {/* ════════════════════════════════
                  MAIN CONTENT: day sections
              ════════════════════════════════ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
                {!user ? (
                  <div style={{ ...panelStyle, padding: '3.5rem 2rem', textAlign: 'center', position: 'relative' }}>
                    {accentLine}
                    <div className="leap-detail-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem' }}><Info size={28} /></div>
                    <h3 style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: 'clamp(1.45rem, 2.4vw, 2rem)', fontWeight: 700, marginBottom: '0.5rem', color: '#3a2a10' }}>Sign in to see classes</h3>
                    <p style={{ color: '#6a5040', fontSize: '1rem', marginBottom: '2rem' }}>You must be signed in with your DLSU account to view and register for LEAP classes.</p>
                    <button onClick={onSignIn} className="btn-leap-primary" style={{ padding: '0.95rem 2.4rem', fontSize: '0.95rem', borderRadius: 16 }}>Sign In Now</button>
                  </div>
                ) : displayedDays.length === 0 ? (
                  <div style={{ ...panelStyle, padding: '3rem 2rem', textAlign: 'center', position: 'relative' }}>
                    {accentLine}
                    <p style={{ color: '#6a5040' }}>No classes available.</p>
                  </div>
                ) : (
                  displayedDays.map((day, idx) => {
                    const dayClasses = filteredAndSortedClasses.filter(c => c.date === day);
                    const isExpanded = !!expandedDays[day];
                    const hasMore = dayClasses.length > CLASSES_PER_DAY;
                    const visibleClasses = isExpanded ? dayClasses : dayClasses.slice(0, CLASSES_PER_DAY);
                    const hiddenCount = dayClasses.length - CLASSES_PER_DAY;
                    const isActiveSection = activeDay === day;

                    return (
                      <div
                        key={day}
                        ref={el => { daySectionRefs.current[day] = el; }}
                        style={{
                          ...panelStyle,
                          padding: '0',
                          position: 'relative',
                          scrollMarginTop: '6rem',
                          overflow: 'hidden',
                          // Subtle highlight for active day
                          boxShadow: isActiveSection
                            ? '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 0 rgba(222,154,73,0.15), 0 16px 48px rgba(140,90,20,0.12), 0 4px 16px rgba(140,90,20,0.08)'
                            : panelStyle.boxShadow,
                          border: isActiveSection ? '1px solid rgba(222,154,73,0.38)' : panelStyle.border,
                          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                        }}
                      >
                        {/* Accent line */}
                        <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 2, borderRadius: '0 0 2px 2px', background: isActiveSection ? 'linear-gradient(90deg, transparent, rgba(222,154,73,0.7), rgba(250,225,133,0.95), rgba(222,154,73,0.7), transparent)' : 'linear-gradient(90deg, transparent, rgba(222,154,73,0.45), rgba(250,225,133,0.65), rgba(222,154,73,0.45), transparent)' }} />

                        {/* Subtle corner botanical motif */}
                        <VineEdge />
                        <div style={{ position: 'absolute', right: -1, top: 20, transform: 'scaleX(-1)', pointerEvents: 'none' }}>
                          <VineEdge />
                        </div>

                        {/* Day header with palay ornament */}
                        <div style={{ padding: '1.5rem 1.5rem 0.75rem', borderBottom: '1px solid rgba(210,175,110,0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <DayBadge num={idx + 1} active={isActiveSection} />
                              <div>
                                <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#de9a49', marginBottom: '0.2rem' }}>
                                  Day {String(idx + 1).padStart(2, '0')}
                                </p>
                                <h2 style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: 'clamp(1.35rem, 2.2vw, 1.9rem)', fontWeight: 700, color: '#3a2a10', lineHeight: 1.05 }}>
                                  {day}
                                </h2>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {/* Palay ornament beside badge */}
                              {!isMobile && <PalayOrnament flip />}
                              <div style={{
                                fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                                color: '#b05a32',
                                border: '1px solid rgba(210,175,110,0.4)',
                                background: 'linear-gradient(135deg, rgba(255,248,225,0.95), rgba(254,240,200,0.9))',
                                borderRadius: 999,
                                padding: '0.28rem 0.8rem',
                                boxShadow: '0 2px 8px rgba(180,120,30,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                                whiteSpace: 'nowrap',
                              }}>
                                {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Classes grid */}
                        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                          {dayClasses.length === 0 ? (
                            <p style={{ color: '#9c7a4a', fontSize: '0.9rem', padding: '1rem 0', textAlign: 'center' }}>
                              No classes match your current filters for this day.
                            </p>
                          ) : (
                            <>
                              <style>{`
                                .home-day-grid {
                                  display: grid;
                                  grid-template-columns: 1fr;
                                  gap: 1rem;
                                }
                                @media (min-width: 640px) {
                                  .home-day-grid { grid-template-columns: repeat(2, 1fr); }
                                }
                                @media (min-width: 1280px) {
                                  .home-day-grid { grid-template-columns: repeat(3, 1fr); }
                                }
                              `}</style>
                              <div className="home-day-grid">
                                {visibleClasses.map((item, i) => renderClassCard(item, i))}
                              </div>

                              {/* See More / See Less */}
                              {hasMore && (
                                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => toggleDayExpanded(day)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                                      padding: '0.6rem 1.6rem',
                                      borderRadius: 999,
                                      border: '1.5px solid rgba(210,175,110,0.5)',
                                      background: isExpanded
                                        ? 'rgba(222,154,73,0.1)'
                                        : 'linear-gradient(135deg, rgba(255,248,225,0.95), rgba(254,240,200,0.88))',
                                      color: '#b05a32',
                                      fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase',
                                      cursor: 'pointer', transition: 'all 0.22s ease',
                                      boxShadow: '0 2px 10px rgba(180,120,30,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                                      fontFamily: "'DM Sans', sans-serif",
                                    }}
                                  >
                                    {isExpanded
                                      ? <><ChevronUp size={14} /> Show Less</>
                                      : <><ChevronDown size={14} /> See {hiddenCount} More {hiddenCount === 1 ? 'Class' : 'Classes'}</>
                                    }
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Class detail modal ── */}
        {user && viewingClass && createPortal(
          <div onClick={() => onClassSelect(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, height: '100dvh', background: 'rgba(8,10,8,0.78)', backdropFilter: 'blur(6px)', padding: isMobile ? 0 : 'clamp(0.5rem, 2vw, 1.5rem)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: isMobile ? '100vw' : 'min(1040px, 96vw)', maxHeight: isMobile ? '100dvh' : 'calc(100dvh - 2rem)', height: isMobile ? '100dvh' : 'auto', background: 'linear-gradient(180deg, #fffdf6 0%, #f9f1da 100%)', borderRadius: isMobile ? 0 : 18, overflow: 'auto', border: isMobile ? 'none' : '1px solid rgba(210,175,110,0.35)', boxShadow: isMobile ? 'none' : '0 24px 64px rgba(51,75,70,0.18)', position: 'relative', margin: 0 }}>
              <button onClick={() => onClassSelect(null)} style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,252,241,0.96)', border: '1px solid rgba(210,175,110,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3a2a10' }} aria-label="Close"><X size={20} /></button>
              <div style={{ display: 'grid', gridTemplateColumns: w >= 640 ? 'min(340px, 38%) 1fr' : '1fr', maxHeight: isMobile ? '100dvh' : 'calc(100dvh - 2rem)', overflow: 'auto' }}>
                <div style={{ position: 'relative', minHeight: w >= 640 ? 300 : 200, maxHeight: w >= 640 ? 'calc(100dvh - 2rem)' : 240, overflow: 'hidden' }}>
                  <img src={viewingClass.image} alt={viewingClass.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} referrerPolicy="no-referrer" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {viewingClass.orgLogo && <img src={viewingClass.orgLogo} alt={viewingClass.org} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(222,154,73,0.6)' }} referrerPolicy="no-referrer" />}
                    {viewingClass.subtheme && <span className="leap-detail-badge">{viewingClass.subtheme}</span>}
                  </div>
                </div>
                <div style={{ padding: isMobile ? '1rem 1rem 1.35rem' : 'clamp(1.1rem, 2.4vw, 2rem)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', fontWeight: 800, color: '#3a2a10', lineHeight: 1.1, marginBottom: '0.4rem' }}>{viewingClass.title}</h1>
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
                          <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9c7a4a', marginBottom: 2 }}>{item.label}</p>
                          <p style={{ fontWeight: 600, color: '#3a2a10', fontSize: '0.88rem' }}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(210,175,110,0.25)', paddingTop: '1rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#3a2a10', marginBottom: '0.6rem' }}>About this class</h3>
                    <p style={{ color: '#6a5040', lineHeight: 1.75, fontSize: '0.95rem' }}>{viewingClass.description || 'No description provided.'}</p>
                  </div>
                  <a href={viewingClass.googleFormUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-leap-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem 2rem', borderRadius: 14, fontSize: '0.9rem', textDecoration: 'none', width: isMobile ? '100%' : 'fit-content' }}>
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