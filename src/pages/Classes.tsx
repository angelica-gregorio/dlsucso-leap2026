import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, ChevronRight, ChevronLeft, Info, ArrowLeft } from 'lucide-react';
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
    className="flex-grow"
    style={{ background: 'linear-gradient(180deg, #fffdf6 0%, #fff9eb 100%)' }}
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
  const totalPages = Math.ceil(filteredAndSortedClasses.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedClasses = filteredAndSortedClasses.slice(startIdx, endIdx);

  return (
    <PageWrapper>
      <div style={{ background: 'linear-gradient(180deg, #fffdf6 0%, #fff9eb 100%)' }}>
        <PageHero title="All Classes" subtitle="Choose from 200+ workshops, talks, and experiences" accent="LEAP 2026 · Class Catalog" />
      </div>
      <main className="container mx-auto px-4 pb-24 max-w-6xl" style={{ background: 'transparent' }}>
        {!user ? (
          <div className="leap-info-card p-12 rounded-3xl text-center max-w-xl mx-auto my-12">
            <div className="leap-detail-icon-wrap w-16 h-16 mx-auto mb-6" style={{ width: 64, height: 64 }}><Info size={32} /></div>
            <h3 className="text-2xl font-bold text-leap-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to browse classes</h3>
            <p className="text-leap-olive mb-8 text-lg">You must be signed in with your DLSU account to view and register for LEAP classes.</p>
            <button onClick={onSignIn} className="btn-leap-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl">Sign In Now</button>
          </div>
        ) : (
          <>
            {/* SEARCH & FILTER */}
            <section className="py-8 px-4 rounded-2xl bg-gradient-to-r from-leap-cream/10 to-leap-gold/10 mb-12">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-leap-olive" size={18} />
                    <input
                      type="text"
                      placeholder="Search classes by title, organization, or topic…"
                      className="leap-search w-full pl-12 pr-4 py-3.5"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as 'title-asc' | 'title-desc' | 'slots-desc' | 'slots-asc')}
                    aria-label="Sort events"
                    className="leap-select px-5 py-3.5 appearance-none"
                  >
                    <option value="title-asc">Sort: Title (A–Z)</option>
                    <option value="title-desc">Sort: Title (Z–A)</option>
                    <option value="slots-desc">Sort: Most Slots</option>
                    <option value="slots-asc">Sort: Fewest Slots</option>
                  </select>
                </div>

                {/* DATE FILTER PILLS */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onDaySelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDay === null
                        ? 'bg-leap-gold text-leap-dark'
                        : 'bg-leap-cream/30 text-leap-olive hover:bg-leap-cream/50'
                    }`}
                  >
                    All Dates
                  </button>
                  {uniqueDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => onDaySelect(day)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedDay === day
                          ? 'bg-leap-gold text-leap-dark'
                          : 'bg-leap-cream/30 text-leap-olive hover:bg-leap-cream/50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RESULTS COUNT */}
            <div className="mb-8 text-center">
              <p className="text-leap-olive text-sm font-medium">
                Showing {startIdx + 1}–{Math.min(endIdx, filteredAndSortedClasses.length)} of {filteredAndSortedClasses.length} classes
              </p>
            </div>

            {/* CLASSES GRID */}
            {filteredAndSortedClasses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-leap-olive text-lg">No classes match your filters. Try adjusting your search.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {paginatedClasses.map((item, index) => renderClassCard(item, index))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 py-8">
                    <button
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-leap-cream/20 text-leap-olive hover:bg-leap-cream/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} /> Previous
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => onPageChange(page)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                            currentPage === page
                              ? 'bg-leap-gold text-leap-dark'
                              : 'bg-leap-cream/20 text-leap-olive hover:bg-leap-cream/40'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-leap-cream/20 text-leap-olive hover:bg-leap-cream/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {user && viewingClass && (
        <div
          onClick={() => onClassSelect(null)}
          className="fixed inset-0 z-[1100] overflow-y-auto"
          style={{
            background: 'rgba(8, 10, 8, 0.72)',
            backdropFilter: 'blur(6px)',
            padding: 'clamp(0.75rem, 2.5vw, 1.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fffdf6] border overflow-hidden relative"
            style={{
              width: 'min(1040px, 94vw)',
              maxHeight: 'calc(100vh - 2rem)',
              margin: '0 auto',
              borderColor: 'rgba(224,183,136,0.34)',
              borderRadius: 18,
              boxShadow: '0 24px 64px rgba(51, 75, 70, 0.16)'
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
              <div className="relative min-h-[250px]" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
                <img src={viewingClass.image} alt={viewingClass.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/8 to-transparent" />
                <div className="absolute top-6 left-6 flex gap-2 items-center">
                  {viewingClass.orgLogo ? (
                    <img src={viewingClass.orgLogo} alt={viewingClass.org} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: '2px solid rgba(222,154,73,0.5)' }} referrerPolicy="no-referrer" />
                  ) : null}
                  <span className="leap-detail-badge">{viewingClass.subtheme}</span>
                </div>
              </div>

              <div className="p-6 md:p-8" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 2rem)' }}>
                <h1 className="text-leap-dark mb-3 font-bold" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)' }}>
                  {viewingClass.title}
                </h1>
                <p className="text-sm text-leap-rust font-semibold uppercase tracking-wide mb-8">Organized by {viewingClass.org}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                      <div><p className="text-xs text-leap-olive font-bold uppercase tracking-widest mb-0.5">Slots Available</p><p className="font-semibold">{viewingClass.slots} participants</p></div>
                    </div>
                  </div>
                </div>

                <div className="mb-8 pb-8 border-b border-[#e5cfab]">
                  <h3 className="text-lg font-bold text-leap-dark mb-4">About this class</h3>
                  <p className="text-leap-dark/80 leading-relaxed">{viewingClass.description || 'No description provided.'}</p>
                </div>

                <a href={viewingClass.googleFormUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-leap-primary px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-2">
                  Register Now <ChevronRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
