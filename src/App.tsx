/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useState, useEffect, type ErrorInfo, type ReactNode, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  ChevronRight, 
  Menu, 
  X,
  Filter,
  Info,
  LogOut,
  LogIn,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowLeft,
  Upload,
  ExternalLink
} from 'lucide-react';

import { contentfulClient } from './contentful';

// Firebase Imports
import { 
  auth, 
  db, 
  storage,
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  runTransaction,
  deleteDoc,
  ref,
  uploadBytes,
  getDownloadURL
} from './firebase';

import type { User as FirebaseUser } from "firebase/auth";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Error Boundary Component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.props = props;
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-leap-cream p-6">
          <div className="glass-card p-8 rounded-3xl max-w-md text-center">
            <AlertCircle className="mx-auto text-leap-maroon mb-4" size={48} />
            <h2 className="text-2xl font-bold text-leap-dark mb-2">Something went wrong</h2>
            <p className="text-leap-olive mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-leap-maroon text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-leap-rust transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mock data for classes (Fallback)
const generateMockClasses = (count: number) => {
  const dates = ["June 21, 2026", "June 22, 2026", "June 23, 2026", "June 24, 2026", "June 25, 2026"];
  const subthemes = ["Creative Tech", "Innovation", "Culture", "Wellness", "Leadership", "Business"];
  const orgs = ["Chemical Engineering Society", "Computer Studies Society", "Manila Symphony Orchestra", "Business Management Society", "Student Government", "Arts Council"];
  const modalities = ["Face-to-Face", "Hybrid", "Online"];
  const venues = ["A011", "G302", "Yuchengco Hall", "V201", "LS Hall", "Online (Zoom)"];
  const times = ["9:00 AM - 12:00 PM", "1:00 PM - 4:00 PM", "6:00 PM - 7:30 PM", "10:00 AM - 11:30 AM", "2:00 PM - 5:00 PM"];
  const titles = [
    "Digital Art Mastery", "Beyond Code: Future Tech", "Symphonic Adventures", "Mindfulness 101", 
    "Startup Fundamentals", "Public Speaking Workshop", "Data Science for Beginners", "Sustainable Living",
    "Financial Literacy", "Graphic Design Basics", "Photography Walk", "Robotics Workshop"
  ];

  return Array.from({ length: count }).map((_, i) => ({
    id: (i + 1).toString(),
    title: `${titles[i % titles.length]} ${Math.floor(i / titles.length) > 0 ? `(Batch ${Math.floor(i / titles.length) + 1})` : ''}`,
    org: orgs[i % orgs.length],
    modality: modalities[i % modalities.length],
    date: dates[i % dates.length],
    time: times[i % times.length],
    venue: venues[i % venues.length],
    slots: 30 + (i % 20),
    subtheme: subthemes[i % subthemes.length],
    image: `https://picsum.photos/seed/leap${i}/400/250`,
    description: `Join us for an engaging and interactive session on ${subthemes[i % subthemes.length].toLowerCase()}. This class is designed to provide you with practical skills and knowledge. Don't miss out on this opportunity to learn from industry experts and connect with peers!`,
    googleFormUrl: "https://forms.google.com"
  }));
};

const MOCK_CLASSES = generateMockClasses(200);

const AboutPage = () => (
  <main className="container mx-auto px-4 py-32 flex-grow max-w-4xl">
    <h1 className="text-5xl font-bold text-leap-dark mb-8 text-center">About LEAP 2026</h1>
    <div className="glass-card p-10 rounded-3xl space-y-6 text-lg text-leap-dark/80">
      <p>
        The Lasallian Enrichment Alternative Program (LEAP) is an annual university-wide event at De La Salle University that provides students with alternative learning experiences outside the traditional classroom setting.
      </p>
      <p>
        LEAP 2026 aims to foster holistic development by offering a diverse range of classes, workshops, and seminars spanning various fields such as arts, technology, wellness, leadership, and culture.
      </p>
      <h2 className="text-3xl font-bold text-leap-dark mt-8 mb-4">Our Vision</h2>
      <p>
        To cultivate a community of lifelong learners who are innovative, socially responsible, and equipped with the skills to thrive in a rapidly changing world.
      </p>
      <h2 className="text-3xl font-bold text-leap-dark mt-8 mb-4">Our Mission</h2>
      <p>
        To provide accessible, engaging, and high-quality alternative education that complements academic learning and promotes personal and professional growth.
      </p>
    </div>
  </main>
);

const MajorEventsPage = () => (
  <main className="container mx-auto px-4 py-32 flex-grow max-w-5xl">
    <h1 className="text-5xl font-bold text-leap-dark mb-12 text-center">Major Events</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-3xl hover:shadow-xl transition-shadow">
        <div className="h-48 bg-leap-maroon rounded-2xl mb-6 overflow-hidden">
          <img src="https://picsum.photos/seed/kickoff/600/300" alt="Kickoff" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
        </div>
        <h3 className="text-2xl font-bold text-leap-dark mb-2">LEAP 2026 Kickoff Rally</h3>
        <p className="text-leap-olive font-medium mb-4">June 20, 2026 • Henry Sy Sr. Hall Grounds</p>
        <p className="text-leap-dark/80">
          Join us for the grand opening of LEAP 2026! Featuring live performances, special guest speakers, and an overview of the exciting classes lined up for the week.
        </p>
      </div>
      <div className="glass-card p-8 rounded-3xl hover:shadow-xl transition-shadow">
        <div className="h-48 bg-leap-rust rounded-2xl mb-6 overflow-hidden">
          <img src="https://picsum.photos/seed/culminating/600/300" alt="Culminating" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
        </div>
        <h3 className="text-2xl font-bold text-leap-dark mb-2">Culminating Night</h3>
        <p className="text-leap-olive font-medium mb-4">June 26, 2026 • Teresa Yuchengco Auditorium</p>
        <p className="text-leap-dark/80">
          Celebrate the end of an amazing week of learning and discovery. The culminating night will showcase student outputs, award ceremonies, and a closing concert.
        </p>
      </div>
    </div>
  </main>
);

const FAQPage = () => {
  const faqs = [
    {
      q: "Who can participate in LEAP classes?",
      a: "All currently enrolled undergraduate students of De La Salle University are eligible and encouraged to participate in LEAP classes."
    },
    {
      q: "How many classes can I register for?",
      a: "Students can register for a maximum of 3 classes to ensure everyone gets a chance to participate. Please choose your classes carefully to avoid schedule conflicts."
    },
    {
      q: "Are LEAP classes graded?",
      a: "No, LEAP classes are non-credit and non-graded. They are designed for personal enrichment and skill development."
    },
    {
      q: "What happens if I miss a class I registered for?",
      a: "While there are no academic penalties, we highly encourage attendance as slots are limited. Repeated absences may affect your priority registration for future LEAP events."
    },
    {
      q: "Can I change my registered classes?",
      a: "Yes, you can drop a class and register for a different one up until the registration deadline, provided there are still available slots in the new class."
    }
  ];

  return (
    <main className="container mx-auto px-4 py-32 flex-grow max-w-4xl">
      <h1 className="text-5xl font-bold text-leap-dark mb-12 text-center">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="glass-card p-8 rounded-3xl">
            <h3 className="text-2xl font-bold text-leap-dark mb-3">{faq.q}</h3>
            <p className="text-lg text-leap-dark/80">{faq.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

const ContactPage = () => (
  <main className="container mx-auto px-4 py-32 flex-grow max-w-3xl">
    <h1 className="text-5xl font-bold text-leap-dark mb-8 text-center">Contact Us</h1>
    <div className="glass-card p-10 rounded-3xl">
      <p className="text-lg text-leap-dark/80 mb-8 text-center">
        Have questions or need assistance? Reach out to the LEAP Operations Team.
      </p>
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-leap-dark">
          <div className="w-12 h-12 rounded-full bg-leap-tan/30 flex items-center justify-center text-leap-rust">
            <MapPin size={24} />
          </div>
          <div>
            <p className="font-bold text-lg">Office Location</p>
            <p className="text-leap-dark/80">SPS Building, Rm 302, De La Salle University</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-leap-dark">
          <div className="w-12 h-12 rounded-full bg-leap-tan/30 flex items-center justify-center text-leap-rust">
            <Users size={24} />
          </div>
          <div>
            <p className="font-bold text-lg">Email Support</p>
            <p className="text-leap-dark/80">leap@dlsu.edu.ph</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-leap-dark">
          <div className="w-12 h-12 rounded-full bg-leap-tan/30 flex items-center justify-center text-leap-rust">
            <Calendar size={24} />
          </div>
          <div>
            <p className="font-bold text-lg">Office Hours</p>
            <p className="text-leap-dark/80">Monday - Friday, 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  </main>
);

function LeapApp() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title-asc');
  const [scrolled, setScrolled] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingClass, setViewingClass] = useState<any>(null);
  const [currentView, setCurrentView] = useState('home');
  const ITEMS_PER_PAGE = 6;

  const filteredAndSortedClasses = React.useMemo(() => {
    let result = classes.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtheme.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'slots-desc') return b.slots - a.slots;
      if (sortBy === 'slots-asc') return a.slots - b.slots;
      return 0;
    });

    return result;
  }, [classes, searchQuery, sortBy]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if email is DLSU
        if (!currentUser.email?.endsWith('@dlsu.edu.ph')) {
          await signOut(auth);
          alert("Please use your @dlsu.edu.ph Google account to sign in.");
          return;
        }

        // Fetch or create user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          const newProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: 'student',
            registeredClasses: []
          };
          await setDoc(doc(db, 'users', currentUser.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Classes from Contentful
  useEffect(() => {
    if (!user) return;
    
    const fetchClasses = async () => {
      if (!contentfulClient) {
        console.warn("Contentful client not initialized. Please set VITE_CONTENTFUL_SPACE_ID and VITE_CONTENTFUL_ACCESS_TOKEN.");
        setLoading(false);
        return;
      }
      
      try {
        const response = await contentfulClient.getEntries({ content_type: 'class' });
        const classList = response.items.map((item: any) => ({
          id: item.sys.id,
          title: item.fields.title || '',
          org: item.fields.org || '',
          modality: item.fields.modality || 'Face-to-Face',
          date: item.fields.date || '',
          time: item.fields.time || '',
          venue: item.fields.venue || '',
          slots: item.fields.slots || 0,
          subtheme: item.fields.subtheme || '',
          image: item.fields.image?.fields?.file?.url ? `https:${item.fields.image.fields.file.url}` : 'https://picsum.photos/seed/leap/400/250',
          description: item.fields.description || '',
          googleFormUrl: item.fields.googleFormUrl || ''
        }));
        setClasses(classList);
      } catch (error) {
        console.error("Contentful Error (Classes):", error);
      } finally {
        setLoading(false);
      }
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
      
      // Strict check: Only allow @dlsu.edu.ph emails
      if (email && !email.endsWith('@dlsu.edu.ph')) {
        await signOut(auth);
        alert("Access Denied: Please use your official @dlsu.edu.ph email address to sign in.");
        return;
      }
    } catch (error) {
      console.error("Sign In Error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const [isAdminView, setIsAdminView] = useState(false);

  const renderClassCard = (item: any, index: number) => (
    <motion.div 
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={() => {
        setViewingClass(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="glass-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-leap-maroon text-white text-xs font-bold rounded-full uppercase tracking-tighter">
            {item.subtheme}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-leap-dark group-hover:text-leap-rust transition-colors leading-tight">
            {item.title}
          </h3>
        </div>
        <p className="text-sm text-leap-olive font-medium mb-4">{item.org}</p>
        
        <div className="space-y-2 mb-6 text-sm text-leap-dark/70">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-leap-rust" />
            <span>{item.date} • {item.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-leap-rust" />
            <span>{item.venue} ({item.modality})</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-leap-rust" />
            <span>Slots: {item.slots}</span>
          </div>
        </div>

        <a 
          href={item.googleFormUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full py-4 rounded-2xl font-bold transition-all active:scale-95 mt-auto bg-leap-dark text-white hover:bg-leap-maroon shadow-lg flex items-center justify-center gap-2"
        >
          Register via Google Forms <ExternalLink size={18} />
        </a>
      </div>
    </motion.div>
  );

  // Admin Dashboard Component
  const AdminDashboard = () => {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setIsAdminView(false)} className="p-2 hover:bg-leap-tan rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-bold text-leap-dark">Admin Dashboard</h2>
        </div>

        <div className="glass-card p-12 rounded-3xl text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-leap-tan/30 rounded-full flex items-center justify-center mx-auto mb-6 text-leap-rust">
            <Edit size={40} />
          </div>
          <h3 className="text-2xl font-bold text-leap-dark mb-4">Classes are managed in Contentful</h3>
          <p className="text-leap-olive mb-8 text-lg">
            To add, edit, or delete classes, please use the Contentful CMS dashboard. The changes will automatically reflect here.
          </p>
          <a 
            href="https://app.contentful.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-leap-rust text-white rounded-full font-bold hover:bg-leap-maroon transition-colors shadow-lg hover:shadow-xl"
          >
            Open Contentful <ExternalLink size={20} />
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-leap-cream">
        <div className="w-12 h-12 border-4 border-leap-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAdminView && userProfile?.role === 'admin') {
    return (
      <ErrorBoundary>
        <AdminDashboard />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-card py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-leap-maroon rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
            <span className="font-bold text-xl tracking-tight text-leap-dark hidden sm:block">LEAP 2026</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium">
            <button onClick={() => { setCurrentView('home'); window.scrollTo(0, 0); }} className={`hover:text-leap-rust transition-colors ${currentView === 'home' ? 'text-leap-rust font-bold' : ''}`}>Home</button>
            <button onClick={() => { setCurrentView('about'); window.scrollTo(0, 0); }} className={`hover:text-leap-rust transition-colors ${currentView === 'about' ? 'text-leap-rust font-bold' : ''}`}>About</button>
            <button onClick={() => { setCurrentView('home'); window.scrollTo(0, document.getElementById('classes')?.offsetTop || 0); }} className="hover:text-leap-rust transition-colors">Classes</button>
            <button onClick={() => { setCurrentView('major-events'); window.scrollTo(0, 0); }} className={`hover:text-leap-rust transition-colors ${currentView === 'major-events' ? 'text-leap-rust font-bold' : ''}`}>Major Events</button>
            <button onClick={() => { setCurrentView('faq'); window.scrollTo(0, 0); }} className={`hover:text-leap-rust transition-colors ${currentView === 'faq' ? 'text-leap-rust font-bold' : ''}`}>FAQs</button>
            {userProfile?.role === 'admin' && (
              <button 
                onClick={() => setIsAdminView(true)}
                className="text-leap-maroon font-bold hover:text-leap-rust transition-colors"
              >
                Admin
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <img src={user.photoURL || ''} alt="Profile" className="w-10 h-10 rounded-full border-2 border-leap-tan shadow-sm" />
                <button 
                  onClick={handleSignOut}
                  className="bg-leap-maroon text-white px-6 py-2 rounded-full hover:bg-leap-rust transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="bg-leap-maroon text-white px-6 py-2 rounded-full hover:bg-leap-rust transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <LogIn size={18} /> Sign In
              </button>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-leap-dark"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-leap-cream pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-bold text-leap-dark">
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left">Home</button>
              <button onClick={() => { setCurrentView('about'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left">About</button>
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.setTimeout(() => window.scrollTo(0, document.getElementById('classes')?.offsetTop || 0), 100); }} className="text-left">Classes</button>
              <button onClick={() => { setCurrentView('major-events'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left">Major Events</button>
              <button onClick={() => { setCurrentView('faq'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left">FAQs</button>
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => {
                    setIsAdminView(true);
                    setIsMenuOpen(false);
                  }}
                  className="text-left"
                >
                  Admin Dashboard
                </button>
              )}
              {user ? (
                <button onClick={handleSignOut} className="bg-leap-maroon text-white py-4 rounded-2xl shadow-xl mt-4 flex items-center justify-center gap-2">
                  <LogOut size={24} /> Sign Out
                </button>
              ) : (
                <button onClick={handleSignIn} className="bg-leap-maroon text-white py-4 rounded-2xl shadow-xl mt-4 flex items-center justify-center gap-2">
                  <LogIn size={24} /> Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentView === 'home' && (
        <>
          {/* Hero Section */}
          <header className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-leap-gold rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-leap-teal rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-leap-maroon/10 text-leap-maroon font-bold text-sm mb-6 uppercase tracking-widest">
              Isang Nayon, Isang Layunin
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-leap-dark leading-tight mb-6">
              LEAP <span className="text-leap-rust">2026</span>
            </h1>
            <p className="text-lg md:text-xl text-leap-olive mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover over 200 unique classes and events. Join your community in a week of alternative learning and growth.
            </p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleSignIn}
                  className="bg-leap-maroon text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-leap-rust transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Sign In with DLSU Account <ChevronRight size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#classes" className="bg-leap-maroon text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-leap-rust transition-all active:scale-95 flex items-center justify-center gap-2">
                  Register Now <ChevronRight size={20} />
                </a>
                <button onClick={() => window.scrollTo(0, document.getElementById('classes')?.offsetTop || 0)} className="bg-white text-leap-dark border-2 border-leap-tan px-10 py-4 rounded-2xl font-bold text-lg hover:bg-leap-cream transition-all active:scale-95">
                  View Schedule
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <section id="classes" className="sticky top-16 z-30 py-4 px-4 bg-leap-cream/90 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-leap-olive" size={20} />
              <input 
                type="text" 
                placeholder="Search classes, subthemes, or organizations..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-leap-tan focus:border-leap-rust outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex items-center gap-2 px-6 py-4 bg-white rounded-2xl border-2 border-leap-tan font-bold text-leap-dark hover:border-leap-rust transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="title-asc">Sort by: Title (A-Z)</option>
                <option value="title-desc">Sort by: Title (Z-A)</option>
                <option value="slots-desc">Sort by: Most Slots</option>
                <option value="slots-asc">Sort by: Fewest Slots</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Class Grid */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        {!user ? (
          <div className="glass-card p-12 rounded-3xl text-center">
            <Info className="mx-auto text-leap-maroon mb-4" size={48} />
            <h3 className="text-2xl font-bold text-leap-dark mb-2">Sign in to see classes</h3>
            <p className="text-leap-olive mb-8">You must be signed in with your DLSU account to view and register for LEAP classes.</p>
            <button 
              onClick={handleSignIn}
              className="bg-leap-maroon text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-leap-rust transition-all active:scale-95"
            >
              Sign In Now
            </button>
          </div>
        ) : viewingClass ? (
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => {
                setViewingClass(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-leap-rust font-bold mb-8 hover:underline"
            >
              <ArrowLeft size={20} /> Back to Classes
            </button>
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="h-80 w-full relative">
                <img src={viewingClass.image} alt={viewingClass.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-4 py-2 bg-leap-maroon text-white text-sm font-bold rounded-full uppercase tracking-tighter shadow-lg">
                    {viewingClass.subtheme}
                  </span>
                </div>
              </div>
              <div className="p-10">
                <h1 className="text-4xl font-bold text-leap-dark mb-4">{viewingClass.title}</h1>
                <p className="text-xl text-leap-olive font-medium mb-8">Organized by {viewingClass.org}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-leap-dark">
                      <div className="w-12 h-12 rounded-full bg-leap-tan/30 flex items-center justify-center text-leap-rust">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-leap-olive font-bold uppercase tracking-wider">Date & Time</p>
                        <p className="font-medium">{viewingClass.date} • {viewingClass.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-leap-dark">
                      <div className="w-12 h-12 rounded-full bg-leap-tan/30 flex items-center justify-center text-leap-rust">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-leap-olive font-bold uppercase tracking-wider">Location</p>
                        <p className="font-medium">{viewingClass.venue} ({viewingClass.modality})</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-leap-dark">
                      <div className="w-12 h-12 rounded-full bg-leap-tan/30 flex items-center justify-center text-leap-rust">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-leap-olive font-bold uppercase tracking-wider">Available Slots</p>
                        <p className="font-medium">{viewingClass.slots} slots</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-leap-dark mb-4">About this class</h3>
                  <p className="text-leap-dark/80 leading-relaxed text-lg">
                    {viewingClass.description || "No description provided for this class."}
                  </p>
                </div>

                <a 
                  href={viewingClass.googleFormUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto inline-flex px-10 py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 bg-leap-rust text-white hover:bg-leap-maroon shadow-xl items-center justify-center gap-3"
                >
                  Register via Google Forms <ExternalLink size={24} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            {selectedDay === null ? (
              // Preview Mode
              <div>
                {Array.from<string>(new Set(filteredAndSortedClasses.map(c => c.date as string)))
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                  .map((date, dayIndex) => {
                    const dayClasses = filteredAndSortedClasses.filter(c => c.date === date);
                    const previewClasses = dayClasses.slice(0, 3);
                    
                    return (
                      <div key={date} className="mb-16">
                        <div className="flex justify-between items-end mb-8">
                          <div>
                            <h2 className="text-3xl font-bold text-leap-dark">Day {dayIndex + 1} - {date}</h2>
                            <p className="text-leap-olive">{dayClasses.length} classes available</p>
                          </div>
                          {dayClasses.length > 3 && (
                            <button 
                              onClick={() => { setSelectedDay(date); setCurrentPage(1); }}
                              className="text-leap-rust font-bold flex items-center gap-1 hover:underline"
                            >
                              See More <ChevronRight size={18} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {previewClasses.map((item, index) => renderClassCard(item, index))}
                        </div>
                      </div>
                    );
                  })}
                  {filteredAndSortedClasses.length === 0 && (
                    <div className="text-center py-12 text-leap-olive">
                      No classes found matching your search.
                    </div>
                  )}
              </div>
            ) : (
              // Detail Mode (Paginated)
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <button 
                    onClick={() => { setSelectedDay(null); setCurrentPage(1); }}
                    className="p-2 hover:bg-leap-tan rounded-full transition-colors"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold text-leap-dark">{selectedDay}</h2>
                    <p className="text-leap-olive">All classes for this day</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {filteredAndSortedClasses
                    .filter(c => c.date === selectedDay)
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((item, index) => renderClassCard(item, index))}
                </div>

                {/* Pagination Controls */}
                {Math.ceil(filteredAndSortedClasses.filter(c => c.date === selectedDay).length / ITEMS_PER_PAGE) > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="px-6 py-3 bg-white border-2 border-leap-tan text-leap-dark rounded-xl font-bold hover:border-leap-rust transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="font-bold text-leap-dark">
                      Page {currentPage} of {Math.ceil(filteredAndSortedClasses.filter(c => c.date === selectedDay).length / ITEMS_PER_PAGE)}
                    </span>
                    <button 
                      disabled={currentPage === Math.ceil(filteredAndSortedClasses.filter(c => c.date === selectedDay).length / ITEMS_PER_PAGE)}
                      onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="px-6 py-3 bg-white border-2 border-leap-tan text-leap-dark rounded-xl font-bold hover:border-leap-rust transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
        </>
      )}

      {currentView === 'about' && <AboutPage />}
      {currentView === 'major-events' && <MajorEventsPage />}
      {currentView === 'faq' && <FAQPage />}
      {currentView === 'contact' && <ContactPage />}

      {/* Footer */}
      <footer className="bg-leap-dark text-leap-cream py-16 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-leap-maroon rounded-full flex items-center justify-center text-white font-bold text-2xl">L</div>
              <span className="font-bold text-2xl tracking-tight">LEAP 2026</span>
            </div>
            <p className="text-leap-cream/60 max-w-md mb-8">
              Lasallian Enrichment Alternative Program. Empowering students through diverse learning experiences and community building.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-leap-maroon transition-colors cursor-pointer">
                <Info size={20} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-leap-cream/60">
              <li><button onClick={() => { setCurrentView('about'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">About LEAP</button></li>
              <li><button onClick={() => { setCurrentView('home'); window.scrollTo(0, document.getElementById('classes')?.offsetTop || 0); }} className="hover:text-white transition-colors">Class List</button></li>
              <li><button onClick={() => { setCurrentView('major-events'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Major Events</button></li>
              <li><button onClick={() => { setCurrentView('faq'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">FAQs</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-leap-cream/60">
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Contact OPS</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Technical Issues</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        
        <div className="container mx-auto mt-16 pt-8 border-t border-white/10 text-center text-leap-cream/40 text-sm">
          <p>© 2026 LEAP Operations Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LeapApp />
    </ErrorBoundary>
  );
}
