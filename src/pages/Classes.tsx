import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, ChevronRight, ChevronLeft, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
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

interface ClassesPageProps {
  user: FirebaseUser | null;
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
  renderClassCard: (item: LeapClass, index: number) => ReactNode;
}

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      flexGrow: 1,
      background: 'linear-gradient(180deg, #fffdf6 0%, #fff9eb 100%)',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </motion.div>
);

const PageHero = ({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) => (
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
    <div className="page-hero-glow" />
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        fontFamily: "'DM Sans',sans-serif",
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#de9a49',
        marginBottom: '1rem',
      }}
    >
      {accent}
    </motion.p>
    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="page-hero-title"
    >
      {title}
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26 }}
      className="page-hero-subtitle"
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
        background: 'linear-gradient(90deg,transparent,#de9a49,transparent)',
        margin: '2rem auto 0',
      }}
    />
  </div>
);

export default function Classes({
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
  renderClassCard,
}: ClassesPageProps) {
  const ITEMS_PER_PAGE = 6;
  const dateFilteredClasses = selectedDay 
    ? filteredAndSortedClasses.filter((c) => c.date === selectedDay)
    : filteredAndSortedClasses;
  const totalPages = Math.ceil(dateFilteredClasses.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedClasses = dateFilteredClasses.slice(startIdx, endIdx);

  return (
    <PageWrapper>
      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(180deg, #fffdf6 0%, #fff9eb 100%)' }}>
        <PageHero
          title="All Classes"
          subtitle="Choose from 200+ workshops, talks, and experiences"
          accent="LEAP 2026 · Class Catalog"
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          padding: '0 clamp(0.75rem, 3vw, 1.5rem) 6rem',
          background: 'transparent',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* ── NOT SIGNED IN ── */}
          {!user ? (
            <div
              className="leap-info-card"
              style={{
                padding: 'clamp(2rem, 5vw, 3rem)',
                borderRadius: '1.5rem',
                textAlign: 'center',
                maxWidth: '36rem',
                margin: '3rem auto',
              }}
            >
              <div
                className="leap-detail-icon-wrap"
                style={{ width: 64, height: 64, margin: '0 auto 1.5rem' }}
              >
                <Info size={32} />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                  fontWeight: 700,
                  color: '#334b46',
                  marginBottom: '0.75rem',
                }}
              >
                Sign in to browse classes
              </h3>
              <p style={{ color: '#7c6b4b', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.7 }}>
                You must be signed in with your DLSU account to view and register for LEAP classes.
              </p>
              <button
                onClick={onSignIn}
                className="btn-leap-primary"
                style={{ padding: '0.95rem 2.5rem', borderRadius: '1rem', fontSize: '1rem' }}
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <>
              {/* ── SEARCH & FILTER ── */}
              <section
                style={{
                  padding: 'clamp(1rem, 3vw, 2rem)',
                  borderRadius: '1rem',
                  background: 'rgba(249,236,182,0.25)',
                  marginBottom: '2rem',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search row */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      width: '100%',
                    }}
                  >
                    <style>{`
                      @media (min-width: 640px) {
                        .classes-search-row {
                          flex-direction: row !important;
                        }
                      }
                    `}</style>
                    <div
                      className="classes-search-row"
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}
                    >
                      <div style={{ position: 'relative', flexGrow: 1, minWidth: 0 }}>
                        <Search
                          style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#7c6b4b',
                            pointerEvents: 'none',
                          }}
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Search classes, orgs, or topics…"
                          className="leap-search"
                          style={{ width: '100%', paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.875rem', paddingBottom: '0.875rem', boxSizing: 'border-box' }}
                          value={searchQuery}
                          onChange={(e) => onSearchChange(e.target.value)}
                        />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          onSortChange(e.target.value as 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc')
                        }
                        aria-label="Sort classes"
                        className="leap-select"
                        style={{ padding: '0.875rem 1.25rem', flexShrink: 0, boxSizing: 'border-box' }}
                      >
                        <option value="title-asc">Title (A–Z)</option>
                        <option value="title-desc">Title (Z–A)</option>
                        <option value="slots-desc">Most Slots</option>
                        <option value="slots-asc">Fewest Slots</option>
                      </select>
                    </div>
                  </div>

                  {/* Date filter pills */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      width: '100%',
                    }}
                  >
                    <button
                      onClick={() => onDaySelect(null)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        background: selectedDay === null ? '#de9a49' : 'rgba(249,236,182,0.5)',
                        color: selectedDay === null ? '#1a1008' : '#7c6b4b',
                      }}
                    >
                      All Dates
                    </button>
                    {uniqueDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => onDaySelect(day)}
                        style={{
                          padding: '0.4rem 1rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                          background: selectedDay === day ? '#de9a49' : 'rgba(249,236,182,0.5)',
                          color: selectedDay === day ? '#1a1008' : '#7c6b4b',
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── RESULTS COUNT ── */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.85rem',
                    color: '#7c6b4b',
                    fontWeight: 500,
                  }}
                >
                  Showing {Math.min(startIdx + 1, dateFilteredClasses.length)}–{Math.min(endIdx, dateFilteredClasses.length)} of {dateFilteredClasses.length} classes
                </p>
              </div>

              {/* ── CLASSES GRID ── */}
              {dateFilteredClasses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                  <p style={{ color: '#7c6b4b', fontSize: '1.1rem' }}>
                    No classes match your filters. Try adjusting your search.
                  </p>
                </div>
              ) : (
                <>
                  <style>{`
                    .classes-grid {
                      display: grid;
                      grid-template-columns: 1fr;
                      gap: 1.25rem;
                      width: 100%;
                      box-sizing: border-box;
                    }
                    @media (min-width: 640px) {
                      .classes-grid { grid-template-columns: repeat(2, 1fr); }
                    }
                    @media (min-width: 1024px) {
                      .classes-grid { grid-template-columns: repeat(3, 1fr); }
                    }
                  `}</style>
                  <div className="classes-grid" style={{ marginBottom: '2rem' }}>
                    {paginatedClasses.map((item, index) => renderClassCard(item, index))}
                  </div>

                  {/* ── PAGINATION ── */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '2rem 0',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="leap-page-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.6rem 1.1rem',
                        }}
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className="leap-page-btn"
                            style={{
                              width: 38,
                              height: 38,
                              padding: 0,
                              borderRadius: '0.5rem',
                              fontWeight: 700,
                              background: currentPage === page ? '#de9a49' : undefined,
                              color: currentPage === page ? '#1a1008' : undefined,
                              borderColor: currentPage === page ? '#de9a49' : undefined,
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="leap-page-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.6rem 1.1rem',
                        }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── CLASS DETAIL MODAL ── */}
      {user && viewingClass && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClassSelect(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            overflowY: 'auto',
            background: 'rgba(8, 10, 8, 0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: 'clamp(0.5rem, 2vw, 1.5rem)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fffdf6',
              border: '1px solid rgba(224,183,136,0.34)',
              borderRadius: 18,
              boxShadow: '0 24px 64px rgba(51,75,70,0.18)',
              width: 'min(1040px, 96vw)',
              maxHeight: 'calc(100dvh - 2rem)',
              overflow: 'hidden',
              position: 'relative',
              margin: '1rem auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => onClassSelect(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 10,
                background: 'rgba(255,252,241,0.96)',
                border: '1px solid rgba(224,183,136,0.3)',
                borderRadius: '999px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334b46',
                boxShadow: '0 2px 8px rgba(51,75,70,0.12)',
                transition: 'background 0.2s',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal inner: image + detail — stacks on mobile */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'min(340px, 38%) 1fr',
                overflow: 'auto',
                maxHeight: 'calc(100dvh - 2rem)',
              }}
            >
              <style>{`
                @media (max-width: 640px) {
                  .modal-grid { grid-template-columns: 1fr !important; }
                  .modal-image { min-height: 200px !important; max-height: 240px !important; }
                }
              `}</style>
              <div
                className="modal-grid"
                style={{
                  display: 'contents',
                }}
              >
                {/* Image panel */}
                <div
                  className="modal-image"
                  style={{
                    position: 'relative',
                    minHeight: 260,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={viewingClass.image}
                    alt={viewingClass.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    referrerPolicy="no-referrer"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      left: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {viewingClass.orgLogo && (
                      <img
                        src={viewingClass.orgLogo}
                        alt={viewingClass.org}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          objectFit: 'cover',
                          border: '2px solid rgba(222,154,73,0.5)',
                        }}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {viewingClass.subtheme && (
                      <span className="leap-detail-badge">{viewingClass.subtheme}</span>
                    )}
                  </div>
                </div>

                {/* Detail panel */}
                <div
                  style={{
                    padding: 'clamp(1.25rem, 3vw, 2rem)',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(1.4rem, 3vw, 2.1rem)',
                        fontWeight: 800,
                        color: '#334b46',
                        lineHeight: 1.1,
                        marginBottom: '0.5rem',
                      }}
                    >
                      {viewingClass.title}
                    </h1>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#b05a32',
                      }}
                    >
                      Organized by {viewingClass.org}
                    </p>
                  </div>

                  {/* Metadata grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c6b4b', marginBottom: 2 }}>Date & Time</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#334b46', fontSize: '0.9rem' }}>{viewingClass.date} · {viewingClass.time}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c6b4b', marginBottom: 2 }}>Location</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#334b46', fontSize: '0.9rem' }}>{viewingClass.venue} ({viewingClass.modality})</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div className="leap-detail-icon-wrap" style={{ flexShrink: 0 }}>
                        <Users size={18} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c6b4b', marginBottom: 2 }}>Slots</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: '#334b46', fontSize: '0.9rem' }}>{viewingClass.slots} participants</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    style={{
                      borderTop: '1px solid rgba(229,207,171,0.6)',
                      paddingTop: '1rem',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#334b46',
                        marginBottom: '0.6rem',
                      }}
                    >
                      About this class
                    </h3>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.95rem',
                        lineHeight: 1.8,
                        color: 'rgba(51,75,70,0.8)',
                      }}
                    >
                      {viewingClass.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* CTA */}
                  <div style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <a
                      href={viewingClass.googleFormUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-leap-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.9rem 2rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                      }}
                    >
                      Register Now <ChevronRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </PageWrapper>
  );
}