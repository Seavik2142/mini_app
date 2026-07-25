/**
 * admin/assets/js/products.js
 * Loads real products from API into products.html, supports create/edit/delete
 */
let currentPage = 1;
let editingId = null;
let productsList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadProducts(1);
  loadCategoriesForForm();
});

async function loadProducts(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading products...</td></tr>`;

  try {
    const data = await apiFetch(`${API.products}?page=${page}&limit=20`);
    const { products = [], total = 0, totalPages = 1 } = data.data || data;
    productsList = products;

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          ${p.images?.[0] ? `<img src="${escHtml(p.images[0])}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;">` : '<div style="width:44px;height:44px;background:#f1f5f9;border-radius:6px;"></div>'}
        </td>
        <td>
          <p class="fw-semibold mb-0">${escHtml(p.name)}</p>
          <p class="text-muted small mb-0">${escHtml(p.category?.name || '—')}</p>
        </td>
        <td>${formatCurrency(p.price)}</td>
        <td>${p.stock ?? '—'}</td>
        <td>${p.rating ?? '—'} ⭐</td>
        <td>
          ${p.isFeatured ? '<span class="badge bg-primary me-1">Featured</span>' : ''}
          ${p.isNew ? '<span class="badge bg-success me-1">New</span>' : ''}
          ${p.isOnSale ? '<span class="badge bg-warning text-dark">Sale</span>' : ''}
        </td>
        <td>${formatDate(p.createdAt)}</td>
        <td class="text-end">
          <button class="btn btn-light btn-sm me-1" onclick="openEditModal(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="8" class="text-center text-muted py-4">No products found</td></tr>`;

    const countEl = document.getElementById('products-count');
    if (countEl) countEl.textContent = `${total} total products`;

  } catch (e) {
    console.error('Load products error:', e);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Error loading products: ${escHtml(e.message)}</td></tr>`;
  }
}

async function loadCategoriesForForm() {
  try {
    const data = await apiFetch(API.categories);
    const cats = data.data || data;
    const sel = document.getElementById('product-category');
    if (!sel) return;
    sel.innerHTML = cats.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
  } catch (e) {
    console.error('Categories error:', e);
  }
}

function handleProductFileUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      setField('product-images', dataUrl);
      updateProductImagePreview(dataUrl);
      showToast('Local image loaded!');
    };
    reader.readAsDataURL(file);
  }
}

function updateProductImagePreview(url) {
  const box = document.getElementById('prod-img-preview-box');
  const img = document.getElementById('prod-img-preview');
  if (!box || !img) return;
  const firstUrl = (url || '').split(',')[0].trim();
  if (firstUrl) {
    img.src = firstUrl;
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}

function openAddModal() {
  editingId = null;
  document.getElementById('productModalLabel').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  updateProductImagePreview('');
  loadCategoriesForForm();
  const modalEl = document.getElementById('productModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function openEditModal(id) {
  const product = productsList.find(p => p.id === id);
  if (!product) return;

  editingId = product.id;
  document.getElementById('productModalLabel').textContent = 'Edit Product';
  setField('product-name', product.name);
  setField('product-slug', product.slug);
  setField('product-description', product.description);
  setField('product-price', product.price);
  setField('product-stock', product.stock);
  setField('product-category', product.categoryId);
  setField('product-images', (product.images || []).join(', '));
  updateProductImagePreview((product.images || [])[0] || '');
  setCheck('product-featured', product.isFeatured);
  setCheck('product-new', product.isNew);
  setCheck('product-sale', product.isOnSale);

  const modalEl = document.getElementById('productModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

async function saveProduct() {
  const name = getField('product-name');
  if (!name) {
    showToast('Product name is required', 'error');
    return;
  }

  const body = {
    name,
    slug: getField('product-slug') || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: getField('product-description'),
    price: parseFloat(getField('product-price')) || 0,
    stock: parseInt(getField('product-stock')) || 0,
    categoryId: parseInt(getField('product-category')) || 1,
    images: getField('product-images').split(',').map(s => s.trim()).filter(Boolean),
    isFeatured: getCheck('product-featured'),
    isNew: getCheck('product-new'),
    isOnSale: getCheck('product-sale'),
  };

  try {
    if (editingId) {
      await apiFetch(`${API.products}/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) });
      showToast('Product updated successfully!');
    } else {
      await apiFetch(API.products, { method: 'POST', body: JSON.stringify(body) });
      showToast('Product created successfully!');
    }
    const modalEl = document.getElementById('productModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      if (modal) modal.hide();
    }
    loadProducts(currentPage);
  } catch (e) {
    showToast('Error saving product: ' + e.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await apiFetch(`${API.products}/${id}`, { method: 'DELETE' });
    showToast('Product deleted', 'info');
    loadProducts(currentPage);
  } catch (e) {
    showToast('Error deleting product: ' + e.message, 'error');
  }
}

function setField(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }
function getField(id) { return document.getElementById(id)?.value || ''; }
function setCheck(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function getCheck(id) { return !!document.getElementById(id)?.checked; }
function escHtml(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
