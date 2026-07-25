/**
 * admin/assets/js/products.js
 * Loads real products from API into products.html, supports create/edit/delete
 */
let currentPage = 1;
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadProducts(1);
  loadCategoriesForForm();
});

async function loadProducts(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading...</td></tr>`;

  try {
    const data = await apiFetch(`${API.products}?page=${page}&limit=20`);
    const { products = [], total = 0, totalPages = 1 } = data.data || data;

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
        <td class="text-end d-flex gap-1 justify-content-end">
          <button class="btn btn-light btn-sm" onclick="openEditModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="8" class="text-center text-muted py-4">No products found</td></tr>`;

    const countEl = document.getElementById('products-count');
    if (countEl) countEl.textContent = `${total} products`;

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Error: ${e.message}</td></tr>`;
  }
}

async function loadCategoriesForForm() {
  try {
    const data = await apiFetch(API.categories);
    const cats = data.data || data;
    const sel = document.getElementById('product-category');
    if (!sel) return;
    sel.innerHTML = cats.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
  } catch (e) { console.error(e); }
}

function openCreateModal() {
  editingId = null;
  document.getElementById('product-form')?.reset();
  document.getElementById('productModalLabel').textContent = 'Add Product';
  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

function openEditModal(product) {
  editingId = product.id;
  document.getElementById('productModalLabel').textContent = 'Edit Product';
  setField('product-name', product.name);
  setField('product-slug', product.slug);
  setField('product-description', product.description);
  setField('product-price', product.price);
  setField('product-stock', product.stock);
  setField('product-category', product.categoryId);
  setField('product-images', (product.images || []).join(', '));
  document.getElementById('product-featured').checked = product.isFeatured;
  document.getElementById('product-new').checked = product.isNew;
  document.getElementById('product-sale').checked = product.isOnSale;
  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

async function saveProduct() {
  const body = {
    name: getField('product-name'),
    slug: getField('product-slug') || getField('product-name').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: getField('product-description'),
    price: parseFloat(getField('product-price')) || 0,
    stock: parseInt(getField('product-stock')) || 0,
    categoryId: parseInt(getField('product-category')) || 1,
    images: getField('product-images').split(',').map(s => s.trim()).filter(Boolean),
    isFeatured: document.getElementById('product-featured').checked,
    isNew: document.getElementById('product-new').checked,
    isOnSale: document.getElementById('product-sale').checked,
  };

  try {
    if (editingId) {
      await apiFetch(`${API.products}/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) });
      showToast('Product updated!');
    } else {
      await apiFetch(API.products, { method: 'POST', body: JSON.stringify(body) });
      showToast('Product created!');
    }
    bootstrap.Modal.getInstance(document.getElementById('productModal'))?.hide();
    loadProducts(currentPage);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await apiFetch(`${API.products}/${id}`, { method: 'DELETE' });
    showToast('Product deleted', 'info');
    loadProducts(currentPage);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

function setField(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }
function getField(id) { return document.getElementById(id)?.value || ''; }
function escHtml(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
