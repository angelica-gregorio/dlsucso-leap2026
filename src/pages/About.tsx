import { motion } from 'framer-motion';
import { Sparkles, Users, Leaf, Heart } from 'lucide-react';
import { PageWrapper, PageHero } from '../components/PageCommon';

export default function About() {
  const values = [
    { icon: Sparkles, title: 'Innovation', desc: 'Breaking boundaries of traditional learning with creative and unconventional approaches.' },
    { icon: Users, title: 'Community', desc: 'Fostering meaningful connections between students, orgs, and the greater DLSU family.' },
    { icon: Leaf, title: 'Growth', desc: 'Cultivating personal and professional development beyond the classroom walls.' },
    { icon: Heart, title: 'Service', desc: 'Grounded in the Lasallian tradition of faith, service, and communion in mission.' },
  ];

  return (
    <PageWrapper>
      <PageHero title="About LEAP 2026" subtitle="Isang Nayon, Isang Layunin — One Village, One Purpose" accent="DLSU · Central Student Organization" />
      <main className="container mx-auto px-4 pb-24 max-w-5xl">
        <div className="about-intro-grid">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="section-label">What is LEAP?</h2>
            <p className="about-body">The <strong>Lasallian Enrichment Alternative Program</strong> is De La Salle University's annual week-long celebration of alternative learning — a space where students step outside the lecture hall and into something wilder, warmer, and more human.</p>
            <p className="about-body" style={{ marginTop: '1rem' }}>For one week every year, the campus transforms into a nayon — a village buzzing with workshops, performances, talks, and hands-on experiences spanning every field imaginable.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="about-stat-panel">
            <div className="about-stat"><span className="about-stat-num">200+</span><span className="about-stat-lbl">Classes offered</span></div>
            <div className="about-stat-div" />
            <div className="about-stat"><span className="about-stat-num">7</span><span className="about-stat-lbl">Days of learning</span></div>
            <div className="about-stat-div" />
            <div className="about-stat"><span className="about-stat-num">5,000+</span><span className="about-stat-lbl">Students engaged</span></div>
            <div className="about-stat-div" />
            <div className="about-stat"><span className="about-stat-num">50+</span><span className="about-stat-lbl">Organizations</span></div>
          </motion.div>
        </div>
        <div className="vm-grid">
          {[
            { label: 'Our Vision', icon: '🌾', text: 'A DLSU community where every student discovers their full potential through immersive, joyful, and transformative learning experiences rooted in Lasallian values.' },
            { label: 'Our Mission', icon: '🏡', text: 'To curate an inclusive week of alternative education — accessible, engaging, and deeply human — that complements academic rigor with lived experience and creative exploration.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="vm-card">
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
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="value-card">
                <div className="value-icon-wrap"><v.icon size={22} /></div>
                <h4 className="value-title">{v.title}</h4>
                <p className="value-desc">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="theme-banner">
          <div className="theme-banner-inner">
            <p className="theme-banner-eyebrow">2026 Theme</p>
            <h2 className="theme-banner-title">Isang Nayon, Isang Layunin</h2>
            <p className="theme-banner-body">One Village, One Purpose. This year's theme draws from the Filipino bayanihan spirit — the collective strength of a community that moves, builds, and grows together. Like a nayon gathered around the harvest, LEAP 2026 calls every Lasallian to find their place in the circle.</p>
          </div>
        </motion.div>
      </main>
    </PageWrapper>
  );
}
