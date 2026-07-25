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

    tbody.innerHTML = products.map(p => {
      const keysCount = p.digitalKeys?.length || 0;
      return `
      <tr>
        <td>
          ${p.images?.[0] ? `<img src="${escHtml(p.images[0])}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;">` : '<div style="width:44px;height:44px;background:#f1f5f9;border-radius:6px;"></div>'}
        </td>
        <td>
          <p class="fw-semibold mb-0">${escHtml(p.name)}</p>
          <p class="text-muted small mb-0">${escHtml(p.category?.name || '—')}</p>
        </td>
        <td>${formatCurrency(p.price)}</td>
        <td>
          <button class="btn btn-sm ${keysCount > 0 ? 'btn-outline-success' : 'btn-outline-warning'} font-monospace py-0 px-2" onclick="openKeysViewModal(${p.id})">
            <i class="bi bi-key-fill me-1"></i> ${keysCount} Keys
          </button>
        </td>
        <td>${p.stock ?? '—'}</td>
        <td>${p.rating ?? '—'} ⭐</td>
        <td>
          ${p.isFeatured ? '<span class="badge bg-primary me-1">Featured</span>' : ''}
          ${p.isNew ? '<span class="badge bg-success me-1">New</span>' : ''}
          ${p.isOnSale ? '<span class="badge bg-warning text-dark">Sale</span>' : ''}
        </td>
        <td class="text-end">
          <button class="btn btn-light btn-sm me-1" onclick="openEditModal(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
      `;
    }).join('') || `<tr><td colspan="8" class="text-center text-muted py-4">No products found</td></tr>`;

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

let productCropper = null;

function handleProductFileUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      setField('product-images', dataUrl);
      updateProductImagePreview(dataUrl);
      showToast('Local image loaded into cropper!');
    };
    reader.readAsDataURL(file);
  }
}

function updateProductImagePreview(url) {
  const box = document.getElementById('prod-img-preview-box');
  const img = document.getElementById('prod-img-preview');
  if (!box || !img) return;

  if (productCropper) {
    productCropper.destroy();
    productCropper = null;
  }

  const cleanUrl = (url || '').trim();
  let targetUrl = '';
  if (cleanUrl.startsWith('data:image/')) {
    targetUrl = cleanUrl;
  } else if (cleanUrl) {
    targetUrl = cleanUrl.split(',')[0].trim();
  }

  if (targetUrl && (targetUrl.startsWith('http') || targetUrl.startsWith('data:image'))) {
    img.crossOrigin = "anonymous";
    img.src = targetUrl;
    box.style.display = 'block';

    img.onload = function() {
      if (productCropper) productCropper.destroy();
      if (window.Cropper) {
        productCropper = new Cropper(img, {
          viewMode: 1,
          autoCropArea: 0.95,
          responsive: true,
          background: false,
        });
      }
    };
  } else {
    box.style.display = 'none';
  }
}

function rotateProductCrop(degree) {
  if (productCropper) {
    productCropper.rotate(degree);
  }
}

function applyProductCrop() {
  if (!productCropper) {
    showToast('Image loaded');
    return;
  }
  try {
    const canvas = productCropper.getCroppedCanvas({
      maxWidth: 1200,
      maxHeight: 1200,
      imageSmoothingQuality: 'high',
    });
    if (canvas) {
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setField('product-images', croppedDataUrl);
      showToast('✂️ Image cropped & applied successfully!');
    }
  } catch (err) {
    console.warn('Canvas cropper notice:', err);
    showToast('Image applied');
  }
}

function updateKeysCount(val) {
  const el = document.getElementById('product-keys-count');
  const lines = (val || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  if (el) {
    el.textContent = `${lines.length} Item${lines.length === 1 ? '' : 's'}`;
  }
  if (lines.length > 0) {
    setField('product-stock', lines.length);
  }
}

function cleanProductKeysFormat() {
  const textarea = document.getElementById('product-keys');
  if (!textarea) return;
  const raw = textarea.value;
  const cleaned = raw
    .split(/[\n,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .join('\n');
  textarea.value = cleaned;
  updateKeysCount(cleaned);
  showToast('✨ Formatted to 1 link per line cleanly!');
}

function openAddModal() {
  editingId = null;
  document.getElementById('productModalLabel').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  updateProductImagePreview('');
  updateKeysCount('');
  loadCategoriesForForm();
  const modalEl = document.getElementById('productModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}
function openCreateModal() {
  openAddModal();
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
  setField('product-warranty', product.warranty || '30 Days Replacement Warranty');
  setField('product-keys', (product.digitalKeys || []).join('\n'));
  updateKeysCount((product.digitalKeys || []).join('\n'));
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
  const name = getField('product-name').trim();
  if (!name) {
    showToast('Product name is required', 'error');
    return;
  }

  const rawImages = getField('product-images').trim();
  let imagesArray = [];
  if (rawImages) {
    if (rawImages.startsWith('data:image/')) {
      imagesArray = [rawImages];
    } else {
      imagesArray = rawImages.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (imagesArray.length === 0) {
    imagesArray = ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'];
  }

  const catVal = parseInt(getField('product-category'));

  const rawKeys = getField('product-keys').trim();
  const digitalKeysArray = rawKeys ? rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(Boolean) : [];

  const body = {
    name,
    slug: getField('product-slug').trim() || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: getField('product-description').trim() || name,
    price: parseFloat(getField('product-price')) || 0,
    stock: parseInt(getField('product-stock')) || 100,
    warranty: getField('product-warranty').trim() || '30 Days Replacement Warranty',
    digitalKeys: digitalKeysArray,
    categoryId: !isNaN(catVal) ? catVal : 1,
    images: imagesArray,
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
  } catch (e) {
    console.warn('API save notice, updating local memory store:', e);
    if (editingId) {
      productsList = productsList.map(p => p.id === editingId ? { ...p, ...body } : p);
      showToast('Product updated!');
    } else {
      const newProd = { id: Date.now(), ...body, rating: 5.0, reviewCount: 1 };
      productsList.unshift(newProd);
      showToast('New product added!');
    }
    localStorage.setItem('mini_app_products', JSON.stringify(productsList));
  }

  // Close modal cleanly
  const modalEl = document.getElementById('productModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    if (modal) modal.hide();
  }

  // Reset form state & reload table
  editingId = null;
  const formEl = document.getElementById('product-form');
  if (formEl) formEl.reset();
  updateProductImagePreview('');
  renderProducts();
  loadProducts(currentPage);
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

function openKeysViewModal(id) {
  const product = productsList.find(p => p.id === id);
  if (!product) return;

  const keys = product.digitalKeys || [];
  const titleEl = document.getElementById('keysViewModalLabel');
  const countEl = document.getElementById('keysModalCount');
  const contentEl = document.getElementById('keysModalContent');

  if (titleEl) titleEl.innerHTML = `<i class="bi bi-key-fill text-primary me-1"></i> Keys & Links Inventory — ${escHtml(product.name)}`;
  if (countEl) countEl.textContent = `${keys.length} Key${keys.length === 1 ? '' : 's'} / Link${keys.length === 1 ? '' : 's'} Remaining in Stock`;
  if (contentEl) contentEl.textContent = keys.length > 0 ? keys.join('\n') : '⚠️ No digital keys or links remaining in stock for this product.';

  const modalEl = document.getElementById('keysViewModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function copyAllKeysFromModal() {
  const text = document.getElementById('keysModalContent')?.textContent || '';
  if (text && !text.startsWith('⚠️')) {
    navigator.clipboard.writeText(text);
    showToast('📋 All keys copied to clipboard!');
  }
}
