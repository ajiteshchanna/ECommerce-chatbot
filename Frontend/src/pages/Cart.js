import { state } from '../services/state.js';
import { getCart, placeOrder, clearCart, fetchProducts } from '../services/api_v2.js';
import { renderHeader, setupHeaderEvents } from '../components/Header.js';

/**
 * Spidey Store Cart Page — UI-009
 *
 * PRESERVED: getCart, placeOrder, clearCart API calls
 * PRESERVED: #clearCartBtn, #buyAllBtn element IDs
 */
export async function renderCart() {
  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <main class="cart-page" style="animation: fadeInUp 0.5s ease both;">
      <h1 class="cart-title">🛒 Your Cart</h1>
      <div id="cartContent">
        <div style="display:flex; align-items:center; justify-content:center; height:40vh; flex-direction:column; gap:16px;">
          <div class="spider-loader"></div>
          <p style="color:var(--text-muted); font-size:0.9rem;">Loading your cart...</p>
        </div>
      </div>
    </main>
  `;

  // FE-007: Wire header events (mobile nav) on Cart page
  setupHeaderEvents();

  try {
    const rawCartItems = await getCart(state.sessionId);

    // The cart only saves names/quantities, fetch products to display images/prices
    const productsDB = await fetchProducts();

    // Map items to rich data
    const cartItems = rawCartItems.map(item => {
      const match = productsDB.find(p => p.name === item.product_name) || {};
      return {
        ...item,
        price: match.price || 0,
        image: match.image_rul || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=200',
        description: match.description || 'No description available',
      };
    });

    const contentDiv = document.getElementById('cartContent');

    if (!cartItems.length) {
      contentDiv.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🕷️</div>
          <h2 class="cart-empty-title">Your web-cart is empty!</h2>
          <p style="color:var(--text-muted); margin-bottom:32px; font-size:0.9rem;">Even Spidey needs to shop. Start swinging!</p>
          <a href="#/" class="btn btn-spider" style="text-decoration:none; display:inline-flex;">🛍️ Start Shopping</a>
        </div>
      `;
      state.cartItemCount = 0;
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    state.cartItemCount = cartItems.length;

    contentDiv.innerHTML = `
      <div class="cart-items-list">
        ${cartItems.map((item, i) => `
          <div class="cart-item" style="animation-delay: ${i * 0.08}s;">
            <img src="${item.image_rul}" alt="${item.product_name}" />
            <div class="cart-item-info">
              <div class="cart-item-name">${item.product_name}</div>
              <div class="cart-item-qty">Quantity: ${item.quantity}</div>
              ${item.description !== 'No description available' ? `<div style="font-size:0.78rem; color:var(--text-subtle); margin-top:4px; line-clamp:1; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${item.description}</div>` : ''}
            </div>
            <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          </div>
        `).join('')}
      </div>

      <div class="cart-summary">
        <div class="cart-total-row">
          <div>
            <div class="cart-total-label">Total Due</div>
            <div style="font-size:0.78rem; color:var(--text-subtle);">${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} · Free delivery included</div>
          </div>
          <div class="cart-total-value">₹${total.toLocaleString('en-IN')}</div>
        </div>

        <div class="cart-actions">
          <a href="#/" class="btn btn-ghost" style="text-decoration:none; flex:1; min-width:120px; text-align:center;">← Keep Shopping</a>
          <button id="clearCartBtn" class="btn btn-danger" style="flex:1; min-width:120px;">🗑️ Clear Cart</button>
          <button id="buyAllBtn" class="btn btn-spider" style="flex:2; min-width:160px;">⚡ Buy All Now</button>
        </div>
      </div>
    `;

    document.getElementById('clearCartBtn')?.addEventListener('click', async (e) => {
      if (!confirm('Are you sure you want to clear your cart?')) return;

      const btn = e.target.closest('button');
      btn.disabled = true;
      btn.innerHTML = '⏳ Clearing...';

      try {
        await clearCart(state.sessionId);
        state.cartItemCount = 0;
        renderCart();
      } catch (err) {
        alert('Failed to clear cart.');
        btn.disabled = false;
        btn.innerHTML = '🗑️ Clear Cart';
      }
    });

    document.getElementById('buyAllBtn')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      btn.disabled = true;
      btn.innerHTML = `⏳ Processing...`;

      try {
        const promises = cartItems.map(item => placeOrder(state.sessionId, item.product_name, item.quantity));
        await Promise.all(promises);

        await clearCart(state.sessionId);
        state.cartItemCount = 0;

        btn.innerHTML = `🎉 Order Successful!`;
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        btn.style.boxShadow = '0 0 20px rgba(34,197,94,0.4)';

        setTimeout(() => {
          window.location.hash = '#/';
        }, 2000);

      } catch(err) {
        alert('Failed to process bulk order.');
        btn.disabled = false;
        btn.innerHTML = `⚡ Buy All Now`;
      }
    });

  } catch(err) {
    document.getElementById('cartContent').innerHTML = `
      <div style="text-align:center; padding:80px 20px;">
        <div style="font-size:3rem; margin-bottom:16px;">⚠️</div>
        <h3 style="color:var(--text-primary); margin-bottom:8px;">Error loading cart</h3>
        <p style="color:var(--text-muted);">Please refresh and try again.</p>
      </div>
    `;
  }
}
