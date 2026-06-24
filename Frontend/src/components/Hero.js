/**
 * Spidey Store Hero Section — UI-007
 * Cinematic full-viewport dark hero with Spider-Man themed visuals,
 * animated headline, stats counters, and CTA buttons.
 */
export function renderHero() {
  return `
  <section class="hero" aria-label="Hero banner">

    <!-- Spider Web SVG Decoration (background) -->
    <svg class="hero-web-decoration" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <!-- Radial web lines -->
      <line x1="300" y1="0"   x2="300" y2="800" stroke="white" stroke-width="0.8"/>
      <line x1="0"   y1="400" x2="600" y2="400" stroke="white" stroke-width="0.8"/>
      <line x1="0"   y1="0"   x2="600" y2="800" stroke="white" stroke-width="0.8"/>
      <line x1="600" y1="0"   x2="0"   y2="800" stroke="white" stroke-width="0.8"/>
      <line x1="150" y1="0"   x2="450" y2="800" stroke="white" stroke-width="0.5"/>
      <line x1="450" y1="0"   x2="150" y2="800" stroke="white" stroke-width="0.5"/>
      <line x1="0"   y1="200" x2="600" y2="600" stroke="white" stroke-width="0.5"/>
      <line x1="0"   y1="600" x2="600" y2="200" stroke="white" stroke-width="0.5"/>
      <!-- Concentric circles -->
      <circle cx="300" cy="400" r="80"  fill="none" stroke="white" stroke-width="0.8"/>
      <circle cx="300" cy="400" r="160" fill="none" stroke="white" stroke-width="0.8"/>
      <circle cx="300" cy="400" r="240" fill="none" stroke="white" stroke-width="0.7"/>
      <circle cx="300" cy="400" r="320" fill="none" stroke="white" stroke-width="0.6"/>
      <circle cx="300" cy="400" r="400" fill="none" stroke="white" stroke-width="0.5"/>
      <circle cx="300" cy="400" r="500" fill="none" stroke="white" stroke-width="0.4"/>
    </svg>

    <div class="container hero-grid">

      <!-- Left: Text Content -->
      <div class="hero-content">

        <!-- Badge -->
        <div class="hero-badge" aria-label="New Collection">
          🕷️ &nbsp;New Collection 2026
        </div>

        <!-- Main Title -->
        <h1 class="hero-title" id="heroTitle">
          Elevate Your Style with
          <span class="highlight" id="heroHighlight">Web&#8209;Slinger</span>
          Fashion
        </h1>

        <!-- Description -->
        <p class="hero-desc">
          Discover curated collections powered by your personal AI fashion companion.
          Shop smarter, dress bolder — with <strong style="color: var(--spider-red);">Spidey AI</strong> guiding every pick.
        </p>

        <!-- CTAs -->
        <div class="hero-actions">
          <button class="btn btn-spider" onclick="document.querySelector('.products-section')?.scrollIntoView({behavior:'smooth'})" id="heroShopBtn">
            🛍️ Shop Now
          </button>
          <button class="btn btn-ghost" onclick="document.getElementById('chatToggle')?.click()" id="heroAIBtn">
            🤖 Ask Spidey AI
          </button>
        </div>

        <!-- Stats -->
        <div class="hero-stats" role="list">
          <div class="hero-stat" role="listitem">
            <div class="hero-stat-value" id="statProducts">500+</div>
            <div class="hero-stat-label">Premium Products</div>
          </div>
          <div class="hero-stat" role="listitem">
            <div class="hero-stat-value" id="statCustomers">50K+</div>
            <div class="hero-stat-label">Happy Customers</div>
          </div>
          <div class="hero-stat" role="listitem">
            <div class="hero-stat-value" id="statRating">4.9 ⭐</div>
            <div class="hero-stat-label">Average Rating</div>
          </div>
        </div>

      </div>

      <!-- Right: Visual Card -->
      <div class="hero-visual" aria-hidden="true">
        <div class="hero-visual-card">
          <img
            src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Fashion collection"
            loading="eager"
          />
          <div class="hero-visual-tag">
            <div class="glass-card" style="padding: 16px; display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--gradient-spider); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">🕷️</div>
              <div>
                <div style="font-size: 0.8rem; font-weight: 600; color: white;">Spidey AI recommends</div>
                <div style="font-size: 0.72rem; color: rgba(255,255,255,0.6); margin-top: 2px;">"Perfect for your next occasion ✨"</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating badges -->
        <div style="position: absolute; top: 20px; left: -20px; background: var(--gradient-spider); color: white; padding: 8px 16px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; box-shadow: var(--shadow-glow-red-sm); animation: fadeInUp 0.8s ease 0.5s both;">
          🔥 Trending Now
        </div>
        <div style="position: absolute; bottom: 120px; right: -16px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color: #22c55e; padding: 8px 16px; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; backdrop-filter: blur(8px); animation: fadeInUp 0.8s ease 0.7s both;">
          ✅ AI Curated
        </div>
      </div>

    </div>

    <!-- Hero scroll indicator -->
    <div style="position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-subtle); font-size: 0.72rem; animation: fadeIn 1s ease 1s both;" aria-hidden="true">
      <span>Scroll to explore</span>
      <div style="width: 1px; height: 32px; background: linear-gradient(to bottom, var(--spider-red), transparent);"></div>
    </div>

  </section>
`;
}
