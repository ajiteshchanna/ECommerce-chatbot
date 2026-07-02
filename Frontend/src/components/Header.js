import { state } from '../services/state.js';

/**
 * setupHeaderEvents — FE-007 Recovery Fix
 *
 * WHY THIS EXISTS:
 * renderHeader() returns an HTML string injected via element.innerHTML.
 * Browsers DO NOT execute <script> tags found inside innerHTML assignments
 * (HTML5 spec, Section 8.4.5 — scripts marked "already started").
 *
 * This function MUST be called immediately after any page sets innerHTML
 * that includes renderHeader(). It wires:
 *   - Mobile hamburger button open/close
 *   - Overlay click-to-close
 *   - window.closeMobileNav (called by mobile nav link onclick attributes)
 *   - window.spideyChat   (called by AI Stylist nav button)
 */
export function setupHeaderEvents() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('mobileNavOverlay');
  const drawer  = document.getElementById('mobileNavDrawer');

  // Define as window globals so inline onclick attributes can call them
  window.closeMobileNav = function() {
    drawer  && drawer.classList.remove('open');
    overlay && overlay.classList.remove('open');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
  };

  window.spideyChat = function() {
    const toggle = document.getElementById('chatToggle');
    if (toggle) toggle.click();
  };

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isOpen = drawer && drawer.classList.contains('open');
      if (isOpen) {
        window.closeMobileNav();
      } else {
        drawer  && drawer.classList.add('open');
        overlay && overlay.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', window.closeMobileNav);
  }
}

/**
 * Spidey Store Header — UI-006, UI-022
 * Glassmorphism navbar with Spider-Man branding, full nav, search, icons, mobile drawer.
 * PRESERVED: handleCatClick onclick handlers, cartBtn ID, cart badge logic.
 */
export function renderHeader() {
  const { cartItemCount, currentCategory } = state;

  return `
  <header class="header">
    <div class="container header-inner">

      <!-- Logo -->
      <div class="header-logo" onclick="window.location.hash='#/'" role="button" tabindex="0" aria-label="Go to homepage">
        <svg class="logo-icon" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="30" cy="30" r="29" fill="url(#spiderGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <!-- Spider eyes -->
          <ellipse cx="19" cy="26" rx="9" ry="7" fill="white" transform="rotate(-15 19 26)"/>
          <ellipse cx="41" cy="26" rx="9" ry="7" fill="white" transform="rotate(15 41 26)"/>
          <!-- Web lines -->
          <line x1="30" y1="1" x2="30" y2="59" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
          <line x1="1" y1="30" x2="59" y2="30" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
          <line x1="8" y1="8" x2="52" y2="52" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
          <line x1="52" y1="8" x2="8" y2="52" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
          <!-- Concentric web circles -->
          <circle cx="30" cy="30" r="10" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
          <circle cx="30" cy="30" r="20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
          <defs>
            <radialGradient id="spiderGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#FF4444"/>
              <stop offset="100%" stop-color="#8B0000"/>
            </radialGradient>
          </defs>
        </svg>
        <div class="logo-text">
          <span class="logo-title">SPIDEY</span>
          <span class="logo-sub">STORE</span>
        </div>
      </div>

      <!-- Desktop Navigation -->
      <nav class="nav" aria-label="Main navigation">
        <button class="nav-link ${currentCategory === '' ? 'active' : ''}" onclick="handleCatClick('')" id="navAll">Home</button>
        <button class="nav-link ${currentCategory === 'men' ? 'active' : ''}" onclick="handleCatClick('men')" id="navMen">Men</button>
        <button class="nav-link ${currentCategory === 'women' ? 'active' : ''}" onclick="handleCatClick('women')" id="navWomen">Women</button>
        <button class="nav-link ${currentCategory === 'kids' ? 'active' : ''}" onclick="handleCatClick('kids')" id="navKids">Kids</button>
        <button class="nav-link" onclick="window.spideyChat && window.spideyChat()" id="navAiStylist">
          AI Stylist
          <span class="nav-badge">NEW</span>
        </button>
      </nav>

      <!-- Search Bar -->
      <div class="header-search" role="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search products..." aria-label="Search products" id="headerSearch" />
      </div>

      <!-- Header Right Actions -->
      <div class="header-right">
        <!-- Cart -->
        <button class="icon-btn relative" id="cartBtn" onclick="window.location.hash='#/cart'" aria-label="Shopping cart" title="Cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          ${cartItemCount > 0 ? `<span class="cart-badge" aria-label="${cartItemCount} items in cart">${cartItemCount}</span>` : ''}
        </button>

        <!-- User Avatar -->
        <div class="user-avatar" id="userAvatar" role="button" aria-label="User account" tabindex="0" title="Account">G</div>

        <!-- Mobile Hamburger -->
        <button class="menu-btn" id="mobileMenuBtn" aria-label="Open navigation menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Nav Overlay -->
  <div class="mobile-nav-overlay" id="mobileNavOverlay" role="presentation"></div>

  <!-- Mobile Nav Drawer -->
  <nav class="mobile-nav-drawer" id="mobileNavDrawer" aria-label="Mobile navigation">
    <div class="header-logo" style="margin-bottom: 8px;">
      <svg class="logo-icon" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="30" cy="30" r="29" fill="url(#spiderGrad2)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <ellipse cx="19" cy="26" rx="9" ry="7" fill="white" transform="rotate(-15 19 26)"/>
        <ellipse cx="41" cy="26" rx="9" ry="7" fill="white" transform="rotate(15 41 26)"/>
        <defs>
          <radialGradient id="spiderGrad2" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FF4444"/><stop offset="100%" stop-color="#8B0000"/>
          </radialGradient>
        </defs>
      </svg>
      <div class="logo-text">
        <span class="logo-title">SPIDEY</span>
        <span class="logo-sub">STORE</span>
      </div>
    </div>

    <div class="mobile-nav-links">
      <button class="mobile-nav-link ${currentCategory === '' ? 'active' : ''}" onclick="handleCatClick(''); window.closeMobileNav && window.closeMobileNav()">🏠 Home</button>
      <button class="mobile-nav-link ${currentCategory === 'men' ? 'active' : ''}" onclick="handleCatClick('men'); window.closeMobileNav && window.closeMobileNav()">👔 Men</button>
      <button class="mobile-nav-link ${currentCategory === 'women' ? 'active' : ''}" onclick="handleCatClick('women'); window.closeMobileNav && window.closeMobileNav()">👗 Women</button>
      <button class="mobile-nav-link ${currentCategory === 'kids' ? 'active' : ''}" onclick="handleCatClick('kids'); window.closeMobileNav && window.closeMobileNav()">🧒 Kids</button>
      <button class="mobile-nav-link" onclick="window.location.hash='#/cart'; window.closeMobileNav && window.closeMobileNav()">🛒 Cart ${cartItemCount > 0 ? `(${cartItemCount})` : ''}</button>
    </div>
  </nav>

`;
}
