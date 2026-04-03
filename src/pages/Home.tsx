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
  sortBy: string;
  onSortChange: (sort: string) => void;
  filteredAndSortedClasses: LeapClass[];
  uniqueDays: string[];
  selectedDay: string | null;
  onDaySelect: (day: string | null) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  viewingClass: LeapClass | null;
  onClassSelect: (leapClass: LeapClass | null) => void;
  activeSubtheme: string | null;
  onSubthemeSelect: (theme: string | null) => void;
  onSignIn: () => void;
  onHeroScroll: () => void;
  HeroSection: ReactNode;
  MainEventsSection: ReactNode;
  SubthemesStrip: ReactNode;
  renderClassCard: (item: LeapClass, index: number) => ReactNode;
}

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
  MainEventsSection,
  SubthemesStrip,
  renderClassCard,
}: HomeProps) {
  const ITEMS_PER_PAGE = 6;

  return (
    <main className="flex-grow">
      {/* HERO */}
      {HeroSection}

      {/* SEARCH BAR */}
      <section id="classes" className="search-section sticky top-16 z-30 py-4 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-leap-olive" size={18} />
              <input
                type="text"
                placeholder="Search events, workshops, or themes…"
                className="leap-search w-full pl-12 pr-4 py-3.5"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort events"
              className="leap-select px-5 py-3.5 appearance-none"
            >
              <option value="title-asc">Sort: Title (A–Z)</option>
              <option value="title-desc">Sort: Title (Z–A)</option>
              <option value="slots-desc">Sort: Most Slots</option>
              <option value="slots-asc">Sort: Fewest Slots</option>
            </select>
          </div>
        </div>
      </section>

      {MainEventsSection}

      {SubthemesStrip}

      {/* CLASSES SECTION */}
      <section id="classes-section">
        {!user ? (
          <div className="container mx-auto px-4 py-16">
            <div className="leap-info-card p-12 rounded-3xl text-center max-w-xl mx-auto">
              <div className="leap-detail-icon-wrap w-16 h-16 mx-auto mb-6" style={{ width: 64, height: 64 }}><Info size={32} /></div>
              <h3 className="text-2xl font-bold text-leap-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to see classes</h3>
              <p className="text-leap-olive mb-8 text-lg">You must be signed in with your DLSU account to view and register for LEAP classes.</p>
              <button onClick={onSignIn} className="btn-leap-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl">Sign In Now</button>
            </div>
          </div>
        ) : viewingClass ? (
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <button onClick={() => onClassSelect(null)} className="leap-see-more mb-8"><ArrowLeft size={16} /> Back to Classes</button>
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="h-80 w-full relative">
                <img src={viewingClass.image} alt={viewingClass.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-6 left-6 flex gap-2 items-center">
                  {viewingClass.orgLogo ? (
                    <img src={viewingClass.orgLogo} alt={viewingClass.org} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: '2px solid rgba(222,154,73,0.5)' }} referrerPolicy="no-referrer" />
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
              <div className="leap-days-sidebar-title">LEAP<br />Days</div>
              {uniqueDays.length === 0 ? (
                <p style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.82rem', color: 'rgba(124,107,75,0.6)' }}>No days found.</p>
              ) : (
                uniqueDays.map((date: string, dayIndex: number) => {
                  const count = filteredAndSortedClasses.filter((c: LeapClass) => c.date === date).length;
                  return (
                    <button
                      key={date}
                      className={`day-sidebar-item w-full text-left ${selectedDay === date ? 'active' : ''}`}
                      onClick={() => onDaySelect(date === selectedDay ? null : date)}
                    >
                      <span className="day-sidebar-num">Day {String(dayIndex + 1).padStart(2, '0')}</span>
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
                            <button onClick={() => onDaySelect(date)} className="leap-see-more">
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
                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No classes found</p>
                      <p style={{ fontSize: '0.9rem' }}>Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => onDaySelect(null)} className="p-2 hover:bg-leap-tan/30 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                    <div>
                      <p className="day-eyebrow">All Classes</p>
                      <h2 className="leap-day-label">{selectedDay}</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {filteredAndSortedClasses
                      .filter((c: LeapClass) => c.date === selectedDay)
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((item: LeapClass, index: number) => renderClassCard(item, index))}
                  </div>
                  {Math.ceil(filteredAndSortedClasses.filter((c: LeapClass) => c.date === selectedDay).length / ITEMS_PER_PAGE) > 1 && (
                    <div className="flex justify-center items-center gap-4">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        className="leap-page-btn px-6 py-3 font-bold flex items-center gap-2"
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      <span className="font-bold text-leap-dark text-sm">Page {currentPage} of {Math.ceil(filteredAndSortedClasses.filter((c: LeapClass) => c.date === selectedDay).length / ITEMS_PER_PAGE)}</span>
                      <button
                        disabled={currentPage === Math.ceil(filteredAndSortedClasses.filter((c: LeapClass) => c.date === selectedDay).length / ITEMS_PER_PAGE)}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="leap-page-btn px-6 py-3 font-bold flex items-center gap-2"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </section>
    </main>
  );
}
