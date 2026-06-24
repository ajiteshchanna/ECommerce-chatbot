import { state } from '../services/state.js';
import { fetchProducts, sendChatMessage, addToCart } from '../services/api_v2.js';
import { renderHeader, setupHeaderEvents } from '../components/Header.js';
import { renderHero } from '../components/Hero.js';
import { renderChatbot } from '../components/Chatbot.js';
import { navigate } from '../router.js';

/**
 * Spidey Store Home Page — UI-015, UI-016, UI-019, UI-021
 *
 * PRESERVED:
 *   - All event handler logic (product click, add-to-cart, price filter, chat)
 *   - data-id on product cards
 *   - .add-to-cart-btn class
 *   - #chatToggle, #chatSend, #chatInput element IDs
 *   - .product-recommendation[data-id] class and attribute
 *   - window.handleCatClick global function
 */

// Price range options shown in the filter bar
const PRICE_RANGES = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₹500',  min: null, max: 500 },
  { label: '₹500–₹1000',  min: 500,  max: 1000 },
  { label: '₹1000–₹2000', min: 1000, max: 2000 },
  { label: '₹2000–₹5000', min: 2000, max: 5000 },
  { label: 'Above ₹5000', min: 5000, max: null },
];

export async function renderHome() {
  const { min, max } = state.priceFilter;

  // Show skeleton while loading
  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    ${renderHero()}
    <main class="products-section" id="productsSection">
      <div class="section-header">
        <h2 class="section-title">Our Products</h2>
        <div class="section-accent"></div>
      </div>

      <!-- Category Filter Chips -->
      <div class="filter-bar" id="category-filter-container" role="group" aria-label="Filter by category">
        ${['', 'men', 'women', 'kids'].map(cat => {
          const labels = { '': '🏠 All', 'men': '👔 Men', 'women': '👗 Women', 'kids': '🧒 Kids' };
          const isActive = state.currentCategory === cat;
          return `<button class="filter-chip ${isActive ? 'active' : ''}" data-cat="${cat}" aria-pressed="${isActive}">${labels[cat]}</button>`;
        }).join('')}
      </div>

      <!-- Price Range Filter -->
      <div class="price-filter-bar" id="price-filter-container" role="group" aria-label="Filter by price">
        ${PRICE_RANGES.map((r) => {
          const isActive = state.priceFilter.min === r.min && state.priceFilter.max === r.max;
          return `<button
            class="price-filter-btn ${isActive ? 'active' : ''}"
            data-min="${r.min ?? ''}"
            data-max="${r.max ?? ''}"
            aria-pressed="${isActive}"
          >${r.label}</button>`;
        }).join('')}
      </div>

      <!-- Product Grid (skeleton loading state) -->
      <div class="products-grid" id="productsGrid" role="list" aria-label="Product listings">
        ${[...Array(8)].map(() => `<div class="skeleton skeleton-card" role="listitem"></div>`).join('')}
      </div>
    </main>
    ${renderChatbot()}
  `;

  setupHomeEvents();

  // Fetch products
  const data = await fetchProducts(state.currentCategory, min, max);
  state.products = data;

  // Replace skeleton with real products
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (state.products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" role="listitem">
        <div class="empty-state-icon">🕷️</div>
        <div class="empty-state-title">No products found</div>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try a different category or price range.</p>
      </div>
    `;
  } else {
    grid.innerHTML = state.products.map(p => `
      <div class="product-card" data-id="${p.id}" role="listitem" tabindex="0" aria-label="${p.name}, ₹${p.price}">
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
            <span style="font-size: 0.72rem; color: var(--text-subtle);">⭐ 4.${Math.floor(Math.random()*5)+4}</span>
          </div>
          <button class="add-to-cart-btn" data-id="${p.id}" aria-label="Add ${p.name} to cart">🛒 Add to Cart</button>
        </div>
      </div>
    `).join('');

    // Re-attach product click events after content update
    attachProductEvents();
  }
}

/** Called by navbar buttons (both desktop and mobile) and inline onclick attributes */
window.handleCatClick = async function(cat) {
  state.currentCategory = cat;
  state.priceFilter = { min: null, max: null }; // reset price filter on category change
  renderHome();
};

function setupHomeEvents() {
  // FE-007: Wire header (mobile nav, window globals) — must be first
  setupHeaderEvents();

  // Highlight active nav button
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().trim() === (state.currentCategory || 'home').toLowerCase()) {
      btn.classList.add('active');
    }
  });

  // Category filter chips
  document.querySelectorAll('#category-filter-container .filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      state.currentCategory = cat;
      state.priceFilter = { min: null, max: null };
      renderHome();
    });
  });

  // Price filter buttons
  document.querySelectorAll('#price-filter-container .price-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const min = btn.dataset.min !== '' ? Number(btn.dataset.min) : null;
      const max = btn.dataset.max !== '' ? Number(btn.dataset.max) : null;
      state.priceFilter = { min, max };
      renderHome();
    });
  });

  // Chatbot toggle
  document.getElementById('chatToggle')?.addEventListener('click', () => {
    state.chatOpen = !state.chatOpen;
    renderHome();
  });

  document.getElementById('chatSend')?.addEventListener('click', handleChatSend);
  document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSend();
  });

  document.querySelectorAll('.product-recommendation').forEach(el => {
    el.addEventListener('click', () => navigate(`#/product/${el.dataset.id}`));
  });

  // FE-007: Wire quick-action chips (moved from dead Chatbot.js <script> block)
  document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input  = document.getElementById('chatInput');
      const sendBtn = document.getElementById('chatSend');
      if (input && sendBtn) {
        input.value = chip.dataset.chipMsg || '';
        sendBtn.click();
      }
    });
  });

  // FE-007: Auto-scroll chat to bottom (moved from dead Chatbot.js <script> block)
  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function attachProductEvents() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      if (e.target.classList.contains('add-to-cart-btn')) {
        e.stopPropagation();

        try {
          const product = state.products.find(p => p.id === card.dataset.id || String(p.id) === card.dataset.id) || { name: 'Unknown Product' };
          const btn = e.target;
          btn.disabled = true;
          btn.textContent = '⏳ Adding...';

          await addToCart(state.sessionId, product.name, 1);

          state.cartItemCount++;
          btn.textContent = '✅ Added!';
          btn.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(22,163,74,0.3))';
          btn.style.borderColor = '#22c55e';
          btn.style.color = '#22c55e';

          setTimeout(() => {
            renderHome();
          }, 1200);
        } catch (err) {
          console.error('Failed to add to cart:', err);
          alert('Failed to add to cart.');
          e.target.disabled = false;
          e.target.textContent = '🛒 Add to Cart';
        }
      } else {
        navigate(`#/product/${card.dataset.id}`);
      }
    });

    // Keyboard support
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.target.classList.contains('add-to-cart-btn')) {
        navigate(`#/product/${card.dataset.id}`);
      }
    });
  });
}

async function handleChatSend() {
  const input = document.getElementById('chatInput');
  state.chatInput = input ? input.value : '';
  if (!state.chatInput.trim()) return;

  const userMsg = state.chatInput;
  state.chatMessages = [...state.chatMessages, { sender: 'user', text: userMsg }];
  state.chatLoading = true;
  state.chatInput = '';
  renderHome();

  try {
    const data = await sendChatMessage(userMsg, state.sessionId);
    state.chatMessages = [...state.chatMessages, {
      sender: 'bot',
      type: data.type,
      data: data.data,
      message: data.message
    }];
  } catch (err) {
    console.error(err);
    state.chatMessages = [...state.chatMessages, {
      sender: 'bot',
      type: 'text',
      message: 'Sorry, web-slinger! 🕷️ Something went wrong. Please try again!'
    }];
  } finally {
    state.chatLoading = false;
    renderHome();
  }
}
