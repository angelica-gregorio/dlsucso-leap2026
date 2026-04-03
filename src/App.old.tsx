/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useRef, useMemo, type CSSProperties, type ErrorInfo, type ReactNode, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, MapPin, Users, ChevronRight, ChevronLeft,
  Menu, X, Info, LogOut, LogIn, AlertCircle,
  Edit, ArrowLeft, ExternalLink, Sparkles, Palette, Heart, Leaf, Star, Mail, Clock,
  Globe, Zap, Layers, Bookmark, User  // ← ADD THESE
} from 'lucide-react';

import { contentfulClient } from './contentful';
import {
  auth, db, googleProvider, signInWithPopup, signOut,
  onAuthStateChanged, doc, getDoc, setDoc
} from './firebase';
import type { User as FirebaseUser } from "firebase/auth";
import leapLogo from './assets/leap.webp';

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
        <div className="min-h-screen flex items-center justify-center bg-leap-cream p-6">
          <div className="leap-info-card p-8 rounded-3xl max-w-md text-center">
            <AlertCircle className="mx-auto text-leap-maroon mb-4" size={48} />
            <h2 className="text-2xl font-bold text-leap-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Something went wrong</h2>
            <p className="text-leap-olive mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="btn-leap-primary px-8 py-3 rounded-2xl font-bold shadow-lg">Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <div style={{ position:'fixed', top:0, left:0, right:0, height:3, zIndex:9999, pointerEvents:'none', background:'rgba(222,154,73,0.12)' }}>
      <div style={{ height:'100%', width:`${pct*100}%`, background:'linear-gradient(90deg,#de9a49,#fae185,#de9a49)', transition:'width 0.1s linear', boxShadow:'0 0 8px rgba(222,154,73,0.8)' }} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */
const CustomCursor = () => {
  const [dot,  setDot]  = useState({ x:-100, y:-100 });
  const [ring, setRing] = useState({ x:-100, y:-100 });
  const dotRef  = useRef({ x:-100, y:-100 });
  const ringRef = useRef({ x:-100, y:-100 });
  useEffect(() => {
    const mv = (e: MouseEvent) => { dotRef.current = { x:e.clientX, y:e.clientY }; setDot({ x:e.clientX, y:e.clientY }); };
    window.addEventListener('mousemove', mv);
    return () => window.removeEventListener('mousemove', mv);
  }, []);
  useEffect(() => {
    let id: number;
    const loop = () => {
      ringRef.current = { x: ringRef.current.x + (dotRef.current.x - ringRef.current.x)*0.12, y: ringRef.current.y + (dotRef.current.y - ringRef.current.y)*0.12 };
      setRing({ ...ringRef.current });
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <>
      <div style={{ position:'fixed', pointerEvents:'none', zIndex:99999, left:dot.x-5, top:dot.y-5, width:10, height:10, borderRadius:'50%', background:'#de9a49', mixBlendMode:'screen' }} />
      <div style={{ position:'fixed', pointerEvents:'none', zIndex:99998, left:ring.x-18, top:ring.y-18, width:36, height:36, borderRadius:'50%', border:'1.5px solid rgba(222,154,73,0.5)', mixBlendMode:'screen' }} />
    </>
  );
};

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
  <div style={{ position:'absolute', inset:0, zIndex:3, pointerEvents:'none', overflow:'hidden' }}>
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

/* ══════════════════════════════════════════════════════
   ANIMATED COUNTER + HERO STATS STRIP
══════════════════════════════════════════════════════ */
const AnimatedCounter = ({ end, label, suffix='' }: { end:number; label:string; suffix?:string }) => {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let v=0; const step=end/60;
        const t = setInterval(() => { v+=step; if (v>=end){ setN(end); clearInterval(t); } else setN(Math.floor(v)); }, 16);
      }
    }, { threshold:0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <div ref={ref} style={{ textAlign:'center', padding:'0 24px' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,2.8vw,2.4rem)', fontWeight:800, color:'#fae185', lineHeight:1 }}>{n}{suffix}</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(222,154,73,0.7)', marginTop:5 }}>{label}</div>
    </div>
  );
};
const HeroStats = () => (
  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55, duration:0.6 }}
    style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'18px 0', borderTop:'1px solid rgba(222,154,73,0.18)', borderBottom:'1px solid rgba(222,154,73,0.18)', background:'rgba(0,0,0,0.14)', borderRadius:10, maxWidth:560, margin:'2.5rem auto 0' }}>
    <AnimatedCounter end={200} suffix="+" label="Classes" />
    <div style={{ width:1, height:36, background:'rgba(222,154,73,0.22)' }} />
    <AnimatedCounter end={7} label="Days" />
    <div style={{ width:1, height:36, background:'rgba(222,154,73,0.22)' }} />
    <AnimatedCounter end={5000} suffix="+" label="Students" />
    <div style={{ width:1, height:36, background:'rgba(222,154,73,0.22)' }} />
    <AnimatedCounter end={50} suffix="+" label="Orgs" />
  </motion.div>
);

/* ══════════════════════════════════════════════════════
   NAYON SCENE
══════════════════════════════════════════════════════ */
const TOOLTIPS: Record<string, { label:string; desc:string }> = {
  hut1:     { label:'Bahay Kubo',  desc:'Traditional Filipino stilt house'  },
  hut2:     { label:'Bahay Kubo',  desc:'Heart of the Filipino nayon'       },
  palay:    { label:'Palay',       desc:'The golden harvest — rice paddies' },
  salakot:  { label:'Salakot',     desc:"Farmer's iconic woven hat"         },
  bayong:   { label:'Bayong',      desc:'Handwoven Filipino basket bag'     },
  pandesal: { label:'Pandesal',    desc:'The beloved Filipino bread roll'   },
};

const NayonScene = () => {
  useParallaxMouse();
  const [hovered, setHovered] = useState<string|null>(null);

  return (
    <>
      <AnimatePresence>
        {hovered && (
          <motion.div key={hovered}
            initial={{ opacity:0, y:8, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4, scale:0.96 }}
            transition={{ duration:0.18, ease:[0.34,1.4,0.64,1] }}
            style={{ position:'fixed', bottom:'auto', top:'80px', left:'50%', transform:'translateX(-50%)', background:'rgba(8,5,2,0.94)', border:'1px solid rgba(222,154,73,0.52)', borderRadius:8, padding:'8px 18px', pointerEvents:'none', zIndex:20, backdropFilter:'blur(14px)', boxShadow:'0 8px 32px rgba(0,0,0,0.55)', whiteSpace:'nowrap' }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:'#fae185', margin:0, fontWeight:700 }}>{TOOLTIPS[hovered]?.label}</p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(249,236,182,0.52)', margin:0, marginTop:2 }}>{TOOLTIPS[hovered]?.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        viewBox="0 0 1440 480"
        preserveAspectRatio="xMidYMax meet"
        style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'auto', zIndex:2, pointerEvents:'none' }}
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
   PAGE WRAPPER
══════════════════════════════════════════════════════ */
const PageWrapper = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex-grow"
  >
    {children}
  </motion.div>
);

/* ══════════════════════════════════════════════════════
   PAGE HERO BANNER
══════════════════════════════════════════════════════ */
const PageHero = ({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) => (
  <div className="page-hero" style={{ paddingTop: '10rem', paddingBottom: '4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div className="page-hero-glow" />
    <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
      style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'#de9a49', marginBottom:'1rem' }}>
      {accent}
    </motion.p>
    <motion.h1 initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
      className="page-hero-title">
      {title}
    </motion.h1>
    <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.26 }}
      className="page-hero-subtitle">
      {subtitle}
    </motion.p>
    <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.4, duration:0.6 }}
      style={{ width:60, height:2, background:'linear-gradient(90deg,transparent,#de9a49,transparent)', margin:'2rem auto 0' }}/>
  </div>
);

/* ══════════════════════════════════════════════════════
   SUBTHEMES DATA
══════════════════════════════════════════════════════ */
const SUBTHEMES = [
  { icon: <Star size={20}/>, label: 'Palayan ng Karunungan' },
  { icon: <Palette size={20}/>, label: 'Pamilihan ng Kakayahan' },
  { icon: <Leaf size={20}/>, label: 'Plaza ng Malikhaing Diwa' },
  { icon: <Globe size={20}/>, label: 'Dambana ng Pagkakaisa' },
  { icon: <Zap size={20}/>, label: 'Palaisdaan ng Kalusugan' },
  { icon: <Layers size={20}/>, label: 'Bahay ng Bayanihan' },
];

/* ══════════════════════════════════════════════════════
   MAIN EVENTS SECTION
══════════════════════════════════════════════════════ */
const MainEventsSection = () => {
  const events = [
    {
      tag: 'Opening Ceremony',
      date: 'June 20, 2026', time: '8:00 AM', venue: 'Henry Sy Sr. Hall',
      title: 'LEAP 2026 Kickoff Rally',
      desc: 'Live performances, special guests, and the ceremonial launch of a week that will change how you see learning.',
      img: 'https://picsum.photos/seed/kickoff2026/600/400', accent: '#de9a49',
    },
    {
      tag: 'Midweek Special',
      date: 'June 23, 2026', time: '3:00 PM', venue: 'Agno Food Court Plaza',
      title: 'Nayon Night Market',
      desc: 'An open-air celebration of Filipino creativity — food, crafts, live music, and student showcases filling the campus.',
      img: 'https://picsum.photos/seed/nightmarket/600/400', accent: '#4ab09a',
    },
    {
      tag: 'Closing Night',
      date: 'June 26, 2026', time: '6:00 PM', venue: 'Teresa Yuchengco Auditorium',
      title: 'Culminating Night',
      desc: 'Student output showcases, awards night, and a closing concert that sends LEAP 2026 off with a bang.',
      img: 'https://picsum.photos/seed/culminating2026/600/400', accent: '#b05a32',
    },
  ];

  return (
    <section className="main-events-section">
      <div className="main-events-inner">
        <div className="main-events-header">
          <div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.58rem', fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:'#de9a49', display:'block', marginBottom:'0.4rem' }}>
              LEAP 2026 · Landmark Moments
            </span>
            <h2 className="main-events-title">Main Events</h2>
          </div>
          <div className="main-events-nav">
            <button className="carousel-nav-btn" aria-label="Previous slide"><ChevronLeft size={15}/></button>
            <button className="carousel-nav-btn" aria-label="Next slide"><ChevronRight size={15}/></button>
          </div>
        </div>
        <div className="main-events-grid">
          {events.map((ev, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }} className="main-event-card">
              <div className="main-event-img-wrap">
                <img src={ev.img} alt={ev.title} className="main-event-img" referrerPolicy="no-referrer"/>
                <div className="main-event-img-overlay"/>
                <span className="main-event-tag">{ev.tag}</span>
              </div>
              <div className="main-event-body">
                <div className="main-event-meta">
                  <span className="main-event-meta-item"><Calendar size={11}/>{ev.date}</span>
                  <span className="main-event-meta-item"><Clock size={11}/>{ev.time}</span>
                  <span className="main-event-meta-item"><MapPin size={11}/>{ev.venue}</span>
                </div>
                <h3 className="main-event-title">{ev.title}</h3>
                <p className="main-event-desc">{ev.desc}</p>
                <div className="main-event-cta">
                  <div style={{ height:2, width:28, background:ev.accent, borderRadius:2 }}/>
                  <span className="main-event-link">View Details <ExternalLink size={11}/></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════
   SUBTHEMES STRIP
══════════════════════════════════════════════════════ */
const SubthemesStrip = ({ activeTheme, onSelect }: { activeTheme: string|null; onSelect: (t: string|null) => void }) => (
  <div className="subthemes-section">
    <div className="subthemes-inner">
      <span className="subthemes-label">Subthemes</span>
      <div className="subthemes-row">
        <button
          className={`subtheme-pill ${activeTheme === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="subtheme-pill-icon"><Sparkles size={20}/></span>
          <span className="subtheme-pill-label">All</span>
        </button>
        {SUBTHEMES.map((s, i) => (
          <button
            key={i}
            className={`subtheme-pill ${activeTheme === s.label ? 'active' : ''}`}
            onClick={() => onSelect(activeTheme === s.label ? null : s.label)}
          >
            <span className="subtheme-pill-icon">{s.icon}</span>
            <span className="subtheme-pill-label">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════════════ */
const AboutPage = () => {
  const values = [
    { icon: Sparkles, title: 'Innovation', desc: 'Breaking boundaries of traditional learning with creative and unconventional approaches.' },
    { icon: Users, title: 'Community', desc: 'Fostering meaningful connections between students, orgs, and the greater DLSU family.' },
    { icon: Leaf, title: 'Growth', desc: 'Cultivating personal and professional development beyond the classroom walls.' },
    { icon: Heart, title: 'Service', desc: 'Grounded in the Lasallian tradition of faith, service, and communion in mission.' },
  ];
  return (
    <PageWrapper>
      <PageHero title="About LEAP 2026" subtitle="Isang Nayon, Isang Layunin — One Village, One Purpose" accent="DLSU · Central Student Organization"/>
      <main className="container mx-auto px-4 pb-24 max-w-5xl">
        <div className="about-intro-grid">
          <motion.div initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
            <h2 className="section-label">What is LEAP?</h2>
            <p className="about-body">The <strong>Lasallian Enrichment Alternative Program</strong> is De La Salle University's annual week-long celebration of alternative learning — a space where students step outside the lecture hall and into something wilder, warmer, and more human.</p>
            <p className="about-body" style={{ marginTop:'1rem' }}>For one week every year, the campus transforms into a nayon — a village buzzing with workshops, performances, talks, and hands-on experiences spanning every field imaginable.</p>
          </motion.div>
          <motion.div initial={{ opacity:0, x:24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.1 }}
            className="about-stat-panel">
            <div className="about-stat"><span className="about-stat-num">200+</span><span className="about-stat-lbl">Classes offered</span></div>
            <div className="about-stat-div"/>
            <div className="about-stat"><span className="about-stat-num">7</span><span className="about-stat-lbl">Days of learning</span></div>
            <div className="about-stat-div"/>
            <div className="about-stat"><span className="about-stat-num">5,000+</span><span className="about-stat-lbl">Students engaged</span></div>
            <div className="about-stat-div"/>
            <div className="about-stat"><span className="about-stat-num">50+</span><span className="about-stat-lbl">Organizations</span></div>
          </motion.div>
        </div>
        <div className="vm-grid">
          {[
            { label:'Our Vision', icon:'🌾', text:'A DLSU community where every student discovers their full potential through immersive, joyful, and transformative learning experiences rooted in Lasallian values.' },
            { label:'Our Mission', icon:'🏡', text:'To curate an inclusive week of alternative education — accessible, engaging, and deeply human — that complements academic rigor with lived experience and creative exploration.' },
          ].map((item,i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.12 }} className="vm-card">
              <span className="vm-icon">{item.icon}</span>
              <h3 className="vm-label">{item.label}</h3>
              <p className="vm-text">{item.text}</p>
            </motion.div>
          ))}
        </div>
        <div className="values-section">
          <h2 className="section-heading">Core Values</h2>
          <div className="values-grid">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }} className="value-card">
                <div className="value-icon-wrap"><v.icon size={22}/></div>
                <h4 className="value-title">{v.title}</h4>
                <p className="value-desc">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="theme-banner">
          <div className="theme-banner-inner">
            <p className="theme-banner-eyebrow">2026 Theme</p>
            <h2 className="theme-banner-title">Isang Nayon, Isang Layunin</h2>
            <p className="theme-banner-body">One Village, One Purpose. This year's theme draws from the Filipino bayanihan spirit — the collective strength of a community that moves, builds, and grows together. Like a nayon gathered around the harvest, LEAP 2026 calls every Lasallian to find their place in the circle.</p>
          </div>
        </motion.div>
      </main>
    </PageWrapper>
  );
};

/* ══════════════════════════════════════════════════════
   MAJOR EVENTS PAGE
══════════════════════════════════════════════════════ */
const MajorEventsPage = () => {
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
      <PageHero title="Major Events" subtitle="Landmark moments that define the LEAP experience" accent="LEAP 2026 · Schedule"/>
      <main className="container mx-auto px-4 pb-24 max-w-5xl">
        <div className="events-list">
          {events.map((ev, i) => (
            <motion.div key={i} initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.12, duration:0.55 }} className="event-card">
              <div className="event-img-wrap">
                <img src={ev.img} alt={ev.title} className="event-img" referrerPolicy="no-referrer"/>
                <div className="event-img-overlay"/>
                <span className="event-tag" style={{ background: ev.accent }}>{ev.tag}</span>
              </div>
              <div className="event-body">
                <div className="event-meta">
                  <span className="event-meta-item"><Calendar size={13}/>{ev.date}</span>
                  <span className="event-meta-item"><Clock size={13}/>{ev.time}</span>
                  <span className="event-meta-item"><MapPin size={13}/>{ev.venue}</span>
                </div>
                <h3 className="event-title">{ev.title}</h3>
                <p className="event-desc">{ev.desc}</p>
                <div className="event-cta">
                  <div className="event-num">{String(i+1).padStart(2,'0')}</div>
                  <div className="event-divider-line" style={{ background: ev.accent }}/>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </PageWrapper>
  );
};

/* ══════════════════════════════════════════════════════
   FAQ PAGE
══════════════════════════════════════════════════════ */
const FAQPage = () => {
  const [open, setOpen] = useState<number|null>(null);
  const faqs = [
    { q: "Who can participate in LEAP classes?", a: "All currently enrolled undergraduate students of De La Salle University are eligible and encouraged to participate in LEAP classes. Some specialized workshops may have additional requirements listed on their registration forms." },
    { q: "How many classes can I register for?", a: "Students can register for a maximum of 3 classes to ensure everyone gets a chance to participate. Please choose your classes carefully to avoid schedule conflicts — slots are given on a first-come, first-served basis." },
    { q: "Are LEAP classes graded?", a: "No, LEAP classes are completely non-credit and non-graded. They are designed purely for personal enrichment, skill development, and the joy of learning something new." },
    { q: "What happens if I miss a class I registered for?", a: "While there are no academic penalties, we highly encourage attendance as slots are limited. Repeated absences may affect your priority registration for future LEAP events and deprive another student of the opportunity." },
    { q: "Can I change my registered classes?", a: "Yes, you can drop a class and register for a different one up until the registration deadline, provided there are still available slots in the new class." },
    { q: "Are there classes suitable for all skill levels?", a: "Absolutely! LEAP classes are designed for everyone — beginners to advanced. Each class description includes the target skill level so you can find the perfect fit for where you are right now." },
    { q: "Where do I get help if I have registration issues?", a: "Reach out to the LEAP Operations Team at leap@dlsu.edu.ph or visit us at the SPS Building, Room 302. We're available Monday–Friday, 9AM–5PM throughout the registration period." },
  ];
  return (
    <PageWrapper>
      <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know before you register" accent="LEAP 2026 · Help Center"/>
      <main className="container mx-auto px-4 pb-24 max-w-3xl">
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.05 }}
              className={`faq-item ${open===i?'faq-open':''}`}>
              <button className="faq-question" onClick={() => setOpen(open===i?null:i)}>
                <span>{faq.q}</span>
                <div className={`faq-chevron ${open===i?'faq-chevron-open':''}`}>
                  <ChevronRight size={18}/>
                </div>
              </button>
              <AnimatePresence>
                {open===i && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.28, ease:[0.22,1,0.36,1] }} style={{ overflow:'hidden' }}>
                    <p className="faq-answer">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="faq-cta-card">
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'#334b46', marginBottom:'0.5rem' }}>Still have questions?</p>
          <p style={{ color:'rgba(51,75,70,0.7)', marginBottom:'1.5rem' }}>Our team is always happy to help. Drop us a message.</p>
          <a href="mailto:leap@dlsu.edu.ph" className="btn-leap-primary" style={{ display:'inline-flex', textDecoration:'none' }}>
            <Mail size={16}/> Contact the Team
          </a>
        </motion.div>
      </main>
    </PageWrapper>
  );
};

/* ══════════════════════════════════════════════════════
   CONTACT PAGE
══════════════════════════════════════════════════════ */
const ContactPage = () => (
  <PageWrapper>
    <PageHero title="Contact Us" subtitle="We're here to help you make the most of LEAP 2026" accent="LEAP 2026 · Get in Touch"/>
    <main className="container mx-auto px-4 pb-24 max-w-4xl">
      <div className="contact-grid">
        <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="contact-info">
          {[
            { icon: MapPin, label:'Visit Us', val:'SPS Building, Room 302\nDe La Salle University, Manila' },
            { icon: Mail, label:'Email Us', val:'leap@dlsu.edu.ph' },
            { icon: Clock, label:'Office Hours', val:'Monday – Friday\n9:00 AM – 5:00 PM' },
            { icon: Users, label:'LEAP Operations Team', val:'Central Student Organization\nDe La Salle University' },
          ].map((item,i) => (
            <motion.div key={i} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }} className="contact-item">
              <div className="contact-icon-wrap"><item.icon size={20}/></div>
              <div>
                <p className="contact-item-label">{item.label}</p>
                <p className="contact-item-val">{item.val}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="contact-card">
          <h3 className="contact-card-title">Send a Message</h3>
          <p className="contact-card-sub">For general inquiries, partnership opportunities, or technical issues during registration.</p>
          <div className="contact-field">
            <label className="contact-label">Your Name</label>
            <input className="contact-input" placeholder="Juan dela Cruz" type="text"/>
          </div>
          <div className="contact-field">
            <label className="contact-label">DLSU Email</label>
            <input className="contact-input" placeholder="juandelacruz@dlsu.edu.ph" type="email"/>
          </div>
          <div className="contact-field">
            <label className="contact-label">Message</label>
            <textarea className="contact-input contact-textarea" placeholder="How can we help you?"/>
          </div>
          <button className="btn-leap-primary" style={{ width:'100%', justifyContent:'center' }}>
            <Mail size={16}/> Send Message
          </button>
        </motion.div>
      </div>
    </main>
  </PageWrapper>
);

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
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

function LeapApp() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title-asc');
  const [scrolled, setScrolled] = useState(false);
  const [classes, setClasses] = useState<LeapClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingClass, setViewingClass] = useState<{
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
  } | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [activeSubtheme, setActiveSubtheme] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const ITEMS_PER_PAGE = 6;

  /* ── SCROLL PARALLAX — mountain zooms as you scroll ── */
  useEffect(() => {
    const hero = document.querySelector('.hero-bg') as HTMLElement | null;
    if (!hero) return;
    const onScroll = () => {
      const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
      hero.style.setProperty('--nayon-scale', String(1 + progress * 0.28));
      hero.style.setProperty('--nayon-ty',    `${progress * 24}px`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredAndSortedClasses: LeapClass[] = useMemo(() => {
    let result: LeapClass[] = classes.filter((c: LeapClass) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtheme.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (!currentUser.email?.endsWith('@dlsu.edu.ph')) { await signOut(auth); alert("Please use your @dlsu.edu.ph Google account to sign in."); return; }
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) { setUserProfile(userDoc.data() as UserProfile); }
        else {
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
      } else { setUserProfile(null); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchClasses = async () => {
      if (!contentfulClient) { setLoading(false); return; }
      try {
        const response = await contentfulClient.getEntries({ content_type: 'leapClass2026' });
        const classList: LeapClass[] = response.items.map((item: { sys: { id: string }; fields: { title?: string; organizationInCharge?: string; classModality?: string; dateAndTime?: string; venue?: string; numberOfSlots?: number; subtheme?: string; posterPublishingMaterial?: { fields: { file?: { url: string } } }; organizationInChargeLogo?: { fields: { file?: { url: string } } }; registrationLink?: string; description?: string } }) => {
          let formattedDate = '', formattedTime = '';
          if (item.fields.dateAndTime) {
            const dateObj = new Date(item.fields.dateAndTime);
            formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      if (email && !email.endsWith('@dlsu.edu.ph')) { await signOut(auth); alert("Access Denied: Please use your official @dlsu.edu.ph email address to sign in."); return; }
    } catch (error) { console.error("Sign In Error:", error); }
  };

  const handleSignOut = async () => {
    try { await signOut(auth); setIsMenuOpen(false); }
    catch (error) { console.error("Sign Out Error:", error); }
  };

  const renderClassCard = (item: {
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
  }, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="leap-class-card flex flex-col cursor-pointer"
    >
      <div className="card-header-bar">
        {item.orgLogo ? (
          <img src={item.orgLogo} alt={item.org} className="card-org-logo" referrerPolicy="no-referrer"/>
        ) : (
          <div className="card-org-logo-placeholder">
            {item.org.charAt(0).toUpperCase()}
          </div>
        )}
        {item.subtheme && (
          <span className="card-badge card-badge-theme">{item.subtheme}</span>
        )}
        {item.date && (
          <span className="card-badge card-badge-day">
            {item.date.split(' ').slice(0,2).join(' ')}
          </span>
        )}
      </div>

      <div className="relative overflow-hidden" style={{ height: '180px' }}>
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute bottom-3 right-3" style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', borderRadius:4, padding:'2px 8px', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.12em', color:'#fae185', fontFamily:"'DM Sans',sans-serif" }}>
          {item.slots} SLOTS
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'0.65rem', fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#de9a49', marginBottom:'0.35rem' }}>
          {item.org}
        </p>
        <h3 className="text-lg font-bold text-leap-dark leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}
          onClick={() => { setViewingClass(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          {item.title}
        </h3>
        <div className="space-y-1.5 mb-4 text-sm text-leap-dark/60" style={{ fontSize:'0.78rem' }}>
          <div className="flex items-center gap-2"><Calendar size={12} className="text-leap-gold flex-shrink-0" /><span>{item.date} · {item.time}</span></div>
          <div className="flex items-center gap-2"><MapPin size={12} className="text-leap-gold flex-shrink-0" /><span>{item.venue} ({item.modality})</span></div>
        </div>
        <div className="mt-auto flex flex-col gap-1.5">
          <a href={item.googleFormUrl || "#"} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="leap-register-btn">
            Register via Google Forms <ExternalLink size={14} />
          </a>
          <button
            onClick={() => { setViewingClass(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="learn-more-link">
            Learn More <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const AdminDashboard = () => (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setIsAdminView(false)} className="p-2 hover:bg-leap-tan/30 rounded-full transition-colors"><ArrowLeft size={24} /></button>
        <h2 className="text-3xl font-bold text-leap-dark" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Dashboard</h2>
      </div>
      <div className="glass-card p-12 rounded-3xl text-center max-w-2xl mx-auto">
        <div className="leap-detail-icon-wrap w-20 h-20 mx-auto mb-6" style={{ width: 80, height: 80 }}><Edit size={36} /></div>
        <h3 className="text-2xl font-bold text-leap-dark mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Classes are managed in Contentful</h3>
        <p className="text-leap-olive mb-8 text-lg">To add, edit, or delete classes, please use the Contentful CMS dashboard. The changes will automatically reflect here.</p>
        <a href="https://app.contentful.com" target="_blank" rel="noopener noreferrer" className="btn-leap-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold">Open Contentful <ExternalLink size={20} /></a>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-leap-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="leap-spinner" />
          <p className="text-leap-olive text-sm font-medium tracking-wide uppercase">Loading LEAP 2026…</p>
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

  return (
    <div className="min-h-screen flex flex-col">

      {/* NAV */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}>
        <div className="leap-nav-inner">
          <div className="leap-nav-logo cursor-pointer" onClick={() => { setCurrentView('home'); window.scrollTo(0, 0); }}>
            <img src={leapLogo} alt="LEAP 2026" className="nav-logo-img" style={{ mixBlendMode: 'screen' }} />
          </div>
          <div className="leap-nav-center hidden md:flex">
            <button onClick={() => { setCurrentView('home'); window.scrollTo(0, 0); }} className={`nav-link ${currentView === 'home' ? 'active' : ''}`}>Home</button>
            <button onClick={() => { setCurrentView('about'); window.scrollTo(0, 0); }} className={`nav-link ${currentView === 'about' ? 'active' : ''}`}>Overview</button>
            <button onClick={() => { setCurrentView('major-events'); window.scrollTo(0, 0); }} className={`nav-link ${currentView === 'major-events' ? 'active' : ''}`}>Featured</button>
            <button onClick={() => { setCurrentView('home'); window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0); }} className="nav-link">Classes</button>
            <button onClick={() => { setCurrentView('faq'); window.scrollTo(0, 0); }} className={`nav-link ${currentView === 'faq' ? 'active' : ''}`}>FAQs</button>
            {userProfile?.role === 'admin' && <button onClick={() => setIsAdminView(true)} className="leap-admin-link">Admin</button>}
          </div>
          <div className="leap-nav-right hidden md:flex">
            <button className="nav-icon-btn" onClick={() => { setCurrentView('home'); setTimeout(() => { document.getElementById('classes-section')?.scrollIntoView({ behavior:'smooth' }); }, 100); }} title="Search classes">
              <Search size={15}/>
            </button>
            <button className="nav-icon-btn" title="Saved classes"><Bookmark size={15}/></button>
            {user ? (
              <>
                <button className="nav-icon-btn" title={user.displayName || 'Profile'}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt="Profile" style={{ width:20, height:20, borderRadius:'50%', objectFit:'cover' }} referrerPolicy="no-referrer"/>
                    : <User size={15}/>
                  }
                </button>
                <button onClick={handleSignOut} className="btn-leap-primary" style={{ padding:'0.45rem 1rem', fontSize:'0.72rem', borderRadius:6, gap:'0.4rem' }}>
                  <LogOut size={13}/> Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="nav-icon-btn" title="Sign in" onClick={handleSignIn}><User size={15}/></button>
                <button onClick={handleSignIn} className="btn-leap-primary" style={{ padding:'0.45rem 1rem', fontSize:'0.72rem', borderRadius:6, gap:'0.4rem' }}>
                  <LogIn size={13}/> Register
                </button>
              </>
            )}
          </div>
          <div className="flex md:hidden" style={{ justifySelf:'end' }}>
            <button className="p-2" style={{ color: currentView === 'home' && !scrolled ? '#f9ecb6' : '#334b46' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-40 leap-mobile-menu pt-24 px-6 md:hidden">
            <div className="flex flex-col gap-6 text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#f9ecb6' }}>
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">Home</button>
              <button onClick={() => { setCurrentView('about'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">Overview</button>
              <button onClick={() => { setCurrentView('major-events'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">Featured</button>
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.setTimeout(() => window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0), 100); }} className="text-left hover:text-leap-yellow transition-colors">Classes</button>
              <button onClick={() => { setCurrentView('faq'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">FAQs</button>
              {userProfile?.role === 'admin' && <button onClick={() => { setIsAdminView(true); setIsMenuOpen(false); }} className="text-left leap-admin-link text-2xl">Admin Dashboard</button>}
              {user ? (
                <button onClick={handleSignOut} className="btn-leap-primary py-4 rounded-2xl shadow-xl mt-4 flex items-center justify-center gap-2 text-lg"><LogOut size={22} /> Sign Out</button>
              ) : (
                <button onClick={handleSignIn} className="btn-leap-primary py-4 rounded-2xl shadow-xl mt-4 flex items-center justify-center gap-2 text-lg"><LogIn size={22} /> Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentView === 'home' && (
        <main className="flex-grow">
          {/* HERO */}
          <header className="relative overflow-hidden hero-bg" style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: 'clamp(140px, 34vw, 490px)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(222,154,73,0.08)', animationDuration: '4s' }} />
              <div className="absolute top-24 right-12 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(74,176,154,0.06)', animationDuration: '5.5s', animationDelay: '1s' }} />
            </div>
            <Fireflies />
            <div className="container mx-auto text-center max-w-4xl relative" style={{ zIndex: 2 }}>
              <motion.div initial={{ opacity: 0, scale: 0.88, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mb-6 fade-up">
                <img src={leapLogo} alt="LEAP 2026 — Isang Nayon, Isang Layunin" className="leap-logo-hero" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                <span className="leap-eyebrow mb-6 inline-block fade-up delay-1">Isang Nayon, Isang Layunin</span>
                <p className="fade-up delay-2" style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: 'clamp(1rem,2.2vw,1.2rem)', color: 'rgba(224,210,175,0.72)', maxWidth: '540px', margin: '0.75rem auto 2.5rem', lineHeight: 1.8 }}>
                  Discover over 200 unique classes and events. Join your community in a week of alternative learning and growth.
                </p>
                {!user ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center fade-up delay-3">
                    <button onClick={handleSignIn} className="btn-leap-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2">
                      Sign In with DLSU Account <ChevronRight size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center fade-up delay-3">
                    <a href="#classes-section" className="btn-leap-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2">Register Now <ChevronRight size={20} /></a>
                    <button onClick={() => window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0)} className="btn-leap-secondary px-10 py-4 rounded-2xl font-bold text-lg">View Schedule</button>
                  </div>
                )}
                <HeroStats />
              </motion.div>
            </div>
            <NayonScene />
          </header>

          {/* SEARCH BAR */}
          <section id="classes" className="search-section sticky top-16 z-30 py-4 px-4">
            <div className="container mx-auto max-w-5xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-leap-olive" size={18} />
                  <input type="text" placeholder="Search events, workshops, or themes…" className="leap-search w-full pl-12 pr-4 py-3.5" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort events" className="leap-select px-5 py-3.5 appearance-none">
                  <option value="title-asc">Sort: Title (A–Z)</option>
                  <option value="title-desc">Sort: Title (Z–A)</option>
                  <option value="slots-desc">Sort: Most Slots</option>
                  <option value="slots-asc">Sort: Fewest Slots</option>
                </select>
              </div>
            </div>
          </section>

          <MainEventsSection />

          <SubthemesStrip activeTheme={activeSubtheme} onSelect={(t) => { setActiveSubtheme(t); setCurrentPage(1); setSelectedDay(null); }} />

          {/* CLASSES SECTION */}
          <section id="classes-section">
            {!user ? (
              <div className="container mx-auto px-4 py-16">
                <div className="leap-info-card p-12 rounded-3xl text-center max-w-xl mx-auto">
                  <div className="leap-detail-icon-wrap w-16 h-16 mx-auto mb-6" style={{ width: 64, height: 64 }}><Info size={32} /></div>
                  <h3 className="text-2xl font-bold text-leap-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to see classes</h3>
                  <p className="text-leap-olive mb-8 text-lg">You must be signed in with your DLSU account to view and register for LEAP classes.</p>
                  <button onClick={handleSignIn} className="btn-leap-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl">Sign In Now</button>
                </div>
              </div>
            ) : viewingClass ? (
              <div className="container mx-auto px-4 py-12 max-w-4xl">
                <button onClick={() => { setViewingClass(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="leap-see-more mb-8"><ArrowLeft size={16} /> Back to Classes</button>
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="h-80 w-full relative">
                    <img src={viewingClass.image} alt={viewingClass.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-6 left-6 flex gap-2 items-center">
                      {viewingClass.orgLogo ? (
                        <img src={viewingClass.orgLogo} alt={viewingClass.org} style={{ width:32,height:32,borderRadius:6,objectFit:'cover',border:'2px solid rgba(222,154,73,0.5)' }} referrerPolicy="no-referrer"/>
                      ) : null}
                      <span className="leap-detail-badge">{viewingClass.subtheme}</span>
                    </div>
                  </div>
                  <div className="p-10">
                    <h1 className="text-4xl font-bold text-leap-dark mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{viewingClass.title}</h1>
                    <p className="text-base text-leap-rust font-semibold uppercase tracking-wide mb-8">Organized by {viewingClass.org}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-leap-dark">
                          <div className="leap-detail-icon-wrap"><Calendar size={20} /></div>
                          <div><p className="text-xs text-leap-olive font-bold uppercase tracking-widest mb-0.5">Date & Time</p><p className="font-semibold">{viewingClass.date} · {viewingClass.time}</p></div>
                        </div>
                        <div className="flex items-center gap-3 text-leap-dark">
                          <div className="leap-detail-icon-wrap"><MapPin size={20} /></div>
                          <div><p className="text-xs text-leap-olive font-bold uppercase tracking-widest mb-0.5">Location</p><p className="font-semibold">{viewingClass.venue} ({viewingClass.modality})</p></div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-leap-dark">
                          <div className="leap-detail-icon-wrap"><Users size={20} /></div>
                          <div><p className="text-xs text-leap-olive font-bold uppercase tracking-widest mb-0.5">Available Slots</p><p className="font-semibold">{viewingClass.slots} slots</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-10">
                      <h3 className="text-2xl font-bold text-leap-dark mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>About this class</h3>
                      <p className="text-leap-dark/80 leading-relaxed text-lg">{viewingClass.description || "No description provided for this class."}</p>
                    </div>
                    <a href={viewingClass.googleFormUrl || "#"} target="_blank" rel="noopener noreferrer" className="btn-leap-primary w-full md:w-auto inline-flex px-10 py-5 rounded-2xl font-bold text-lg items-center justify-center gap-3">Register via Google Forms <ExternalLink size={22} /></a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="leap-days-layout" style={{ minHeight: '60vh' }}>
                <aside className="leap-days-sidebar">
                  <div className="leap-days-sidebar-title">LEAP<br/>Days</div>
                  {uniqueDays.length === 0 ? (
                    <p style={{ padding:'1rem 1.5rem', fontFamily:"'DM Sans',sans-serif", fontSize:'0.82rem', color:'rgba(124,107,75,0.6)' }}>No days found.</p>
                  ) : (
                    uniqueDays.map((date: string, dayIndex: number) => {
                      const count = filteredAndSortedClasses.filter((c: LeapClass) => c.date === date).length;
                      return (
                        <button
                          key={date}
                          className={`day-sidebar-item w-full text-left ${selectedDay === date ? 'active' : ''}`}
                          onClick={() => { setSelectedDay(date === selectedDay ? null : date); setCurrentPage(1); }}
                        >
                          <span className="day-sidebar-num">Day {String(dayIndex + 1).padStart(2,'0')}</span>
                          <span className="day-sidebar-name">{date.split(',')[0]}</span>
                          <span className="day-sidebar-count">{count}</span>
                        </button>
                      );
                    })
                  )}
                </aside>
                <main className="leap-classes-main">
                  {selectedDay === null ? (
                    <div>
                      {uniqueDays.map((date: string, dayIndex: number) => {
                        const dayClasses = filteredAndSortedClasses.filter((c: LeapClass) => c.date === date);
                        const previewClasses = dayClasses.slice(0, 3);
                        return (
                          <div key={date} className="mb-14">
                            <div className="flex justify-between items-end mb-6">
                              <div>
                                <p className="day-eyebrow">Day {dayIndex + 1}</p>
                                <h2 className="leap-day-label">{date}</h2>
                                <p className="leap-day-count mt-1">{dayClasses.length} classes available</p>
                              </div>
                              {dayClasses.length > 3 && (
                                <button onClick={() => { setSelectedDay(date); setCurrentPage(1); }} className="leap-see-more">
                                  See All <ChevronRight size={16} />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {previewClasses.map((item: LeapClass, index: number) => renderClassCard(item, index))}
                            </div>
                            {dayIndex < uniqueDays.length - 1 && (
                              <div className="leap-divider"><div className="leap-divider-icon" /></div>
                            )}
                          </div>
                        );
                      })}
                      {filteredAndSortedClasses.length === 0 && (
                        <div className="text-center py-16 text-leap-olive">
                          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:700, marginBottom:'0.5rem' }}>No classes found</p>
                          <p style={{ fontSize:'0.9rem' }}>Try adjusting your search or filters.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => { setSelectedDay(null); setCurrentPage(1); }} className="p-2 hover:bg-leap-tan/30 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                        <div>
                          <p className="day-eyebrow">All Classes</p>
                          <h2 className="leap-day-label">{selectedDay}</h2>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredAndSortedClasses.filter((c: LeapClass) => c.date === selectedDay)
                          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                          .map((item: LeapClass, index: number) => renderClassCard(item, index))}
                      </div>
                      {Math.ceil(filteredAndSortedClasses.filter((c: LeapClass) => c.date === selectedDay).length / ITEMS_PER_PAGE) > 1 && (
                        <div className="flex justify-center items-center gap-4">
                          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="leap-page-btn px-6 py-3 font-bold flex items-center gap-2"><ChevronLeft size={16}/> Prev</button>
                          <span className="font-bold text-leap-dark text-sm">Page {currentPage} of {Math.ceil(filteredAndSortedClasses.filter((c: LeapClass) => c.date === selectedDay).length / ITEMS_PER_PAGE)}</span>
                          <button disabled={currentPage === Math.ceil(filteredAndSortedClasses.filter((c: LeapClass) => c.date === selectedDay).length / ITEMS_PER_PAGE)} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="leap-page-btn px-6 py-3 font-bold flex items-center gap-2">Next <ChevronRight size={16}/></button>
                        </div>
                      )}
                    </div>
                  )}
                </main>
              </div>
            )}
          </section>
        </main>
      )}

      {currentView === 'about' && <AboutPage />}
      {currentView === 'major-events' && <MajorEventsPage />}
      {currentView === 'faq' && <FAQPage />}
      {currentView === 'contact' && <ContactPage />}

      {/* FOOTER */}
      <footer className="leap-footer text-leap-cream py-16 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={leapLogo} alt="LEAP 2026" className="h-10 w-auto" style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 2px 8px rgba(222,154,73,0.5)) brightness(1.1)' }} />
            </div>
            <p className="text-leap-cream/60 max-w-md mb-8 text-sm leading-relaxed">Lasallian Enrichment Alternative Program. Empowering students through diverse learning experiences and community building.</p>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-leap-maroon/60 transition-colors cursor-pointer"><Info size={16} /></div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-leap-gold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-leap-cream/60 text-sm">
              <li><button onClick={() => { setCurrentView('about'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">About LEAP</button></li>
              <li><button onClick={() => { setCurrentView('home'); window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0); }} className="hover:text-white transition-colors">Class List</button></li>
              <li><button onClick={() => { setCurrentView('major-events'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Major Events</button></li>
              <li><button onClick={() => { setCurrentView('faq'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">FAQs</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-leap-gold mb-6">Support</h4>
            <ul className="space-y-4 text-leap-cream/60 text-sm">
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Contact OPS</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Technical Issues</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t border-white/10 text-center text-leap-cream/40 text-xs tracking-wide">
          <p>© 2026 LEAP Operations Team · De La Salle University · Central Student Organization</p>
        </div>
      </footer>

      <ScrollProgress />
      <CustomCursor />
    </div>
  );
}

export default function App() {
  return <ErrorBoundary><LeapApp /></ErrorBoundary>;
}