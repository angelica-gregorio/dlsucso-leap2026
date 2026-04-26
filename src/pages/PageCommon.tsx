import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export const PageWrapper = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      flexGrow: 1,
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </motion.div>
);

export const PageHero = ({ title, subtitle, accent }: {
  title: string;
  subtitle: string;
  accent: string;
}) => (
  <div
    className="page-hero"
    style={{
      paddingTop: 'clamp(6rem, 12vw, 10rem)',
      paddingBottom: 'clamp(2rem, 4vw, 4rem)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div className="page-hero-fireflies">
      <span/><span/><span/><span/><span/><span/>
    </div>
    <div className="page-hero-glow" />

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#de9a49',
        marginBottom: '1rem',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {accent}
    </motion.p>

    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="page-hero-title"
      style={{ position: 'relative', zIndex: 2 }}
    >
      {title}
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26 }}
      className="page-hero-subtitle"
      style={{ position: 'relative', zIndex: 2 }}
    >
      {subtitle}
    </motion.p>

    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      style={{
        width: 60,
        height: 2,
        background: 'linear-gradient(90deg, transparent, #de9a49, transparent)',
        margin: '2rem auto 0',
        position: 'relative',
        zIndex: 2,
      }}
    />
  </div>
);