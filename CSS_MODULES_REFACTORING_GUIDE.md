# CSS Modules Refactoring Guide for App.tsx

## Overview
The App.tsx component has been partially refactored to use CSS Modules (`App.module.css`). This guide shows the pattern and provides instructions for completing the refactoring.

## What's Been Done ✅

### 1. Created `App.module.css`
A comprehensive CSS Module file containing all extractable Tailwind utility classes converted using `@apply` directives.

### 2. Partially Refactored Sections
The following components have been updated to use the CSS Module:
- `Contact` component - All className attributes now use `styles.*`
- `SubthemesStrip` component - All className attributes now use `styles.*`
- `MainEventsSection` component - All className attributes now use `styles.*`
- Loading state - Uses CSS Module classes
- ErrorBoundary - Uses CSS Module classes

## Refactoring Pattern

### Pattern 1: Simple Single Class
**Before:**
```jsx
<div className="page-hero">Content</div>
```

**After:**
```jsx
<div className={styles.pageHero}>Content</div>
```

### Pattern 2: Conditional Classes
**Before:**
```jsx
<div className={`subtheme-pill ${activeTheme === null ? 'active' : ''}`}>
```

**After:**
```jsx
<div className={`${styles.subthemePill} ${activeTheme === null ? 'active' : ''}`}>
```

### Pattern 3: Multiple Classes
**Before:**
```jsx
<button className="btn-leap-primary px-8 py-3 rounded-2xl font-bold shadow-lg">
```

**After:**
```jsx
<button className={styles.errorButton}>
```
(All classes combined into a single CSS Module class name)

### Pattern 4: Keep Dynamic Inline Styles
Dynamic styles that depend on runtime values should **remain as inline styles**:

```jsx
// KEEP inline styles for dynamic values
<div style={{ 
  background: ev.accent,  // Dynamic color from data
  height: `${pct * 100}%`, // Dynamic from state
  width: `${f.size}px`  // Dynamic from calculation
}}>
```

## Remaining Sections to Refactor

### 1. AdminDashboard Component
Lines ~921-934

**Current:**
```jsx
<div className="container mx-auto px-4 py-12">
  <div className="flex items-center gap-4 mb-8">
    <button className="p-2 hover:bg-leap-tan/30 rounded-full transition-colors">
    <h2 className="text-3xl font-bold text-leap-dark">
```

**Update to:**
```jsx
<div className={styles.adminWrapper}>
  <div className={styles.adminHeader}>
    <button className={styles.adminBackBtn}>
    <h2 className={styles.adminTitle}>
```

### 2. Main Navigation Section
Lines ~988-1042

**Update pattern:**
```jsx
// Current
<nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}>
  <div className="leap-nav-inner">
    <div className="leap-nav-logo">

// Should become
<nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}>
  <div className={styles.navInner}>
    <div className={styles.navLogo}>
```

### 3. Mobile Menu
Lines ~1053-1080

**Update to:**
```jsx
<motion.div className={styles.mobileMenu}>
  <div className={styles.mobileMenuContent}>
```

### 4. Hero Section
Lines ~1082-1136

**Key replacements:**
```jsx
// Before
<header className="relative overflow-hidden hero-bg">
  <img className="leap-logo-hero" />
  <span className="leap-eyebrow">
  <h1 className="leap-title">
  
// After
<header className={`relative overflow-hidden hero-bg`}>
  <img className={styles.heroLogo} />
  <span className={styles.heroEyebrow}>
  <h1 className={styles.heroTitle}>
```

### 5. Footer Section
Lines ~1165-1205

**Update to:**
```jsx
<footer className={styles.footer}>
  <div className={styles.footerContainer}>
    // ... update all footer elements
```

### 6. Main App Component Return
Lines ~1138-1165

**Update to:**
```jsx
return (
  <div className={styles.appContainer}>
    <nav className={`${navClass}`}>
      <div className={styles.navInner}>
        // ... etc
```

## CSS Mapping Reference

### Available Class Mappings
All of these are defined in `App.module.css` and ready to use:

**Layout:**
- `styles.appContainer` → "min-h-screen flex flex-col"
- `styles.errorContainer` → "min-h-screen flex items-center justify-center bg-leap-cream p-6"
- `styles.errorCard` → "leap-info-card p-8 rounded-3xl max-w-md text-center"

**Navigation:**
- `styles.navBar` → "fixed top-0 w-full z-50 transition-all duration-300"
- `styles.navInner` → "leap-nav-inner"
- `styles.navLink` → "nav-link"
- `styles.navLinkActive` → "nav-link active"
- `styles.mobileMenu` → "fixed inset-0..."
- `styles.mobileMenuContent` → "flex flex-col gap-6 text-2xl font-bold"

**Footer:**
- `styles.footer` → "leap-footer text-leap-cream py-16 px-4"
- `styles.footerContainer` → "container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12"
- `styles.footerLink` → "hover:text-white transition-colors"

**Contact & Forms:**
- `styles.contactMain` → "flex-grow"
- `styles.pageHero` → "page-hero (with padding)"
- `styles.pageHeroTitle` → "page-hero-title"
- `styles.pageHeroSubtitle` → "page-hero-subtitle"
- `styles.contactCard` → "contact-card"
- `styles.contactInput` → "contact-input"
- `styles.contactLabel` → "contact-label"

## Find & Replace Suggestions

Use your IDE's Find & Replace feature with these patterns:

### 1. Replace navbar classes
Find: `className="leap-nav`
Replace with: `className={`${styles.navLink}`

### 2. Replace footer classes
Find: `className="leap-footer`
Replace with: `className={styles.footer}`

### 3. Replace form classes
Find: `className="contact-`
Replace with: `className={styles.contact`

## Important Notes

### DO NOT move these to CSS Modules
These must remain as inline styles because they're dynamic:
- Width/height with variables: `width: `${pct * 100}%``
- Colors from data: `background: ev.accent`
- Computed font sizes: `fontSize: 'clamp(...)'`
- Transform with variables: `transform: 'translate(...)'`
- Animation delays: `animationDelay: `${f.delay}s``

### Preserve Lucide Icon className
Icon classes from lucide-react should remain as manual classes:
```jsx
<AlertCircle className="mx-auto text-leap-maroon mb-4" />
```

## Testing After Refactoring

1. **Visual Regression Testing:**
   - Check all pages render with same styling
   - Test responsive behavior (mobile/tablet/desktop)
   - Verify hover/active states

2. **Functional Testing:**
   - Test all navigation links
   - Test form submissions
   - Test responsive menu behavior
   - Verify animations work correctly

3. **Performance:**
   - Check that CSS modules are properly tree-shaken by bundler
   - Verify CSS file size is reasonable

## Tools That Can Help

### VS Code Find & Replace Regex
```
Find: className="([a-z-]+)"
Replace: className={styles.$1}
```
(Then manually check and adjust for camelCase conversion)

### CSS Module Naming Conversion
When you have a className like `"leap-nav-inner"`, convert to camelCase: `leapNavInner` in the CSS Module.

Example conversions already in `App.module.css`:
- `page-hero` → `pageHero`
- `contact-card` → `contactCard`
- `main-events-title` → `mainEventsTitle`
- `leap-class-card` → `classCardWrapper`

## Summary

- ✅ CSS Module created with comprehensive style definitions
- ✅ Contact, SubthemesStrip, MainEventsSection components refactored
- ✅ Loading and error states refactored
- ⏳ Remaining sections (~50% of className attributes) follow the pattern above

Follow the refactoring pattern shown in completed sections to update the remaining ~700 lines of className attributes. Most replacements are straightforward 1:1 mappings using the style object.

## Questions?

If a className doesn't have a corresponding entry in `App.module.css`, you can:
1. Add the className to `App.module.css` using `@apply` directive
2. Or keep it as a string className if it's a custom class that's defined elsewhere

For custom classes like `"leap-spinner"`, keep them as strings since they're likely defined in global CSS files.
