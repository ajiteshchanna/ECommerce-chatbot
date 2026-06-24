import { state, resetAdminForm } from '../services/state.js';
import { fetchProducts, addProduct, updateProduct, deleteProduct, deleteAllProducts, bulkGenerateProducts } from '../services/api_v2.js';
import { renderHeader, setupHeaderEvents } from '../components/Header.js';

/**
 * Spidey Store Admin Page — UI-018
 *
 * PRESERVED: All admin functionality (add, update, delete, bulk generate, delete all)
 * PRESERVED form field IDs: adminName, adminDesc, adminPrice, adminColor, adminImage
 * PRESERVED button IDs: addProductBtn, updateProductBtn, cancelEditBtn, bulkGenBtn, deleteAllBtn
 * PRESERVED all category-btn, data-cat, data-size attributes for event handlers
 */
export async function renderAdmin() {
  const data = await fetchProducts();
  state.productList = data;

  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <main class="admin-page" style="animation: fadeInUp 0.5s ease both;">

      <!-- Admin Header Row -->
      <div class="admin-header-row">
        <h1 class="admin-title">⚙️ Manage Products</h1>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button id="deleteAllBtn" class="btn btn-danger">🧨 Delete All Products</button>
          <button id="bulkGenBtn" class="btn" style="background:linear-gradient(135deg,#eab308,#ca8a04); color:#0a0a0f; font-weight:700; box-shadow:0 0 12px rgba(234,179,8,0.3);">⚡ Generate 500 Demo</button>
        </div>
      </div>

      <!-- Add/Edit Product Form -->
      <div class="admin-form">
        <h2 class="admin-form-title">${state.isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>

        <div class="form-grid">
          <!-- Name -->
          <div>
            <label class="form-label" for="adminName">Product Name</label>
            <input placeholder="e.g. Spider-Fit Tee" class="form-input" id="adminName" value="${state.adminForm.name}" />
          </div>

          <!-- Price -->
          <div>
            <label class="form-label" for="adminPrice">Price (₹)</label>
            <input placeholder="e.g. 999" type="number" class="form-input" id="adminPrice" value="${state.adminForm.price || ''}" />
          </div>

          <!-- Description -->
          <div class="form-col-span">
            <label class="form-label" for="adminDesc">Description</label>
            <input placeholder="Short product description..." class="form-input" id="adminDesc" value="${state.adminForm.description}" style="width:100%;" />
          </div>

          <!-- Category -->
          <div class="form-col-span">
            <label class="form-label">Category</label>
            <div class="category-buttons" id="adminCategoryButtons">
              ${['men', 'women', 'kids'].map(cat => `
                <button class="category-btn ${state.adminForm.category === cat ? 'active' : ''}" data-cat="${cat}">
                  ${{ men:'👔 Men', women:'👗 Women', kids:'🧒 Kids' }[cat]}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Image Upload -->
          <div class="form-col-span">
            <label class="form-label" for="adminImage">${state.isEditing ? 'Change Image (optional)' : 'Product Image'}</label>
            <input type="file" accept="image/png, image/jpeg, image/jpg" id="adminImage" class="form-input" style="width:100%; padding:8px;" />
            ${state.adminForm.image && !state.imageFile ? `<p style="font-size:0.78rem; color:var(--text-muted); margin-top:6px;">📎 Current: ${state.adminForm.image}</p>` : ''}
          </div>

          <!-- Sizes -->
          <div class="form-col-span">
            <label class="form-label">Sizes</label>
            <div class="checkbox-group">
              ${['S', 'M', 'L', 'XL', 'XXL'].map(size => `
                <label class="checkbox-label">
                  <input type="checkbox" ${state.adminForm.size?.includes(size) ? 'checked' : ''} data-size="${size}" />
                  <span>${size}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Colors -->
          <div class="form-col-span">
            <label class="form-label" for="adminColor">Colors</label>
            <input
              placeholder="e.g. Black, Red, Blue"
              class="form-input"
              style="width:100%;"
              id="adminColor"
              value="${Array.isArray(state.adminForm.color) ? state.adminForm.color.join(', ') : state.adminForm.color || ''}"
            />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          ${state.isEditing ? `
            <button id="updateProductBtn" class="btn btn-blue">✅ Update Product</button>
            <button id="cancelEditBtn" class="btn btn-ghost">✕ Cancel</button>
          ` : `
            <button id="addProductBtn" class="btn btn-success">➕ Add Product</button>
          `}
        </div>
      </div>

      <!-- Product List -->
      <h2 class="product-list-title">📦 All Products <span style="font-size:0.8rem; color:var(--text-muted); font-weight:400;">(${state.productList.length} total)</span></h2>
      <div class="product-list-grid">
        ${state.productList.length === 0
          ? `<div style="grid-column:1/-1; text-align:center; padding:60px; color:var(--text-muted);">
               <div style="font-size:3rem; margin-bottom:12px;">📭</div>
               <p>No products yet. Add one or generate 500 demo products!</p>
             </div>`
          : state.productList.map(p => `
            <div class="product-list-item">
              <img src="${p.image}" alt="${p.name}" />
              <div class="product-list-item-info">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p class="price">₹${p.price}</p>
                <p class="meta">📂 ${p.category}</p>
                <p class="meta">📏 ${p.size?.join(', ') || 'N/A'}</p>
                <div class="product-actions">
                  <button class="edit-btn" data-id="${p.id}">✏️ Edit</button>
                  <button class="delete-btn" data-id="${p.id}">🗑️ Delete</button>
                </div>
              </div>
            </div>
          `).join('')}
      </div>

    </main>
  `;

  setupAdminEvents();
}

function setupAdminEvents() {
  // FE-007: Wire header events (mobile nav) on Admin page
  setupHeaderEvents();
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminForm.category = btn.dataset.cat;
      renderAdmin();
    });
  });

  document.querySelectorAll('[data-size]').forEach(cb => {
    cb.addEventListener('change', () => {
      const size = cb.dataset.size;
      const currentSizes = state.adminForm.size || [];
      if (cb.checked) {
        state.adminForm.size = [...currentSizes, size];
      } else {
        state.adminForm.size = currentSizes.filter(s => s !== size);
      }
    });
  });

  document.getElementById('addProductBtn')?.addEventListener('click', handleAddProduct);
  document.getElementById('updateProductBtn')?.addEventListener('click', handleUpdateProduct);
  document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
    resetAdminForm();
    renderAdmin();
  });

  document.getElementById('bulkGenBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('bulkGenBtn');
    btn.textContent = '⏳ Generating...';
    btn.disabled = true;
    try {
      await bulkGenerateProducts();
      alert('✅ 500 Products Generated! Images may take a moment to load.');
      renderAdmin();
    } catch(e) {
      alert('❌ Failed to generate products.');
      btn.textContent = '⚡ Generate 500 Demo';
      btn.disabled = false;
    }
  });

  document.getElementById('deleteAllBtn')?.addEventListener('click', async () => {
    if (confirm('⚠️ Are you ABSOLUTELY sure you want to delete EVERY product? This cannot be undone!')) {
      const btn = document.getElementById('deleteAllBtn');
      btn.textContent = '⏳ Deleting...';
      btn.disabled = true;
      try {
        await deleteAllProducts();
        alert('✅ All products have been deleted.');
        renderAdmin();
      } catch (e) {
        alert('❌ Failed to delete products.');
        btn.textContent = '🧨 Delete All Products';
        btn.disabled = false;
      }
    }
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = state.productList.find(p => String(p.id) === String(btn.dataset.id));
      if (product) editProduct(product);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteProduct(btn.dataset.id));
  });

  document.getElementById('adminImage')?.addEventListener('change', (e) => {
    state.imageFile = e.target.files?.[0] || null;
  });
}

/**
 * Handle form prepopulation for editing a product.
 */
function editProduct(product) {
  state.isEditing = true;
  state.editId = product.id;
  state.imageFile = null;
  const colorValue = product.color
    ? (typeof product.color === 'string' ? product.color.split(',').map(c => c.trim()) : product.color)
    : [];
  state.adminForm = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    size: product.size || [],
    color: colorValue
  };
  renderAdmin();
}

async function handleAddProduct() {
  const adminForm = state.adminForm;
  adminForm.name        = document.getElementById('adminName').value;
  adminForm.description = document.getElementById('adminDesc').value;
  adminForm.price       = Number(document.getElementById('adminPrice').value);
  adminForm.color       = document.getElementById('adminColor').value.split(',').map(c => c.trim()).filter(c => c);

  if (!adminForm.name || !adminForm.description || !adminForm.price || !adminForm.category) {
    alert('Please fill in all required fields');
    return;
  }

  const formData = new FormData();
  formData.append('name',        adminForm.name);
  formData.append('description', adminForm.description);
  formData.append('price',       String(adminForm.price));
  formData.append('category',    adminForm.category);
  formData.append('size',        adminForm.size?.join(',') || 'M,L');
  formData.append('color',       adminForm.color?.join(', ') || 'Black');
  if (state.imageFile) formData.append('image', state.imageFile);

  await addProduct(formData);
  alert('✅ Product Added!');
  resetAdminForm();
  renderAdmin();
}

async function handleUpdateProduct() {
  const adminForm = state.adminForm;
  adminForm.name        = document.getElementById('adminName').value;
  adminForm.description = document.getElementById('adminDesc').value;
  adminForm.price       = Number(document.getElementById('adminPrice').value);
  adminForm.color       = document.getElementById('adminColor').value.split(',').map(c => c.trim()).filter(c => c);

  if (!adminForm.name || !adminForm.description || !adminForm.price || !adminForm.category) {
    alert('Please fill in all required fields');
    return;
  }

  if (state.imageFile) {
    const formData = new FormData();
    formData.append('name',        adminForm.name);
    formData.append('description', adminForm.description);
    formData.append('price',       String(adminForm.price));
    formData.append('category',    adminForm.category);
    formData.append('size',        adminForm.size?.join(',') || 'M,L');
    formData.append('color',       adminForm.color?.join(', ') || 'Black');
    formData.append('image',       state.imageFile);
    await updateProduct(state.editId, formData, true);
  } else {
    await updateProduct(state.editId, { ...adminForm, size: adminForm.size || ['M', 'L'], color: adminForm.color || ['Black'] });
  }

  alert('✅ Product Updated!');
  resetAdminForm();
  renderAdmin();
}

/**
 * Handle the deletion of a product.
 */
async function handleDeleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await deleteProduct(id);
  state.productList = state.productList.filter(p => String(p.id) !== String(id));
  renderAdmin();
}
