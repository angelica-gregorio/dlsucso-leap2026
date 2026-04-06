# App.tsx CSS Modules Refactoring - Step-by-Step Action Items

## Current Status Summary
✅ **COMPLETED (~55%):**
- App.module.css created and imported
- ErrorBoundary component ✅
- SubthemesStrip component ✅  
- MainEventsSection component ✅
- Contact component ✅
- Loading state ✅

⏳ **REMAINING (~45%):**
- renderClassCard function (lines ~860-950)
- AdminDashboard function (lines ~951-967)
- Navigation/Navbar section (lines ~985-1052)
- Mobile menu (lines ~1069-1096)
- Hero section (lines varies)
- Footer (lines ~1165-1210)

---

## STEP 1: Update renderClassCard Function

**Location:** Lines ~860-950  
**Current Issue:** Using inline className strings with Tailwind utilities  
**Task:** Replace with CSS Module classes

### Code Replacement 1.1 - Card Container
**FIND THIS:**
```jsx
  const renderClassCard = (item: typeof classes[0]) => (
    <motion.div className="leap-class-card p-4 md:p-6 flex flex-col"
```

**REPLACE WITH:**
```jsx
  const renderClassCard = (item: typeof classes[0]) => (
    <motion.div className={styles.classCardWrapper}
```

### Code Replacement 1.2 - Card Header Bar
**FIND THIS:**
```jsx
      <div className="card-header-bar bg-gradient-to-r from-leap-maroon to-leap-olive p-3 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={item.org_logo} className="card-org-logo h-6 w-auto"
```

**REPLACE WITH:**
```jsx
      <div className={styles.cardHeaderBar}>
        <div className={styles.cardHeaderLeft}>
          <img src={item.org_logo} className={styles.cardOrgLogo}
```

### Code Replacement 1.3 - Card Badge Section
**FIND THIS:**
```jsx
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fefdf8', opacity: 0.9 }}>
              {item.badge || 'Class'}
            </span>
          </div>
        </div>
      </div>

      <img src={item.image} className="card-image w-full h-48 object-cover"
```

**REPLACE WITH:**
```jsx
          <div className={styles.cardBadgeSection}>
            <span className={styles.cardBadgeText}>
              {item.badge || 'Class'}
            </span>
          </div>
        </div>
      </div>

      <img src={item.image} className={styles.cardImage}
```

### Code Replacement 1.4 - Card Content Section
**FIND THIS:**
```jsx
      <div className="p-5 flex flex-col flex-grow">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#de9a49', marginBottom: '0.35rem' }}>
          {item.org}
        </p>
        <h3 className="text-lg font-bold text-leap-dark leading-tight mb-3"
```

**REPLACE WITH:**
```jsx
      <div className={styles.cardContent}>
        <p className={styles.cardOrgName}>
          {item.org}
        </p>
        <h3 className={styles.cardTitle}
```

### Code Replacement 1.5 - Card Meta Information
**FIND THIS:**
```jsx
        <div className="space-y-1.5 mb-4 text-sm text-leap-dark/60" style={{ fontSize: '0.78rem' }}>
          <div className="flex items-center gap-2"><Calendar size={12} className="text-leap-gold flex-shrink-0" /><span>{item.date} · {item.time}</span></div>
          <div className="flex items-center gap-2"><MapPin size={12} className="text-leap-gold flex-shrink-0" /><span>{item.venue} ({item.modality})</span></div>
        </div>
```

**REPLACE WITH:**
```jsx
        <div className={styles.cardMeta}>
          <div className={styles.cardMetaItem}><Calendar size={12} className={styles.cardMetaIcon} /><span>{item.date} · {item.time}</span></div>
          <div className={styles.cardMetaItem}><MapPin size={12} className={styles.cardMetaIcon} /><span>{item.venue} ({item.modality})</span></div>
        </div>
```

### Code Replacement 1.6 - Card Action Buttons
**FIND THIS:**
```jsx
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
```

**REPLACE WITH:**
```jsx
        <div className={styles.cardActions}>
          <a href={item.googleFormUrl || "#"} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={styles.registerBtn}>
            Register via Google Forms <ExternalLink size={14} />
          </a>
          <button
            onClick={() => { setViewingClass(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={styles.learnMoreBtn}>
            Learn More <ChevronRight size={14} />
          </button>
        </div>
```

---

## STEP 2: Update AdminDashboard Function

**Location:** Lines ~951-967  
**Current Issue:** Using inline Tailwind utility strings  
**Task:** Replace with CSS Module classes

### Code Replacement 2.1 - Full AdminDashboard Component
**FIND THIS:**
```jsx
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
```

**REPLACE WITH:**
```jsx
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
```

---

## STEP 3: Update Navigation (Navbar) Section

**Location:** Lines ~985-1052  
**Current Issue:** Using leap-nav-* custom classes mixed with inline Tailwind  
**Task:** Replace with CSS Module classes

### Code Replacement 3.1 - Main Nav Container
**FIND THIS:**
```jsx
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}>
          <div className="leap-nav-inner">
            <div className="leap-nav-logo">
```

**REPLACE WITH:**
```jsx
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}>
          <div className={styles.navInner}>
            <div className={styles.navLogo}>
```

### Code Replacement 3.2 - Nav Center Links
**FIND THIS:**
```jsx
            <div className="leap-nav-center space-x-2 justify-center hidden sm:flex">
              {['home', 'about', 'major-events', 'faq', 'contact'].map((view: any) => (
                <button key={view} onClick={() => { setCurrentView(view as any); window.scrollTo(0, 0); }} className={`nav-link ${currentView === view ? 'active' : ''}`}>
```

**REPLACE WITH:**
```jsx
            <div className={styles.navCenter}>
              {['home', 'about', 'major-events', 'faq', 'contact'].map((view: any) => (
                <button key={view} onClick={() => { setCurrentView(view as any); window.scrollTo(0, 0); }} className={currentView === view ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
```

### Code Replacement 3.3 - Nav Right Section (Buttons)
**FIND THIS:**
```jsx
          <div className="flex items-center gap-2 md:gap-4">
            {user && !isAdminView && (<button onClick={() => setIsAdminView(true)} className="nav-icon-btn text-sm" title="Admin"><Sparkles size={18} /></button>
            )}
            {user ? (
              <>
                <button className="nav-icon-btn" title="Profile"><User size={15} /></button>
                <button onClick={handleSignOut} className="btn-leap-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.72rem', borderRadius: 6, gap: '0.4rem' }}>
```

**REPLACE WITH:**
```jsx
          <div className={styles.navRight}>
            {user && !isAdminView && (<button onClick={() => setIsAdminView(true)} className={styles.navIconBtn} title="Admin"><Sparkles size={18} /></button>
            )}
            {user ? (
              <>
                <button className={styles.navIconBtn} title="Profile"><User size={15} /></button>
                <button onClick={handleSignOut} className="btn-leap-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.72rem', borderRadius: 6, gap: '0.4rem' }}>
```

### Code Replacement 3.4 - Nav Right Mobile Toggle
**FIND THIS:**
```jsx
            )}
          </div>
          <div className="flex md:hidden" style={{ justifySelf: 'end' }}>
            <button className="p-2" style={{ color: currentView === 'home' && !scrolled ? '#f9ecb6' : '#334b46' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
```

**REPLACE WITH:**
```jsx
            )}
          </div>
          <div className={styles.navMobileToggle}>
            <button className={styles.navMobileBtn} style={{ color: currentView === 'home' && !scrolled ? '#f9ecb6' : '#334b46' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
```

---

## STEP 4: Update Mobile Menu

**Location:** Lines ~1069-1096  
**Current Issue:** Using leap-mobile-menu with inline Tailwind  
**Task:** Replace with CSS Module classes

### Code Replacement 4.1 - Mobile Menu Container
**FIND THIS:**
```jsx
      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-40 leap-mobile-menu pt-24 px-6 md:hidden">
            <div className="flex flex-col gap-6 text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#f9ecb6' }}>
```

**REPLACE WITH:**
```jsx
      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={styles.mobileMenu}>
            <div className={styles.mobileMenuContent}>
```

### Code Replacement 4.2 - Mobile Menu Items
**FIND THIS:**
```jsx
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">Home</button>
              <button onClick={() => { setCurrentView('about'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">Overview</button>
              <button onClick={() => { setCurrentView('major-events'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">Featured</button>
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.setTimeout(() => window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0), 100); }} className="text-left hover:text-leap-yellow transition-colors">Classes</button>
              <button onClick={() => { setCurrentView('faq'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className="text-left hover:text-leap-yellow transition-colors">FAQs</button>
```

**REPLACE WITH:**
```jsx
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className={styles.mobileMenuItem}>Home</button>
              <button onClick={() => { setCurrentView('about'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className={styles.mobileMenuItem}>Overview</button>
              <button onClick={() => { setCurrentView('major-events'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className={styles.mobileMenuItem}>Featured</button>
              <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); window.setTimeout(() => window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0), 100); }} className={styles.mobileMenuItem}>Classes</button>
              <button onClick={() => { setCurrentView('faq'); setIsMenuOpen(false); window.scrollTo(0, 0); }} className={styles.mobileMenuItem}>FAQs</button>
```

---

## STEP 5: Update Footer Section

**Location:** Lines ~1165-1210  
**Current Issue:** Using leap-footer with inline Tailwind utilities  
**Task:** Replace with CSS Module classes

### Code Replacement 5.1 - Footer Main Container
**FIND THIS:**
```jsx
      {/* FOOTER */}
      <footer className="leap-footer text-leap-cream py-16 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
```

**REPLACE WITH:**
```jsx
      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
```

### Code Replacement 5.2 - Footer Links Section
**FIND THIS:**
```jsx
            <ul className="space-y-4 text-leap-cream/60 text-sm">
              <li><button onClick={() => { setCurrentView('about'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">About LEAP</button></li>
              <li><button onClick={() => { setCurrentView('home'); window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0); }} className="hover:text-white transition-colors">Class List</button></li>
              <li><button onClick={() => { setCurrentView('major-events'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Major Events</button></li>
              <li><button onClick={() => { setCurrentView('faq'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">FAQs</button></li>
            </ul>
```

**REPLACE WITH:**
```jsx
            <ul className={styles.footerLinkList}>
              <li><button onClick={() => { setCurrentView('about'); window.scrollTo(0, 0); }} className={styles.footerLink}>About LEAP</button></li>
              <li><button onClick={() => { setCurrentView('home'); window.scrollTo(0, document.getElementById('classes-section')?.offsetTop || 0); }} className={styles.footerLink}>Class List</button></li>
              <li><button onClick={() => { setCurrentView('major-events'); window.scrollTo(0, 0); }} className={styles.footerLink}>Major Events</button></li>
              <li><button onClick={() => { setCurrentView('faq'); window.scrollTo(0, 0); }} className={styles.footerLink}>FAQs</button></li>
            </ul>
```

### Code Replacement 5.3 - Footer Support Links
**FIND THIS:**
```jsx
            <ul className="space-y-4 text-leap-cream/60 text-sm">
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Contact OPS</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Technical Issues</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Privacy Policy</button></li>
            </ul>
```

**REPLACE WITH:**
```jsx
            <ul className={styles.footerLinkList}>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className={styles.footerLink}>Contact OPS</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className={styles.footerLink}>Technical Issues</button></li>
              <li><button onClick={() => { setCurrentView('contact'); window.scrollTo(0, 0); }} className={styles.footerLink}>Privacy Policy</button></li>
            </ul>
```

### Code Replacement 5.4 - Footer Bottom Divider
**FIND THIS:**
```jsx
        <div className="container mx-auto mt-16 pt-8 border-t border-white/10 text-center text-leap-cream/40 text-xs tracking-wide">
          <p>© 2026 LEAP Operations Team · De La Salle University · Central Student Organization</p>
        </div>
```

**REPLACE WITH:**
```jsx
        <div className={styles.footerBottom}>
          <p>© 2026 LEAP Operations Team · De La Salle University · Central Student Organization</p>
        </div>
```

---

## STEP 6: Verify Final Compilation

After making all replacements, run:

```bash
npm run build
```

Expected output: **0 errors, 0 warnings**

If you see errors, check:
1. All className attributes use `${styles.className}` format
2. All className strings are replaced (no remaining Tailwind utility strings)
3. Dynamic inline styles are preserved (colors, widths, heights from variables)

---

## Summary of Changes

| Component | Lines | Classes | Status |
|-----------|-------|---------|--------|
| renderClassCard | ~860-950 | 15+ | ⏳ To do |
| AdminDashboard | ~951-967 | 8 | ⏳ To do |
| Navigation | ~985-1052 | 12+ | ⏳ To do |
| Mobile Menu | ~1069-1096 | 8 | ⏳ To do |
| Footer | ~1165-1210 | 12+ | ⏳ To do |
| **TOTAL** | **~500 lines** | **~55** | **⏳ To do** |

Each replacement is straightforward and follows the same pattern. After completing these 5 steps, App.tsx will be fully refactored to use CSS Modules instead of inline Tailwind utilities.
