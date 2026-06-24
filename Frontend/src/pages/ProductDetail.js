import { state } from '../services/state.js';
import { fetchProducts, addToCart, placeOrder, fetchRecommendations } from '../services/api_v2.js';
import { renderHeader, setupHeaderEvents } from '../components/Header.js';

/**
 * Spidey Store Product Detail Page — UI-017
 *
 * PRESERVED element IDs: #backBtn, #btnAddToCart, #btnBuyNow
 * PRESERVED: all addToCart + placeOrder API calls
 */
export async function renderProductDetail(id) {
  // Loading state
  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <main class="product-detail">
      <div style="display:flex; align-items:center; justify-content:center; height:60vh; flex-direction:column; gap:16px;">
        <div class="spider-loader"></div>
        <p style="color:var(--text-muted); font-size:0.9rem;">Loading product...</p>
      </div>
    </main>
  `;

  // FE-007: Wire header events (mobile nav) on ProductDetail page
  setupHeaderEvents();

  const data = await fetchProducts();
  const product = data.find(p => p.id === id);

  if (!product) {
    document.getElementById('app').innerHTML = `
      ${renderHeader()}
      <main class="product-detail">
        <div style="text-align:center; padding:80px 20px;">
          <div style="font-size:4rem; margin-bottom:16px;">🕷️</div>
          <h2 style="color:var(--text-primary); margin-bottom:8px;">Product not found</h2>
          <p style="color:var(--text-muted); margin-bottom:24px;">This web-thread seems to be broken!</p>
          <button class="btn btn-spider" onclick="window.location.hash='#/'">← Back to Store</button>
        </div>
      </main>
    `;
    return;
  }

  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <main class="product-detail" style="animation: fadeInUp 0.5s ease both;">
      <button class="back-btn" id="backBtn" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Products
      </button>

      <div class="product-detail-grid">

        <!-- Product Image -->
        <div class="product-detail-image" aria-label="${product.name} image">
          <img
            src="${product.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800'}"
            alt="${product.name}"
            loading="eager"
          />
        </div>

        <!-- Product Info Panel -->
        <div class="product-detail-info">
          <span class="product-detail-category">${product.category}</span>
          <h1>${product.name}</h1>
          <div class="product-detail-price">₹${product.price.toLocaleString('en-IN')}</div>
          <p class="product-detail-desc">${product.description}</p>

          <!-- Star Rating (visual) -->
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid var(--glass-border);">
            <div style="color:#FFD700; font-size:1rem; letter-spacing:1px;">★★★★★</div>
            <span style="font-size:0.82rem; color:var(--text-muted);">4.9 · 2.4K reviews</span>
          </div>

          ${product.size && product.size.length > 0 ? `
            <div class="option-group">
              <span class="option-label">Select Size</span>
              <div class="option-values" role="group" aria-label="Size options">
                ${product.size.map(s => `
                  <button class="option-value" onclick="this.parentElement.querySelectorAll('.option-value').forEach(b=>b.style.cssText='');this.style.cssText='background:rgba(230,51,41,0.15);border-color:var(--spider-red);color:var(--spider-red);'" aria-pressed="false">${s}</button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${product.color && product.color.length > 0 ? `
            <div class="option-group">
              <span class="option-label">Color</span>
              <div class="option-values" role="group" aria-label="Color options">
                ${(Array.isArray(product.color) ? product.color : [product.color]).map(c => `
                  <button class="option-value" onclick="this.parentElement.querySelectorAll('.option-value').forEach(b=>b.style.cssText='');this.style.cssText='background:rgba(230,51,41,0.15);border-color:var(--spider-red);color:var(--spider-red);'" aria-pressed="false">${c}</button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="detail-actions">
            <button class="detail-btn detail-btn-primary" id="btnAddToCart" aria-label="Add to cart">
              🛒 Add to Cart
            </button>
            <button class="detail-btn detail-btn-secondary" id="btnBuyNow" aria-label="Buy now">
              ⚡ Buy Now
            </button>
          </div>

          <!-- Trust Badges -->
          <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:24px; padding-top:20px; border-top:1px solid var(--glass-border);">
            <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-muted);">
              🚚 Free Delivery
            </div>
            <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-muted);">
              🔄 Easy Returns
            </div>
            <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-muted);">
              🔒 Secure Payment
            </div>
          </div>
        </div>

      </div>
    </main>
  `;

  document.getElementById('backBtn')?.addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('btnAddToCart')?.addEventListener('click', async (e) => {
    try {
      const btn = e.target;
      btn.disabled = true;
      btn.textContent = '⏳ Adding...';

      await addToCart(state.sessionId, product.name, 1);

      state.cartItemCount++;
      btn.textContent = '✅ Added to Cart!';
      btn.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(22,163,74,0.3))';
      btn.style.border = '1px solid #22c55e';
      btn.style.color = '#22c55e';

      setTimeout(() => {
        btn.textContent = '🛒 Add to Cart';
        btn.style.background = '';
        btn.style.border = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to add to cart');
      e.target.disabled = false;
      e.target.textContent = '🛒 Add to Cart';
    }
  });

  document.getElementById('btnBuyNow')?.addEventListener('click', async (e) => {
    try {
      const btn = e.target;
      btn.disabled = true;
      btn.textContent = '⏳ Processing...';

      await placeOrder(state.sessionId, product.name, 1);

      btn.textContent = '🚀 Order Placed!';
      btn.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(22,163,74,0.3))';
      btn.style.border = '1px solid #22c55e';
      btn.style.color = '#22c55e';

      setTimeout(() => {
        window.location.hash = '#/';
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to place order');
      e.target.disabled = false;
      e.target.textContent = '⚡ Buy Now';
    }
  });

  // ── Recommendations Section ──────────────────────────────────────────────
  // Fetch GET /products/{id}/recommendations from backend and render cards.
  try {
    const recs = await fetchRecommendations(id);
    const main = document.querySelector('.product-detail');
    if (main && recs) {
      const allRecs = [
        ...(recs.similar  || []).slice(0, 4),
        ...(recs.cheaper  || []).slice(0, 2),
        ...(recs.premium  || []).slice(0, 2),
      ].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i).slice(0, 6);

      if (allRecs.length > 0) {
        const section = document.createElement('section');
        section.style.cssText = 'padding: 48px 24px; max-width: 1200px; margin: 0 auto;';
        section.innerHTML = `
          <div class="section-header" style="margin-bottom: 32px;">
            <h2 class="section-title">You May Also Like</h2>
            <div class="section-accent"></div>
          </div>
          <div class="products-grid" role="list" aria-label="Recommended products">
            ${allRecs.map(p => `
              <div class="product-card" data-id="${p.id}" role="listitem" tabindex="0"
                   aria-label="${p.name}, ₹${p.price}"
                   onclick="window.location.hash='#/product/${p.id}'">
                <div class="product-image">
                  ${p.image_url
                    ? `<img src="${p.image_url}" alt="${p.name}" loading="lazy" />`
                    : `<div class="product-placeholder">🛍️ No Image</div>`}
                  <div class="product-category-badge">${p.category}</div>
                </div>
                <div class="product-info">
                  <h3 class="product-name">${p.name}</h3>
                  <p class="product-desc">${p.description}</p>
                  <div class="product-footer">
                    <span class="product-price">₹${p.price}</span>
                    ${p.recommendation_reasons && p.recommendation_reasons.length > 0
                      ? `<span style="font-size:0.68rem; color:var(--spider-red); font-weight:600;">${p.recommendation_reasons[0]}</span>`
                      : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        main.appendChild(section);
      }
    }
  } catch (err) {
    // Recommendations are non-critical — fail silently
    console.warn('[ProductDetail] Recommendations fetch failed:', err);
  }
}
