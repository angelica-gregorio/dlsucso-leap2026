/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useRef, useMemo, type CSSProperties, type ErrorInfo, type ReactNode, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, MapPin, Users, ChevronRight, ChevronLeft,
  Menu, X, Info, LogOut, LogIn, AlertCircle,
  Edit, ArrowLeft, ExternalLink, Sparkles, Palette, Mail, Clock,
  Bookmark, User, BookOpen, Wrench, Handshake, HeartPulse
} from 'lucide-react';

import { contentfulClient } from './services/contentful';
import {
  auth, db, googleProvider, signInWithPopup, signOut,
  onAuthStateChanged, doc, getDocFromServer, setDoc
} from './services/firebase';
import type { User as FirebaseUser } from "firebase/auth";

import Home from './pages/Home';
import About from './pages/About';
import MainEvents from './pages/MainEvents';
import FAQs from './pages/FAQs';
import Classes from './pages/Classes';

import leapLogo from './assets/leap.webp';
import salakotCursor from './assets/salakot_cursor.webp';
import styles from './App.module.css';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.props = props;
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <AlertCircle className="mx-auto text-leap-maroon mb-4" size={48} />
            <h2 className={styles.errorTitle} style={{ fontFamily: "'Playfair Display', serif" }}>Something went wrong</h2>
            <p className={styles.errorMessage}>We encountered an unexpected error. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className={styles.errorButton}>Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ══════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const upd = () => {
      const el = document.documentElement;
      setPct(el.scrollTop / (el.scrollHeight - el.clientHeight));
    };
    window.addEventListener('scroll', upd);
    return () => window.removeEventListener('scroll', upd);
  }, []);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, pointerEvents: 'none', background: 'rgba(222,154,73,0.12)' }}>
      <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg,#de9a49,#fae185,#de9a49)', transition: 'width 0.1s linear', boxShadow: '0 0 8px rgba(222,154,73,0.8)' }} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */
const CustomCursor = () => {
  const [dot, setDot] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mv = (e: MouseEvent) => { 
      setDot({ x: e.clientX, y: e.clientY }); 
      setIsVisible(true);
    };
    const leave = () => setIsVisible(false);
    const enter = () => setIsVisible(true);

    window.addEventListener('mousemove', mv);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);

    return () => {
      window.removeEventListener('mousemove', mv);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
    };
  }, []);

  return (
    <div style={{ 
      position: 'fixed', pointerEvents: 'none', zIndex: 99999, 
      left: dot.x, top: dot.y, transform: 'translate(-15%, -15%)',
      opacity: isVisible ? 1 : 0, transition: 'opacity 0.15s ease' 
    }}>
      <img src={salakotCursor} alt="Cursor" style={{ width: 32, height: 32, display: 'block' }} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PARALLAX MOUSE HOOK
══════════════════════════════════════════════════════ */
function useParallaxMouse() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty('--px', x.toString());
      document.documentElement.style.setProperty('--py', y.toString());
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
}

/* ══════════════════════════════════════════════════════
   FIREFLIES
══════════════════════════════════════════════════════ */
const FLIES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (i * 17.3 + (i % 3) * 29) % 94 + 3,
  y: (i * 11.7 + (i % 5) * 13) % 55 + 5,
  size: 2 + (i % 3),
  delay: (i * 0.61) % 7,
  dur: 3.5 + (i % 5) * 0.6,
  driftX: ((i % 7) - 3) * 28,
  driftY: ((i % 5) - 2) * 20,
}));

const Fireflies = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden' }}>
    {FLIES.map(f => (
      <div
        key={f.id}
        className="firefly"
        style={{
          left: `${f.x}%`,
          top: `${f.y}%`,
          width: f.size,
          height: f.size,
          animationDuration: `${f.dur}s, ${f.dur * 0.6}s`,
          animationDelay: `${f.delay}s, ${f.delay}s`,
          transform: `translate(0, 0)`,
          boxShadow: `0 0 ${f.size * 3}px ${f.size * 2}px rgba(250,225,133,0.7)`,
        } as CSSProperties}
      />
    ))}
  </div>
);

const TOOLTIPS: Record<string, { label: string; desc: string }> = {
  hut1: { label: 'Bahay-Kubo', desc: 'A humble home rooted in community and tradition.' },
  hut2: { label: 'Pavilion', desc: 'A welcoming space for gathering and learning.' },
  palay: { label: 'Palay', desc: 'A symbol of harvest, care, and shared growth.' },
  salakot: { label: 'Salakot', desc: 'A classic Filipino hat for sun and field work.' },
  bayong: { label: 'Bayong', desc: 'A woven bag for everyday market life.' },
  pandesal: { label: 'Pandesal', desc: 'A warm staple that brings people together.' },
};

const NayonScene = () => {
  useParallaxMouse();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.34, 1.4, 0.64, 1] }}
            style={{ position: 'fixed', bottom: 'auto', top: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(8,5,2,0.94)', border: '1px solid rgba(222,154,73,0.52)', borderRadius: 8, padding: '8px 18px', pointerEvents: 'none', zIndex: 20, backdropFilter: 'blur(14px)', boxShadow: '0 8px 32px rgba(0,0,0,0.55)', whiteSpace: 'nowrap' }}
          >
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: '#fae185', margin: 0, fontWeight: 700 }}>{TOOLTIPS[hovered]?.label}</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(249,236,182,0.52)', margin: 0, marginTop: 2 }}>{TOOLTIPS[hovered]?.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        viewBox="0 0 1440 480"
        preserveAspectRatio="xMidYMax meet"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', zIndex: 2, pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="volcanoG" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#1a3520" /><stop offset="100%" stopColor="#0d1e10" />
          </linearGradient>
          <linearGradient id="hill3G" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#193825" /><stop offset="100%" stopColor="#0f2018" />
          </linearGradient>
          <linearGradient id="hill2G" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e4a2c" /><stop offset="100%" stopColor="#12271a" />
          </linearGradient>
          <linearGradient id="hill1G" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#245630" /><stop offset="100%" stopColor="#152e1c" />
          </linearGradient>
          <linearGradient id="groundG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a6234" /><stop offset="100%" stopColor="#1a3a20" />
          </linearGradient>
          <linearGradient id="fadeG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0e1a0c" stopOpacity="0" /><stop offset="100%" stopColor="#f9ecb6" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="roofG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c8a46e" /><stop offset="100%" stopColor="#9e7844" />
          </linearGradient>
          <linearGradient id="roofG2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b89460" /><stop offset="100%" stopColor="#8e6838" />
          </linearGradient>
          <linearGradient id="wallG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c49a72" /><stop offset="60%" stopColor="#b8875e" /><stop offset="100%" stopColor="#a07040" />
          </linearGradient>
          <linearGradient id="wallG2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4aa82" /><stop offset="60%" stopColor="#c49870" /><stop offset="100%" stopColor="#b08050" />
          </linearGradient>
          <radialGradient id="summitGlow" cx="50%" cy="10%" r="40%">
            <stop offset="0%" stopColor="#de9a49" stopOpacity="0.2" /><stop offset="100%" stopColor="#de9a49" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mistG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ab09a" stopOpacity="0.07" /><stop offset="100%" stopColor="#4ab09a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="palayG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0c84a" /><stop offset="100%" stopColor="#d4922a" />
          </linearGradient>
          <linearGradient id="salakotG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c07a" /><stop offset="40%" stopColor="#c8963e" /><stop offset="100%" stopColor="#9a6820" />
          </linearGradient>
          <linearGradient id="salakotRimG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4a84e" /><stop offset="100%" stopColor="#8a5c18" />
          </linearGradient>
          <linearGradient id="bayongG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8a840" /><stop offset="100%" stopColor="#c07820" />
          </linearGradient>
          <radialGradient id="pandesalG" cx="38%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#f5c860" /><stop offset="55%" stopColor="#e8a030" /><stop offset="100%" stopColor="#c07018" />
          </radialGradient>
          <radialGradient id="windowGlowG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd966" stopOpacity="0.9" /><stop offset="100%" stopColor="#ff9900" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="hutGlowG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fae185" stopOpacity="0.2" /><stop offset="100%" stopColor="#fae185" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="waterG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ab09a" stopOpacity="0.1" /><stop offset="50%" stopColor="#7dd4c4" stopOpacity="0.18" /><stop offset="100%" stopColor="#4ab09a" stopOpacity="0.07" />
          </linearGradient>
          <filter id="glowF" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softGlowF" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {[[120,30],[280,18],[380,40],[540,14],[680,34],[820,12],[960,26],[1100,38],[1240,16],[1360,30],[160,52],[450,46],[750,42],[1050,50],[1300,54]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill="#fae185" opacity="0.2" className={`star-twinkle star-d${i%5}`}/>
        ))}

        {[[320,60,0.75,0],[380,48,0.6,0.3],[350,54,0.65,0.15],[1060,66,0.75,0.5],[1110,54,0.6,0.7]].map(([x,y,sc,dl],i) => (
          <g key={i} className={`bird bird-d${i}`} style={{ transform: `translate(calc(${x}px + var(--px, 0) * -4px), calc(${y}px + var(--py, 0) * -2px)) scale(${sc})`, animationDelay: `${dl}s` }}>
            <path d="M0 0 Q6 -5 12 0 Q18 -5 24 0" fill="none" stroke="rgba(222,154,73,0.4)" strokeWidth="2" strokeLinecap="round"/>
          </g>
        ))}

        <g style={{ transform: 'translate(calc(var(--px, 0) * -8px), calc(var(--py, 0) * -5px))' }}>
          <ellipse cx="900" cy="120" rx="300" ry="80" fill="url(#summitGlow)" />
          <path d="M900 18 L710 290 L1090 290 Z" fill="url(#volcanoG)" />
          <path d="M900 18 L1090 290 L1020 290 Z" fill="rgba(0,0,0,0.15)" />
          <path d="M900 18 L882 58 L894 54 L900 30 L906 54 L918 58 Z" fill="rgba(240,235,215,0.2)" />
          <ellipse cx="900" cy="22" rx="14" ry="9" fill="rgba(222,154,73,0.22)" className="volcano-pulse"/>
        </g>

        <g style={{ transform: 'translate(calc(var(--px, 0) * -6px), calc(var(--py, 0) * -4px))' }}>
          <path d="M0 250 Q150 195 310 220 Q430 238 550 215 Q620 200 710 290 L0 290 Z" fill="url(#hill3G)" />
          <path d="M1090 290 Q1170 210 1280 200 Q1360 192 1440 220 L1440 290 Z" fill="url(#hill3G)" />
        </g>

        <g style={{ transform: 'translate(calc(var(--px, 0) * -5px), calc(var(--py, 0) * -3px))' }}>
          <path d="M0 295 Q130 255 280 272 Q430 290 560 258 Q680 228 800 265 Q920 302 1060 260 Q1180 225 1310 262 Q1390 282 1440 270 L1440 480 L0 480 Z" fill="url(#hill3G)" />
        </g>
        <g style={{ transform: 'translate(calc(var(--px, 0) * -3px), calc(var(--py, 0) * -2px))' }}>
          <path d="M0 278 Q360 260 720 275 Q1080 290 1440 272 L1440 310 Q1080 328 720 312 Q360 296 0 314 Z" fill="url(#mistG)" />
          <path d="M0 294 Q360 279 720 291 Q1080 303 1440 293 L1440 326 Q1080 326 720 314 Q360 302 0 314 Z" fill="url(#waterG)" />
        </g>
        <g style={{ transform: 'translate(calc(var(--px, 0) * -3px), calc(var(--py, 0) * -2px))' }}>
          <path d="M0 318 Q110 285 250 302 Q400 320 540 290 Q660 264 780 295 Q910 328 1060 290 Q1180 260 1310 290 Q1390 308 1440 298 L1440 480 L0 480 Z" fill="url(#hill2G)" />
        </g>
        <g style={{ transform: 'translate(calc(var(--px, 0) * -1.5px), calc(var(--py, 0) * -1px))' }}>
          <path d="M0 352 Q130 322 300 338 Q460 355 620 325 Q760 298 900 332 Q1050 368 1200 335 Q1330 308 1440 330 L1440 480 L0 480 Z" fill="url(#hill1G)" />
        </g>

        <path d="M0 388 Q360 374 720 382 Q1080 390 1440 380 L1440 480 L0 480 Z" fill="url(#groundG)" />
        <rect x="0" y="408" width="1440" height="6" rx="3" fill="#1a4a22" opacity="0.5" />
        {[40,100,160,220,310,400,500,580,660,750,840,940,1040,1140,1240,1320,1380].map((x, i) => (
          <g key={i} transform={`translate(${x}, 408)`}>
            <path d={`M0 0 Q-3 -8 -1 -14 Q1 -8 0 0`} fill="#2a6a30" opacity="0.6" />
            <path d={`M0 0 Q3 -6 5 -11 Q4 -6 0 0`} fill="#2a6a30" opacity="0.5" />
          </g>
        ))}

        <g style={{ transform: 'translate(calc(36px + var(--px, 0) * 7px), calc(226px + var(--py, 0) * 4px))' }}>
          <path d="M0 190 Q3 152 -2 115 Q-5 86 0 56 Q4 26 2 0" stroke="#7a5a30" strokeWidth="9" fill="none" strokeLinecap="round"/>
          <path d="M0 190 Q3 152 -2 115 Q-5 86 0 56 Q4 26 2 0" stroke="#a07840" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.3"/>
          {[[-140,88],[-110,104],[-80,98],[-50,92],[-20,85],[10,78],[40,72]].map(([angle,len],i) => {
            const r = ((angle as number)*Math.PI)/180;
            return <path key={i} d={`M2 0 Q${2+Math.cos(r)*(len as number)/2} ${Math.sin(r)*(len as number)/2} ${2+Math.cos(r)*(len as number)} ${Math.sin(r)*(len as number)}`} stroke="#1a6030" strokeWidth="3.5" fill="none" strokeLinecap="round" className={`palm-sway palm-d${i%4}`}/>;
          })}
          <ellipse cx="8" cy="-4" rx="7" ry="8" fill="#6a4020"/>
          <ellipse cx="-5" cy="2" rx="6" ry="7" fill="#5a3a18"/>
        </g>

        <g style={{ transform: 'translate(calc(1398px + var(--px, 0) * 9px), calc(238px + var(--py, 0) * 4px))' }}>
          <path d="M0 178 Q-3 143 2 106 Q5 80 0 52 Q-4 24 -2 0" stroke="#7a5a30" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <path d="M0 178 Q-3 143 2 106 Q5 80 0 52 Q-4 24 -2 0" stroke="#a07840" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.28"/>
          {[-150,-120,-90,-60,-30,0,30].map((angle,i) => {
            const r = (angle*Math.PI)/180; const len = 76+i*5;
            return <path key={i} d={`M-2 0 Q${-2+Math.cos(r)*len/2} ${Math.sin(r)*len/2} ${-2+Math.cos(r)*len} ${Math.sin(r)*len}`} stroke="#1a6030" strokeWidth="3" fill="none" strokeLinecap="round" className={`palm-sway palm-d${i%4}`}/>;
          })}
          <ellipse cx="-6" cy="-2" rx="6" ry="7" fill="#6a4020"/>
          <ellipse cx="4" cy="4" rx="5" ry="6" fill="#5a3a18"/>
        </g>

        <g style={{ transform: 'translate(calc(108px + var(--px, 0) * 5px), calc(230px + var(--py, 0) * 3px))', cursor:'pointer', pointerEvents:'all' }}
          onMouseEnter={() => setHovered('hut1')} onMouseLeave={() => setHovered(null)}
          filter={hovered==='hut1' ? 'url(#glowF)' : undefined}>
          <ellipse cx="94" cy="190" rx="80" ry="13" fill="url(#hutGlowG)"/>
          <rect x="18" y="118" width="7" height="68" rx="3" fill="#7a5030" />
          <rect x="68" y="118" width="7" height="68" rx="3" fill="#7a5030" />
          <rect x="118" y="118" width="7" height="68" rx="3" fill="#7a5030" />
          <rect x="158" y="118" width="7" height="68" rx="3" fill="#7a5030" />
          <line x1="21" y1="135" x2="72" y2="168" stroke="#6a4020" strokeWidth="2.5" opacity="0.6" />
          <line x1="72" y1="135" x2="21" y2="168" stroke="#6a4020" strokeWidth="2.5" opacity="0.6" />
          <line x1="121" y1="135" x2="162" y2="168" stroke="#6a4020" strokeWidth="2.5" opacity="0.6" />
          <rect x="8" y="114" width="172" height="9" rx="2" fill="#8a6038" />
          <rect x="12" y="52" width="164" height="64" rx="2" fill="url(#wallG)" />
          <rect x="142" y="52" width="34" height="64" rx="2" fill="rgba(0,0,0,0.12)" />
          <rect x="76" y="76" width="36" height="40" rx="2" fill="#5a3520" />
          <rect x="78" y="78" width="15" height="36" rx="1" fill="#6a4028" />
          <rect x="95" y="78" width="15" height="36" rx="1" fill="#6a4028" />
          <circle cx="93" cy="97" r="2.5" fill="#de9a49" opacity="0.8"/>
          <rect x="22" y="68" width="36" height="26" rx="2" fill="url(#windowGlowG)" opacity="0.72" />
          <line x1="40" y1="68" x2="40" y2="94" stroke="#8a6038" strokeWidth="2" />
          <line x1="22" y1="81" x2="58" y2="81" stroke="#8a6038" strokeWidth="2" />
          <ellipse cx="40" cy="81" rx="20" ry="14" fill="#ffcc44" opacity="0.06" className="window-flicker"/>
          <rect x="126" y="68" width="36" height="26" rx="2" fill="url(#windowGlowG)" opacity="0.62" />
          <line x1="144" y1="68" x2="144" y2="94" stroke="#8a6038" strokeWidth="2" />
          <line x1="126" y1="81" x2="162" y2="81" stroke="#8a6038" strokeWidth="2" />
          <path d="M-10 54 L94 4 L198 54 Z" fill="url(#roofG)" />
          <path d="M94 4 L198 54 L160 54 Z" fill="rgba(0,0,0,0.18)" />
          <line x1="94" y1="4" x2="20" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
          <line x1="94" y1="4" x2="50" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
          <line x1="94" y1="4" x2="80" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
          <line x1="94" y1="4" x2="110" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
          <line x1="94" y1="4" x2="140" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
          <line x1="94" y1="4" x2="168" y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />
          <ellipse cx="94" cy="4" rx="6" ry="5" fill="#b08040" />
          <rect x="-10" y="52" width="208" height="6" rx="2" fill="rgba(0,0,0,0.15)" />
          <rect x="-10" y="50" width="208" height="4" rx="2" fill="#c89850" opacity="0.48"/>
          <path d="M148 50 Q152 40 148 30 Q145 22 150 14" fill="none" stroke="rgba(200,190,170,0.12)" strokeWidth="4.5" strokeLinecap="round" className="smoke-rise"/>
          <rect x="88" y="138" width="5" height="46" rx="2" fill="#7a5030" transform="rotate(-8,90,160)" />
          <rect x="100" y="140" width="5" height="46" rx="2" fill="#7a5030" transform="rotate(-8,102,163)" />
          <line x1="88" y1="152" x2="104" y2="148" stroke="#7a5030" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="163" x2="103" y2="159" stroke="#7a5030" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="174" x2="103" y2="170" stroke="#7a5030" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g style={{ transform: 'translate(calc(980px + var(--px, 0) * 3px), calc(255px + var(--py, 0) * 2px))', cursor:'pointer', pointerEvents:'all' }}
          onMouseEnter={() => setHovered('hut2')} onMouseLeave={() => setHovered(null)}
          filter={hovered==='hut2' ? 'url(#softGlowF)' : undefined}>
          <ellipse cx="80" cy="162" rx="66" ry="11" fill="url(#hutGlowG)"/>
          <rect x="16" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
          <rect x="58" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
          <rect x="100" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
          <rect x="136" y="104" width="6" height="58" rx="2.5" fill="#7a5030" />
          <rect x="8" y="100" width="148" height="8" rx="2" fill="#8a6038" />
          <rect x="12" y="48" width="140" height="54" rx="2" fill="url(#wallG2)" />
          <rect x="122" y="48" width="30" height="54" rx="2" fill="rgba(0,0,0,0.1)" />
          <rect x="62" y="66" width="30" height="36" rx="2" fill="#5a3520" />
          <rect x="64" y="68" width="12" height="32" rx="1" fill="#6a4028" />
          <rect x="78" y="68" width="12" height="32" rx="1" fill="#6a4028" />
          <circle cx="77" cy="85" r="2" fill="#de9a49" opacity="0.72"/>
          <rect x="18" y="60" width="30" height="22" rx="2" fill="url(#windowGlowG)" opacity="0.68" />
          <line x1="33" y1="60" x2="33" y2="82" stroke="#8a6038" strokeWidth="1.5" />
          <line x1="18" y1="71" x2="48" y2="71" stroke="#8a6038" strokeWidth="1.5" />
          <ellipse cx="33" cy="71" rx="16" ry="11" fill="#ffcc44" opacity="0.06" className="window-flicker window-flicker-d1"/>
          <path d="M-8 50 L82 4 L168 50 Z" fill="url(#roofG2)" />
          <path d="M82 4 L168 50 L138 50 Z" fill="rgba(0,0,0,0.16)" />
          <line x1="82" y1="4" x2="18" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
          <line x1="82" y1="4" x2="45" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
          <line x1="82" y1="4" x2="70" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
          <line x1="82" y1="4" x2="96" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
          <line x1="82" y1="4" x2="120" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
          <line x1="82" y1="4" x2="148" y2="50" stroke="rgba(100,70,30,0.28)" strokeWidth="1.5" />
          <ellipse cx="82" cy="4" rx="5" ry="5" fill="#b08040" />
          <rect x="8" y="48" width="170" height="5" rx="2" fill="rgba(0,0,0,0.12)" />
          <rect x="8" y="46" width="170" height="4" rx="2" fill="#c89850" opacity="0.4"/>
        </g>

        <g style={{ transform: 'translate(calc(610px + var(--px, 0) * 2px), calc(270px + var(--py, 0) * 1.5px))', cursor:'pointer', pointerEvents:'all' }}
          onMouseEnter={() => setHovered('palay')} onMouseLeave={() => setHovered(null)}
          filter={hovered==='palay' ? 'url(#softGlowF)' : undefined}>
          <ellipse cx="90" cy="152" rx="92" ry="8" fill="rgba(12,35,12,0.24)"/>
          <g className="palay-stalk sway-a" style={{ animationDelay:'0s', transformOrigin:'30px 150px' }}>
            <path d="M30 150 Q28 110 22 70 Q20 50 18 30" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M18 30 Q12 20 8 12 Q6 8 5 4" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {[4,8,12,16,20,24].map((y,i) => (<ellipse key={i} cx={5+(i%2===0?-3:3)} cy={y} rx="4.5" ry="7" fill="url(#palayG)" transform={`rotate(${-20+(i%2)*40},${5+(i%2===0?-3:3)},${y})`}/>))}
            <path d="M22 70 Q5 60 -8 55" stroke="#5a9020" strokeWidth="2" fill="none" />
            <path d="M26 90 Q40 78 52 75" stroke="#5a9020" strokeWidth="2" fill="none" />
          </g>
          <g className="palay-stalk sway-b" style={{ animationDelay:'0.4s', transformOrigin:'60px 150px' }}>
            <path d="M60 150 Q58 112 55 72 Q53 52 50 32" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M50 32 Q44 22 40 14 Q38 10 36 5" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {[5,9,13,17,21,25].map((y,i) => (<ellipse key={i} cx={36+(i%2===0?-3:3)} cy={y} rx="4.5" ry="7" fill="url(#palayG)" transform={`rotate(${-18+(i%2)*36},${36+(i%2===0?-3:3)},${y})`}/>))}
            <path d="M53 75 Q38 65 25 62" stroke="#5a9020" strokeWidth="2" fill="none" />
            <path d="M55 95 Q70 85 80 82" stroke="#5a9020" strokeWidth="2" fill="none" />
          </g>
          <g className="palay-stalk sway-a" style={{ animationDelay:'0.2s', transformOrigin:'95px 150px' }}>
            <path d="M95 150 Q93 108 90 65 Q88 45 86 22" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M86 22 Q80 12 76 4 Q74 0 72 -4" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {[-4,0,4,8,12,16,20].map((y,i) => (<ellipse key={i} cx={72+(i%2===0?-4:4)} cy={y} rx="5" ry="7.5" fill="url(#palayG)" transform={`rotate(${-22+(i%2)*44},${72+(i%2===0?-4:4)},${y})`}/>))}
            <path d="M88 68 Q72 58 58 54" stroke="#5a9020" strokeWidth="2" fill="none" />
            <path d="M90 90 Q106 80 118 76" stroke="#5a9020" strokeWidth="2" fill="none" />
          </g>
          <g className="palay-stalk sway-b" style={{ animationDelay:'0.6s', transformOrigin:'128px 150px' }}>
            <path d="M128 150 Q126 113 123 73 Q121 53 118 33" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M118 33 Q112 23 108 15 Q106 11 104 6" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {[6,10,14,18,22,26].map((y,i) => (<ellipse key={i} cx={104+(i%2===0?-3:3)} cy={y} rx="4.5" ry="7" fill="url(#palayG)" transform={`rotate(${-20+(i%2)*40},${104+(i%2===0?-3:3)},${y})`}/>))}
            <path d="M121 76 Q107 65 92 62" stroke="#5a9020" strokeWidth="2" fill="none" />
            <path d="M124 98 Q138 88 150 84" stroke="#5a9020" strokeWidth="2" fill="none" />
          </g>
          <g className="palay-stalk sway-a" style={{ animationDelay:'0.8s', transformOrigin:'158px 150px' }}>
            <path d="M158 150 Q156 115 154 78 Q152 58 150 38" stroke="#4a7a20" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M150 38 Q144 28 140 20 Q138 16 136 11" stroke="#5a8a25" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {[11,15,19,23,27,31].map((y,i) => (<ellipse key={i} cx={136+(i%2===0?-3:3)} cy={y} rx="4" ry="6.5" fill="url(#palayG)" transform={`rotate(${-18+(i%2)*36},${136+(i%2===0?-3:3)},${y})`}/>))}
            <path d="M152 80 Q138 70 124 67" stroke="#5a9020" strokeWidth="2" fill="none" />
            <path d="M154 100 Q168 90 178 87" stroke="#5a9020" strokeWidth="2" fill="none" />
          </g>
          {[10,30,50,70,90,110,130,150,170].map((x,i) => (
            <path key={i} d={`M${x} 150 Q${x-4} 138 ${x-2} 128`} stroke="#3a7020" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          ))}
        </g>

        <g style={{ transform: 'translate(calc(1218px + var(--px, 0) * 4px), calc(315px + var(--py, 0) * 2px))', cursor:'pointer', pointerEvents:'all' }}
          onMouseEnter={() => setHovered('salakot')} onMouseLeave={() => setHovered(null)}
          filter={hovered==='salakot' ? 'url(#glowF)' : undefined}>
          <ellipse cx="0" cy="155" rx="70" ry="10" fill="rgba(0,0,0,0.25)"/>
          <path d="M0 0 L-85 85 Q-90 95 -80 100 Q0 108 80 100 Q90 95 85 85 Z" fill="url(#salakotG)"/>
          <path d="M0 0 L85 85 Q90 95 80 100 Q40 105 0 105 Z" fill="rgba(0,0,0,0.15)"/>
          {[25, 45, 65, 85].map((y, i) => {
            const w = 22 + (i * 16);
            return <path key={i} d={`M${-w} ${y} Q0 ${y-4} ${w} ${y}`} fill="none" stroke="rgba(100,60,10,0.25)" strokeWidth="1.5" />;
          })}
          {[-70, -45, -20, 0, 20, 45, 70].map((ang, i) => (
             <line key={i} x1="0" y1="0" x2={Math.sin(ang * Math.PI/180)*90} y2={95} stroke="rgba(100,60,10,0.2)" strokeWidth="1.2" />
          ))}
          <circle cx="0" cy="0" r="6" fill="#b07020" />
          <circle cx="0" cy="0" r="3" fill="#de9a49" />
          <ellipse cx="0" cy="98" rx="95" ry="14" fill="url(#salakotRimG)" />
          <ellipse cx="0" cy="98" rx="95" ry="14" fill="none" stroke="#de9a49" strokeWidth="1.5" opacity="0.6" />
          <path d="M-40 105 Q-35 125 -30 155" fill="none" stroke="#8a5c18" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 105 Q35 125 30 155" fill="none" stroke="#8a5c18" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="0" cy="155" rx="30" ry="4" fill="#7a4c10" opacity="0.6" />
        </g>

        <g style={{ transform: 'translate(calc(1340px + var(--px, 0) * 5px), calc(348px + var(--py, 0) * 3px))', cursor:'pointer', pointerEvents:'all' }}
          onMouseEnter={() => setHovered('bayong')} onMouseLeave={() => setHovered(null)}
          filter={hovered==='bayong' ? 'url(#softGlowF)' : undefined}>
          <ellipse cx="40" cy="96" rx="44" ry="7" fill="rgba(12,35,12,0.22)"/>
          <path d="M10 8 Q4 4 2 0 Q0 -4 4 -8 Q10 -10 16 -8 Q22 -4 20 0 Q18 4 12 8 Z" fill="#de9a49" />
          <path d="M14 8 Q18 4 22 0 Q24 -4 28 -8 Q32 -10 36 -8 Q42 -4 40 0 Q38 4 32 8 Z" fill="#de9a49" />
          <path d="M2 8 L4 90 L76 90 L78 8 Z" fill="url(#bayongG)" />
          {[18,32,46,60,74].map((y, row) =>
            [8,22,36,50,64].map((x, col) => (
              <path key={`${row}-${col}`}
                d={`M${x+8} ${y} L${x+16} ${y+7} L${x+8} ${y+14} L${x} ${y+7} Z`}
                fill={((row+col)%2===0) ? 'rgba(220,140,20,0.6)' : 'rgba(180,90,10,0.4)'}
                stroke="rgba(120,60,0,0.25)" strokeWidth="0.5"
              />
            ))
          )}
          <ellipse cx="40" cy="90" rx="38" ry="6" fill="#b06820" />
          <path d="M16 8 Q18 -12 26 -20 Q34 -28 40 -28 Q46 -28 54 -20 Q62 -12 64 8" fill="none" stroke="#c07020" strokeWidth="5" strokeLinecap="round" />
          <path d="M16 8 Q18 -12 26 -20 Q34 -28 40 -28 Q46 -28 54 -20 Q62 -12 64 8" fill="none" stroke="#de9a49" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <path d="M22 -4 Q32 -24 48 -4" fill="none" stroke="rgba(255,200,80,0.4)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g style={{ transform: 'translate(calc(408px + var(--px, 0) * 3px), calc(352px + var(--py, 0) * 2px))', cursor:'pointer', pointerEvents:'all' }}
          onMouseEnter={() => setHovered('pandesal')} onMouseLeave={() => setHovered(null)}
          filter={hovered==='pandesal' ? 'url(#glowF)' : undefined}>
          <ellipse cx="55" cy="108" rx="68" ry="9" fill="rgba(12,35,12,0.24)"/>
          <ellipse cx="72" cy="52" rx="62" ry="46" fill="#d4881c" opacity="0.85" />
          <ellipse cx="72" cy="52" rx="62" ry="46" fill="url(#pandesalG)" opacity="0.9" />
          {[[55,30],[68,25],[80,28],[88,36],[85,46],[78,52],[65,48],[58,42],[72,40],[90,28]].map(([dx,dy],i) => (
            <ellipse key={i} cx={dx} cy={dy} rx="2.5" ry="2" fill="rgba(255,220,120,0.7)" />
          ))}
          <ellipse cx="46" cy="62" rx="64" ry="48" fill="#c07810" opacity="0.9" />
          <ellipse cx="46" cy="62" rx="64" ry="48" fill="url(#pandesalG)" />
          <ellipse cx="28" cy="44" rx="22" ry="14" fill="rgba(255,220,100,0.25)" transform="rotate(-20,28,44)" />
          {[[24,42],[36,36],[50,32],[62,38],[70,48],[64,58],[50,62],[36,58],[26,52],[42,48],[58,44]].map(([dx,dy],i) => (
            <ellipse key={i} cx={dx} cy={dy} rx="2.8" ry="2.2" fill="rgba(255,220,120,0.65)" />
          ))}
          <ellipse cx="55" cy="106" rx="66" ry="8" fill="rgba(20,60,20,0.3)" />
        </g>

        <rect x="0" y="415" width="1440" height="65" fill="url(#fadeG)" />
        {Array.from({length: 32}).map((_,i) => (
          <g key={i} transform={`translate(${i*46+8}, 418)`} className={`palay-border palay-border-d${i%5}`}>
            <line x1="6" y1="42" x2={4+(i%2===0?-2:2)} y2="14" stroke="#7c6b4b" strokeWidth="1.5" strokeLinecap="round" opacity="0.22" />
            <ellipse cx={4+(i%2===0?-2:2)} cy="9" rx="3" ry="6" fill="#de9a49" opacity="0.12" transform={`rotate(${-12+(i%3)*10},${4+(i%2===0?-2:2)},9)`} />
          </g>
        ))}
      </svg>
    </>
  );
};

/* ══════════════════════════════════════════════════════
   SUBTHEMES STRIP
══════════════════════════════════════════════════════ */
const SUBTHEMES = [
  { icon: <BookOpen size={20} />, label: 'Palayan ng Karunungan' },
  { icon: <Wrench size={20} />, label: 'Pamilihan ng Kakayahan' },
  { icon: <Palette size={20} />, label: 'Plaza ng Malikhaing Diwa' },
  { icon: <Handshake size={20} />, label: 'Dambana ng Pagkakaisa' },
  { icon: <HeartPulse size={20} />, label: 'Palaisdaan ng Kalusugan' },
  { icon: <Users size={20} />, label: 'Bahay ng Bayanihan' },
];

const SubthemesStrip = ({
  activeTheme,
  onSelect,
  compact = false,
}: {
  activeTheme: string | null;
  onSelect: (t: string | null) => void;
  compact?: boolean;
}) => (
  /*
   * FIX: wrap the compact inner in an overflow-hidden shell so the
   * horizontally-scrollable row never bleeds outside its container,
   * while still letting the pills be larger and on a single line.
   */
  <div className={compact ? styles.subthemesCompactShell : styles.subthemesSection}>
    <div
      className={compact ? styles.subthemesCompactInner : styles.subthemesInner}
      /* FIX: clip overflow on the compact variant so the scrollable row
         doesn't break the page layout */
      style={compact ? { overflow: 'hidden' } : undefined}
    >
      <span className={compact ? styles.subthemesCompactLabel : styles.subthemesLabel}>Subthemes</span>
      {compact ? (
        /* FIX: add subthemesRowCompact class for no-wrap + overflow-x:auto */
        <div className={`${styles.subthemesRow} ${styles.subthemesRowCompact}`}>
          <button
            className={`${styles.subthemeAssetButton} ${activeTheme === null ? styles.subthemeAssetActive : ''}`}
            onClick={() => onSelect(null)}
          >
            <span className={styles.subthemeAssetIcon}><Sparkles size={20} /></span>
            <span className={styles.subthemeAssetLabel}>All Themes</span>
          </button>
          {SUBTHEMES.map((s, i) => (
            <button
              key={i}
              className={`${styles.subthemeAssetButton} ${activeTheme === s.label ? styles.subthemeAssetActive : ''}`}
              onClick={() => onSelect(activeTheme === s.label ? null : s.label)}
            >
              <span className={styles.subthemeAssetIcon}>{s.icon}</span>
              <span className={styles.subthemeAssetLabel}>{s.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.subthemesRow}>
          <button
            className={`${styles.subthemePill} ${activeTheme === null ? styles.subthemePillActive : ''}`}
            onClick={() => onSelect(null)}
          >
            <span className={styles.subthemePillIcon}><Sparkles size={20} /></span>
            <span className={styles.subthemePillLabel}>All</span>
          </button>
          {SUBTHEMES.map((s, i) => (
            <button
              key={i}
              className={`${styles.subthemePill} ${activeTheme === s.label ? styles.subthemePillActive : ''}`}
              onClick={() => onSelect(activeTheme === s.label ? null : s.label)}
            >
              <span className={styles.subthemePillIcon}>{s.icon}</span>
              <span className={styles.subthemePillLabel}>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN EVENTS SECTION
══════════════════════════════════════════════════════ */
const MainEventsSection = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(() => {
    const fetchMainEvents = async () => {
      if (!contentfulClient) return;
      try {
        const response = await contentfulClient.getEntries({ content_type: 'mainEvents', include: 2, limit: 5 });
        
        if (response.items.length > 0) {
          const eventList = response.items.map((item: any) => {
            const pubMat = item.fields.mainEventPosterPublishingMaterial;
            const mediaAsset = Array.isArray(pubMat) ? pubMat[0] : pubMat;
            
            let imgUrl = `https://placehold.co/812x510?text=No+Image+Found`;
            if (mediaAsset?.fields?.file?.url) {
              imgUrl = mediaAsset.fields.file.url.startsWith('http') 
                ? mediaAsset.fields.file.url 
                : `https:${mediaAsset.fields.file.url}`;
            }

            let formattedDate = '', formattedTime = '';
            if (item.fields.mainEventStartDate) {
              const startObj = new Date(item.fields.mainEventStartDate);
              formattedDate = startObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              formattedTime = startObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              
              if (item.fields.mainEventEndDate) {
                const endObj = new Date(item.fields.mainEventEndDate);
                const endDateStr = endObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                if (formattedDate === endDateStr) {
                  formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                } else {
                  formattedDate += ` to ${endDateStr}`;
                  formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                }
              }
            }

            const orgLogoMat = item.fields.mainEventOrganizationInChargeLogo;
            const orgLogoAsset = Array.isArray(orgLogoMat) ? orgLogoMat[0] : orgLogoMat;

            return {
              id: item.sys.id,
              label: item.fields.mainEventTitle || 'Untitled Event',
              image: imgUrl,
              org: item.fields.mainEventOrganizationInCharge || '',
              modality: item.fields.mainEventClassModality || 'Face-to-Face',
              date: formattedDate,
              time: formattedTime,
              venue: item.fields.mainEventVenue || '',
              slots: item.fields.mainEventNumberOfSlots || 0,
              subtheme: item.fields.mainEventSubtheme || '',
              orgLogo: orgLogoAsset?.fields?.file?.url ? `https:${orgLogoAsset.fields.file.url}` : null,
              googleFormUrl: item.fields.mainEventRegistrationLink || '',
              description: item.fields.mainEventDescription || ''
            };
          });
          
          if (eventList.length === 2) {
            eventList.push({ ...eventList[0], id: `${eventList[0].id}-dup1` });
            eventList.push({ ...eventList[1], id: `${eventList[1].id}-dup1` });
          }
          
          setEvents(eventList);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Contentful Error (Main Events):", error);
      }
    };

    fetchMainEvents();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (!intervalId) intervalId = setInterval(fetchMainEvents, 60000);
    };
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMainEvents();
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, []);

  const goPrev = () => setActiveIndex((current) => (current - 1 + events.length) % events.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % events.length);

  useEffect(() => {
    if (events.length <= 1) return;
    const rotateInterval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % events.length);
    }, 4200);

    return () => window.clearInterval(rotateInterval);
  }, [events.length]);

  const totalEvents = events.length;
  
  if (totalEvents === 0) {
    return (
      <section className="relative overflow-hidden rounded-[28px] px-0 py-2 min-h-[400px] flex items-center justify-center">
        <div className="leap-spinner" />
      </section>
    );
  }

  const visibleIndexes = totalEvents === 1
    ? [0]
    : [
        (activeIndex - 1 + totalEvents) % totalEvents,
        activeIndex,
        (activeIndex + 1) % totalEvents,
      ];

  return (
    <section className="relative overflow-hidden rounded-[28px] px-0 py-2">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(222,154,73,0.18)_0%,rgba(222,154,73,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0e1a0c]/85" />

      <div className="relative mx-auto w-full max-w-[1500px] px-2 sm:px-4">
        <div className="relative mx-auto w-full max-w-[1600px] overflow-visible py-1 sm:py-3">
          <div className="flex items-center justify-center -space-x-10 sm:-space-x-16 lg:-space-x-24">
            {visibleIndexes.map((eventIndex, slot) => {
              const event = events[eventIndex];
              const isCenter = totalEvents === 1 ? true : slot === 1;

              return (
                <motion.button
                  key={`${event.label}-${eventIndex}-${activeIndex}-slot${slot}`}
                  type="button"
                  onClick={() => setActiveIndex(eventIndex)}
                  initial={false}
                  animate={{
                    scale: isCenter ? 1 : 0.88,
                    y: isCenter ? 0 : 18,
                    opacity: isCenter ? 1 : 0.85,
                    zIndex: isCenter ? 3 : 2,
                    boxShadow: isCenter
                      ? '0 24px 62px rgba(0,0,0,0.34), inset 0 2px 12px rgba(249,236,182,0.35), inset 0 -1px 0 rgba(255,255,255,0.3)'
                      : '0 12px 28px rgba(0,0,0,0.24)',
                  }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: isCenter ? 'clamp(360px, 46vw, 860px)' : 'clamp(250px, 31vw, 620px)',
                    height: isCenter ? 'clamp(280px, 38vw, 470px)' : 'clamp(220px, 30vw, 390px)',
                    borderRadius: 34,
                    overflow: 'hidden',
                    border: isCenter ? '1px solid rgba(249,236,182,0.45)' : '1px solid rgba(249,236,182,0.2)',
                    background: '#fff',
                    position: 'relative',
                  }}
                  className="group relative"
                >
                  <img
                    src={event.image}
                    alt={event.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isCenter
                        ? 'linear-gradient(to top, rgba(0,0,0,0.22), rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.8))'
                        : 'linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0.1) 45%, rgba(0,0,0,0))',
                    }}
                  />
                  {isCenter && event.org && (
                    <>
                      <div className={styles.cardSlotsLabel} style={{ padding: '6px 14px', top: '32px', right: '32px', zIndex: 10 }}>
                        {event.slots} SLOTS
                      </div>
                      
                      <div className={styles.cardOverlayTopRow} style={{ position: 'absolute', top: '32px', left: '32px', zIndex: 10, margin: 0 }}>
                        {event.orgLogo ? (
                          <img src={event.orgLogo} alt={event.org} className={styles.cardOrgLogo} referrerPolicy="no-referrer" />
                        ) : (
                          <div className={styles.cardOrgLogoPlaceholder}>
                            {event.org.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {event.subtheme && (
                          <span className={`${styles.cardBadge} ${styles.cardBadgeTheme}`}>{event.subtheme}</span>
                        )}
                      </div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className={styles.cardOverlayContent}
                        style={{ pointerEvents: 'none', padding: '36px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                      >
                        <p className={styles.cardOrganization} style={{ textAlign: 'center', width: '100%', marginBottom: '4px' }}>{event.org}</p>
                        <h3 className={styles.cardTitle} style={{ fontFamily: "'Playfair Display', serif", textAlign: 'center', width: '100%' }}>
                          {event.label}
                        </h3>

                        <div className={styles.cardMetadataOverlay} style={{ alignItems: 'center' }}>
                          <div className={styles.metadataItem}><Calendar size={12} className={styles.metadataIcon} /><span>{event.date} · {event.time}</span></div>
                          <div className={styles.metadataItem}><MapPin size={12} className={styles.metadataIcon} /><span>{event.venue} ({event.modality})</span></div>
                        </div>

                        <div className={styles.cardActionsOverlay} style={{ pointerEvents: 'auto', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
                          <a href={event.googleFormUrl || "#"} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={styles.registerBtnOverlay}>
                            Register <ExternalLink size={13} />
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className={styles.learnMoreBtnOverlay}>
                            Learn More <ChevronRight size={13} />
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {totalEvents > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4 sm:mt-5">
              <button
                type="button"
                aria-label="Previous event"
                onClick={goPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(249,236,182,0.28)] bg-[rgba(12,9,4,0.72)] text-[#f9ecb6] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition hover:bg-[rgba(222,154,73,0.18)] hover:text-[#fae185]"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-2">
                {events.map((event, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={`carousel-dot-${index}`}
                      type="button"
                      aria-label={`Show ${event.label}`}
                      onClick={() => setActiveIndex(index)}
                      className={`transition-all duration-300 ${isActive ? 'h-2.5 w-9 rounded-full bg-[#fae185] shadow-[0_0_18px_rgba(250,225,133,0.65)]' : 'h-2.5 w-2.5 rounded-full bg-[rgba(249,236,182,0.35)] hover:bg-[rgba(250,225,133,0.7)]'}`}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                aria-label="Next event"
                onClick={goNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(249,236,182,0.28)] bg-[rgba(12,9,4,0.72)] text-[#f9ecb6] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition hover:bg-[rgba(222,154,73,0.18)] hover:text-[#fae185]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const LeapApp = () => {
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

  interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'student' | 'admin';
    registeredClasses: string[];
  }

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<LeapClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'major-events' | 'classes' | 'faq' | 'contact'>('home');
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc'>('title-asc');
  const [activeSubtheme, setActiveSubtheme] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingClass, setViewingClass] = useState<LeapClass | null>(null);
  const hasLoggedProfilePermissionIssue = useRef(false);

  const navigateTo = (view: 'home' | 'about' | 'major-events' | 'classes' | 'faq' | 'contact') => {
    setCurrentView(view);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAndSortedClasses: LeapClass[] = useMemo(() => {
    let result = classes.filter((c: LeapClass) => (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtheme.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    if (activeSubtheme) {
      result = result.filter((c: LeapClass) => c.subtheme.toLowerCase().includes(activeSubtheme.toLowerCase()));
    }
    result.sort((a: LeapClass, b: LeapClass) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'slots-desc') return b.slots - a.slots;
      if (sortBy === 'slots-asc') return a.slots - b.slots;
      return 0;
    });
    return result;
  }, [classes, searchQuery, sortBy, activeSubtheme]);

  const uniqueDays: string[] = useMemo(() => (
    Array.from(new Set(filteredAndSortedClasses.map((c: LeapClass) => c.date)))
      .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())
  ), [filteredAndSortedClasses]);

  const isVerifiedDlsuUser = Boolean(user?.emailVerified && user.email?.toLowerCase().endsWith('@dlsu.edu.ph'));

  const hasAppAccess = isVerifiedDlsuUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      void (async () => {
        try {
          setUser(currentUser);
          if (currentUser) {
            const currentEmail = currentUser.email?.toLowerCase();
            if (!currentUser.emailVerified || !currentEmail?.endsWith('@dlsu.edu.ph')) {
              setUserProfile(null);
              setIsAdminView(false);
              navigateTo('home');
              await signOut(auth);
              alert('Please use a verified @dlsu.edu.ph Google account to sign in.');
              return;
            }

            try {
              const userDoc = await getDocFromServer(doc(db, 'users', currentUser.uid));
              if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
              } else {
                const newProfile: UserProfile = {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.displayName,
                  photoURL: currentUser.photoURL,
                  role: 'student',
                  registeredClasses: [],
                };
                await setDoc(doc(db, 'users', currentUser.uid), newProfile);
                setUserProfile(newProfile);
              }
            } catch (error: unknown) {
              const isPermissionDenied =
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error as { code?: string }).code === 'permission-denied';

              if (isPermissionDenied) {
                if (!hasLoggedProfilePermissionIssue.current) {
                  console.warn('Firestore profile access denied by security rules. Using auth-only fallback profile.');
                  hasLoggedProfilePermissionIssue.current = true;
                }
              } else {
                console.error('Firestore profile bootstrap failed:', error);
              }
              // Fallback profile keeps the UI usable even when Firestore rules deny access.
              setUserProfile({
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: 'student',
                registeredClasses: [],
              });
            }
          } else {
            setUserProfile(null);
            setIsAdminView(false);
            setCurrentView('home');
          }
        } catch (error: unknown) {
          console.error('Auth state handling failed:', error);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      })();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchClasses = async () => {
      if (!contentfulClient) { setLoading(false); return; }
      try {
        const response = await contentfulClient.getEntries({ content_type: 'leapClass2026' });
        const classList: LeapClass[] = response.items.map((item: any) => {
          let formattedDate = '', formattedTime = '';
          if (item.fields.startDate) {
            const startObj = new Date(item.fields.startDate);
            formattedDate = startObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            formattedTime = startObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            
            if (item.fields.endDate) {
              const endObj = new Date(item.fields.endDate);
              const endDateStr = endObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              
              if (formattedDate === endDateStr) {
                formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
              } else {
                formattedDate += ` to ${endDateStr}`;
                formattedTime += ` - ${endObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
              }
            }
          }
          return {
            id: item.sys.id, title: item.fields.title || '', org: item.fields.organizationInCharge || '',
            modality: item.fields.classModality || 'Face-to-Face', date: formattedDate, time: formattedTime,
            venue: item.fields.venue || '', slots: item.fields.numberOfSlots || 0, subtheme: item.fields.subtheme || '',
            image: item.fields.posterPublishingMaterial?.fields?.file?.url ? `https:${item.fields.posterPublishingMaterial.fields.file.url}` : 'https://picsum.photos/seed/leap/400/250',
            orgLogo: item.fields.organizationInChargeLogo?.fields?.file?.url ? `https:${item.fields.organizationInChargeLogo.fields.file.url}` : null,
            googleFormUrl: item.fields.registrationLink || '',
            description: item.fields.description || 'No description provided for this class.'
          };
        });
        setClasses(classList);
      } catch (error) { console.error("Contentful Error (Classes):", error); }
      finally { setLoading(false); }
    };

    fetchClasses();

    // Fetch periodically but ONLY when the tab is visible
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (!intervalId) {
        // Poll every 60 seconds
        intervalId = setInterval(fetchClasses, 60000);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    startPolling();

    // Re-fetch instantly when returning to tab, pause polling when hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchClasses();
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (!result.user.emailVerified || !email?.endsWith('@dlsu.edu.ph')) {
        await signOut(auth);
        alert('Access Denied: Please use your verified official @dlsu.edu.ph email address to sign in.');
        return;
      }
    } catch (error) { console.error("Sign In Error:", error); }
  };

  const handleSignOut = async () => {
    try { await signOut(auth); setIsMenuOpen(false); }
    catch (error) { console.error("Sign Out Error:", error); }
  };

  const renderClassCard = (item: LeapClass, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={styles.classCardWrapper}
    >
      <div className={styles.cardImageWrapper}>
        <img src={item.image} alt={item.title} className={styles.cardImage} referrerPolicy="no-referrer" />
        <div className={styles.cardImageGradient} />
        <div className={styles.cardSlotsLabel}>
          {item.slots} SLOTS
        </div>

        <div className={styles.cardOverlayContent}>
          <div className={styles.cardOverlayTopRow}>
            {item.orgLogo ? (
              <img src={item.orgLogo} alt={item.org} className={styles.cardOrgLogo} referrerPolicy="no-referrer" />
            ) : (
              <div className={styles.cardOrgLogoPlaceholder}>
                {item.org.charAt(0).toUpperCase()}
              </div>
            )}
            {item.subtheme && (
              <span className={`${styles.cardBadge} ${styles.cardBadgeTheme}`}>{item.subtheme}</span>
            )}
          </div>

          <p className={styles.cardOrganization}>{item.org}</p>
          <h3 className={styles.cardTitle} style={{ fontFamily: "'Playfair Display', serif" }}
            onClick={() => { setViewingClass(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            {item.title}
          </h3>

          <div className={styles.cardMetadataOverlay}>
            <div className={styles.metadataItem}><Calendar size={12} className={styles.metadataIcon} /><span>{item.date} · {item.time}</span></div>
            <div className={styles.metadataItem}><MapPin size={12} className={styles.metadataIcon} /><span>{item.venue} ({item.modality})</span></div>
          </div>

          <div className={styles.cardActionsOverlay}>
            <a href={item.googleFormUrl || "#"} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={styles.registerBtnOverlay}>
              Register <ExternalLink size={13} />
            </a>
            <button
              onClick={() => { setViewingClass(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={styles.learnMoreBtnOverlay}>
              Learn More <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const AdminDashboard = () => (
    <div className={styles.adminWrapper}>
      <div className={styles.adminHeader}>
        <button onClick={() => setIsAdminView(false)} className={styles.adminBackBtn}><ArrowLeft size={24} /></button>
        <h2 className={styles.adminTitle} style={{ fontFamily: "'Playfair Display', serif" }}>Admin Dashboard</h2>
      </div>
      <div className={styles.adminCard}>
        <div className={styles.adminIconWrap} style={{ width: 80, height: 80 }}><Edit size={36} /></div>
        <h3 className={styles.adminCardTitle} style={{ fontFamily: "'Playfair Display', serif" }}>Classes are managed in Contentful</h3>
        <p className={styles.adminCardDesc}>To add, edit, or delete classes, please use the Contentful CMS dashboard. The changes will automatically reflect here.</p>
        <a href="https://app.contentful.com" target="_blank" rel="noopener noreferrer" className={styles.adminCTABtn}>Open Contentful <ExternalLink size={20} /></a>
      </div>
    </div>
  );

  const Contact = () => (
    <div style={{ padding: '9rem 1.5rem 4rem', background: '#f5edcc', minHeight: '70vh' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.72)', borderRadius: 28, padding: '2rem', border: '1px solid rgba(222,154,73,0.22)', boxShadow: '0 16px 48px rgba(51,75,70,0.08)' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#de9a49', marginBottom: '0.75rem' }}>Support</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#334b46', marginBottom: '1rem' }}>Contact the LEAP team</h2>
          <p style={{ color: '#567069', fontSize: '1rem', lineHeight: 1.7, maxWidth: 680, marginBottom: '1.5rem' }}>
            Reach out for registration help, class concerns, or general questions about the program.
          </p>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '1.1rem 1.2rem', border: '1px solid rgba(222,154,73,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Mail size={18} color="#de9a49" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#334b46' }}>Email</h3>
              </div>
              <p style={{ margin: 0, color: '#567069' }}>leap@dlsu.edu.ph</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: '1.1rem 1.2rem', border: '1px solid rgba(222,154,73,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Clock size={18} color="#de9a49" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#334b46' }}>Response Time</h3>
              </div>
              <p style={{ margin: 0, color: '#567069' }}>Within 1-2 business days</p>
            </div>
          </div>
          <a href="mailto:leap@dlsu.edu.ph" className={styles.navRegisterBtn} style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Mail size={16} /> Send Email
          </a>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className="leap-spinner" />
          <p className={styles.loadingText}>Loading LEAP 2026…</p>
        </div>
      </div>
    );
  }

  if (isAdminView && userProfile?.role === 'admin') {
    return <ErrorBoundary><AdminDashboard /></ErrorBoundary>;
  }

  const navClass = scrolled
    ? 'scrolled-nav py-2'
    : currentView === 'home'
      ? 'bg-transparent py-4'
      : 'light-page-nav py-4';

  // ── HERO SECTION: logo + tagline, plus main carousel on home ──
  const HeroSection = (
    <header className={styles.heroSection}>
      <div className={styles.heroBackdropContainer}>
        <div className={styles.heroBackdropTop} />
        <div className={styles.heroBackdropRight} />
      </div>
      <NayonScene />
      <Fireflies />
      <div className={styles.heroContent}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 fade-up"
        >
          <img src={leapLogo} alt="LEAP 2026 — Isang Nayon, Isang Layunin" className={styles.heroLogo} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={`${styles.heroEyebrow} fade-up delay-1`} style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", textTransform: 'none', fontSize: 'clamp(1rem, 1.35vw, 1.3rem)', letterSpacing: '0.08em', padding: '0.55rem 1.5rem' }}>Isang Nayon, Isang Layunin</span>
        </motion.div>
        {hasAppAccess && currentView === 'home' && (
          <div style={{ width: 'min(1500px, 98vw)', marginTop: '0.45rem', marginLeft: '50%', transform: 'translateX(-50%)' }}>
            <MainEventsSection />
          </div>
        )}
      </div>
    </header>
  );

  const HeroExtras = hasAppAccess && currentView === 'home' ? (
    <div style={{ background: 'transparent', padding: '0' }}>
      <div style={{ width: 'min(1500px, 98vw)', marginTop: '0', marginLeft: '50%', transform: 'translateX(-50%)', position: 'relative' }}>
        <div className={styles.subthemesBackdropTop} />
        <div className={styles.subthemesBackdropRight} />
        <SubthemesStrip activeTheme={activeSubtheme} onSelect={(t) => { setActiveSubtheme(t); setCurrentPage(1); setSelectedDay(null); }} compact />
        {activeSubtheme && (
          <div style={{ textAlign: 'center', marginTop: '0.45rem' }}>
            <button
              onClick={() => { setActiveSubtheme(null); setCurrentPage(1); setSelectedDay(null); }}
              style={{
                background: 'rgba(222,154,73,0.15)',
                border: '1px solid rgba(222,154,73,0.4)',
                borderRadius: 999,
                padding: '0.28rem 0.9rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#803e2f',
                cursor: 'pointer',
              }}
            >
              Clear {activeSubtheme}
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  if (!hasAppAccess) {
    return (
      <div className={styles.appContainer}>
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-transparent py-4`}>
          <div className={styles.navInner}>
            <div className={styles.navLogo} onClick={() => window.scrollTo(0, 0)}>
              <img src={leapLogo} alt="LEAP 2026" className={styles.navLogoImg} style={{ mixBlendMode: 'screen' }} />
            </div>
            <div />
            <div className={styles.navRight} style={{ display: 'flex' }}>
              <button onClick={handleSignIn} className={styles.navRegisterBtn}>
                <LogIn size={13} /> Register / Sign In
              </button>
            </div>
          </div>
        </nav>
        {HeroSection}
        <CustomCursor />
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      {/* NAV */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}>
        <div className={styles.navInner}>
          <div className={styles.navLogo} onClick={() => navigateTo('home')}>
            <img src={leapLogo} alt="LEAP 2026" className={styles.navLogoImg} style={{ mixBlendMode: 'screen' }} />
          </div>
          <div className={styles.navCenter}>
            <button onClick={() => navigateTo('home')} className={`nav-link ${currentView === 'home' ? 'active' : ''}`}>Home</button>
            <button onClick={() => navigateTo('about')} className={`nav-link ${currentView === 'about' ? 'active' : ''}`}>Overview</button>
            <button onClick={() => navigateTo('major-events')} className={`nav-link ${currentView === 'major-events' ? 'active' : ''}`}>Featured</button>
            <button onClick={() => navigateTo('classes')} className={`nav-link ${currentView === 'classes' ? 'active' : ''}`}>Classes</button>
            <button onClick={() => navigateTo('faq')} className={`nav-link ${currentView === 'faq' ? 'active' : ''}`}>FAQs</button>
            {userProfile?.role === 'admin' && <button onClick={() => setIsAdminView(true)} className="leap-admin-link">Admin</button>}
          </div>
          {/* FIX: navRight uses the module class; on mobile the global CSS hides it
              and collapses the grid to [1fr auto], pushing the toggle to the far right */}
          <div className="leap-nav-right hidden md:flex">
            <button className="nav-icon-btn" onClick={() => navigateTo('classes')} title="Search classes">
              <Search size={15} />
            </button>
            <button className="nav-icon-btn" title="Saved classes"><Bookmark size={15} /></button>
            {user ? (
              <>
                <button className="nav-icon-btn" title={user.displayName || 'Profile'}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt="Profile" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    : <User size={15} />
                  }
                </button>
                <button onClick={handleSignOut} className="btn-leap-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.72rem', borderRadius: 6, gap: '0.4rem' }}>
                  <LogOut size={13} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="nav-icon-btn" title="Sign in" onClick={handleSignIn}><User size={15} /></button>
                <button onClick={handleSignIn} className="btn-leap-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.72rem', borderRadius: 6, gap: '0.4rem' }}>
                  <LogIn size={13} /> Register
                </button>
              </>
            )}
          </div>
          {/* FIX: mobile toggle is now the last grid child; with grid-template-columns: 1fr auto
              on mobile it naturally sits at the far right */}
          <div className={styles.navMobileToggle}>
            <button className={styles.navMobileBtn} style={{ color: currentView === 'home' && !scrolled ? '#f9ecb6' : '#334b46' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={styles.mobileMenu}>
            <div className={styles.mobileMenuContent}>
              <button onClick={() => { navigateTo('home'); setIsMenuOpen(false); }} className={styles.mobileMenuItem}>Home</button>
              <button onClick={() => { navigateTo('about'); setIsMenuOpen(false); }} className={styles.mobileMenuItem}>Overview</button>
              <button onClick={() => { navigateTo('major-events'); setIsMenuOpen(false); }} className={styles.mobileMenuItem}>Featured</button>
              <button onClick={() => { navigateTo('classes'); setIsMenuOpen(false); }} className={styles.mobileMenuItem}>Classes</button>
              <button onClick={() => { navigateTo('faq'); setIsMenuOpen(false); }} className={styles.mobileMenuItem}>FAQs</button>
              {userProfile?.role === 'admin' && <button onClick={() => { setIsAdminView(true); setIsMenuOpen(false); }} className={`${styles.mobileMenuItem} ${styles.adminLink}`}>Admin Dashboard</button>}
              {user ? (
                <button onClick={handleSignOut} className={styles.mobileMenuSignOutBtn}><LogOut size={22} /> Sign Out</button>
              ) : (
                <button onClick={handleSignIn} className={styles.mobileMenuSignInBtn}><LogIn size={22} /> Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUTE RENDERING */}
      {currentView === 'home' && (
        <Home
          user={user}
          classes={classes}
          searchQuery={searchQuery}
          onSearchChange={(query) => { setSearchQuery(query); setCurrentPage(1); }}
          sortBy={sortBy}
          onSortChange={(sort) => setSortBy(sort)}
          filteredAndSortedClasses={filteredAndSortedClasses}
          uniqueDays={uniqueDays}
          selectedDay={selectedDay}
          onDaySelect={(day) => { setSelectedDay(day); setCurrentPage(1); }}
          viewingClass={viewingClass}
          onClassSelect={(leapClass) => { setViewingClass(leapClass); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onSignIn={handleSignIn}
          onHeroScroll={() => navigateTo('classes')}
          HeroSection={HeroSection}
          HeroExtras={HeroExtras}
          renderClassCard={renderClassCard}
        />
      )}

      {currentView === 'about' && <About />}
      {currentView === 'major-events' && <MainEvents />}
      {currentView === 'classes' && (
        <Classes
          user={user}
          searchQuery={searchQuery}
          onSearchChange={(query) => { setSearchQuery(query); setCurrentPage(1); }}
          sortBy={sortBy}
          onSortChange={(sort) => setSortBy(sort)}
          filteredAndSortedClasses={filteredAndSortedClasses}
          uniqueDays={uniqueDays}
          selectedDay={selectedDay}
          onDaySelect={(day) => { setSelectedDay(day); setCurrentPage(1); }}
          currentPage={currentPage}
          onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          viewingClass={viewingClass}
          onClassSelect={(leapClass) => { setViewingClass(leapClass); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onSignIn={handleSignIn}
          renderClassCard={renderClassCard}
        />
      )}
      {currentView === 'faq' && <FAQs />}
      {currentView === 'contact' && <Contact />}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogoWrapper}>
              <img src={leapLogo} alt="LEAP 2026" className={styles.footerLogo} />
            </div>
            <p className={styles.footerBrandText}>Lasallian Enrichment Alternative Program. Empowering students through diverse learning experiences and community building.</p>
            <div className={styles.footerSocialIcons}>
              <div className={styles.footerSocialIcon}><Info size={16} /></div>
            </div>
          </div>
          <div>
            <h4 className={styles.footerColumnTitle}>Quick Links</h4>
            <ul className={styles.footerColumnLinks}>
              <li><button onClick={() => navigateTo('about')} className={styles.footerLink}>About LEAP</button></li>
              <li><button onClick={() => navigateTo('classes')} className={styles.footerLink}>Class List</button></li>
              <li><button onClick={() => navigateTo('major-events')} className={styles.footerLink}>Major Events</button></li>
              <li><button onClick={() => navigateTo('faq')} className={styles.footerLink}>FAQs</button></li>
            </ul>
          </div>
          <div>
            <h4 className={styles.footerColumnTitle}>Support</h4>
            <ul className={styles.footerColumnLinks}>
              <li><button onClick={() => navigateTo('contact')} className={styles.footerLink}>Contact OPS</button></li>
              <li><button onClick={() => navigateTo('contact')} className={styles.footerLink}>Technical Issues</button></li>
              <li><button onClick={() => navigateTo('contact')} className={styles.footerLink}>Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 LEAP Operations Team · De La Salle University · Central Student Organization</p>
        </div>
      </footer>

      <ScrollProgress />
      <CustomCursor />
    </div>
  );
};

export default function App() {
  return <ErrorBoundary><LeapApp /></ErrorBoundary>;
}