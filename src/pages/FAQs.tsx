import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Mail } from 'lucide-react';
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

export default function FAQs() {
  const [open, setOpen] = useState<number | null>(null);
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
      <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know before you register" accent="LEAP 2026 · Help Center" />
      <main className="container mx-auto px-4 pb-24 max-w-3xl">
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className={`faq-item ${open === i ? 'faq-open' : ''}`}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <div className={`faq-chevron ${open === i ? 'faq-chevron-open' : ''}`}>
                  <ChevronRight size={18} />
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
                    <p className="faq-answer">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="faq-cta-card">
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 700, color: '#334b46', marginBottom: '0.5rem' }}>Still have questions?</p>
          <p style={{ color: 'rgba(51,75,70,0.7)', marginBottom: '1.5rem' }}>Our team is always happy to help. Drop us a message.</p>
          <a href="mailto:leap@dlsu.edu.ph" className="btn-leap-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Mail size={16} /> Contact the Team
          </a>
        </motion.div>
      </main>
    </PageWrapper>
  );
}
