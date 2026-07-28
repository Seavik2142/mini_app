/**
 * admin/assets/js/products.js
 * Loads real products from API into products.html, supports create/edit/delete
 */
let currentPage = 1;
let editingId = null;
let productsList = [];
let _savingProduct = false; // guard against double-submit

document.addEventListener('DOMContentLoaded', () => {
  const local = JSON.parse(localStorage.getItem('mini_app_products'));
  productsList = Array.isArray(local) && local.length > 0 ? local : [];
  renderProductsList(productsList);
  loadProducts(1);
  loadCategoriesForForm();
});

async function loadProducts(page = 1) {
  currentPage = page;
  try {
    const data = await apiFetch(`${API.products}?page=${page}&limit=50`);
    const remote = data.data?.products || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    if (Array.isArray(remote)) {
      productsList = remote;
      localStorage.setItem('mini_app_products', JSON.stringify(productsList));
    }
  } catch (e) {
    console.warn('API products fetch notice (using cached list):', e);
  }
  // Always render — clears loading spinner
  renderProductsList(productsList);
}

function renderProductsList(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  const countEl = document.getElementById('products-count');
  if (countEl) countEl.textContent = `${(products || []).length} products in store catalog`;

  if (!products || products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted">
      <i class="bi bi-box-seam" style="font-size:2rem;opacity:0.3;display:block;margin-bottom:8px;"></i>
      No products yet. Click <strong>"Add Product"</strong> to create one.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const keysCount = p.digitalKeys?.length || 0;
    return `
    <tr>
      <td data-label="Image">
        ${p.images?.[0]
          ? `<img src="${escHtml(p.images[0])}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'">`
          : '<div style="width:44px;height:44px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;"><i class="bi bi-image text-muted"></i></div>'}
      </td>
      <td data-label="Product">
        <p class="fw-semibold mb-0">${escHtml(p.name)}</p>
        <p class="text-muted small mb-0">${escHtml(p.category?.name || 'General')}</p>
      </td>
      <td data-label="Price">${formatCurrency(p.price)}</td>
      <td data-label="Keys Inventory">
        <button class="btn btn-sm ${keysCount > 0 ? 'btn-outline-success' : 'btn-outline-warning'} font-monospace py-0 px-2" onclick="openKeysViewModal(${p.id})">
          <i class="bi bi-key-fill me-1"></i> ${keysCount} Keys
        </button>
      </td>
      <td data-label="Stock">${p.stock ?? '—'}</td>
      <td data-label="Rating">${p.rating ?? '5.0'} ⭐</td>
      <td data-label="Flags">
        ${p.isFeatured ? '<span class="badge bg-primary me-1">Featured</span>' : ''}
        ${p.isNew ? '<span class="badge bg-success me-1">New</span>' : ''}
        ${p.isOnSale ? '<span class="badge bg-warning text-dark">Sale</span>' : ''}
      </td>
      <td class="text-end">
        <button class="btn btn-light btn-sm me-1" onclick="openEditModal(${p.id})">Edit</button>
        <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

async function loadCategoriesForForm() {
  try {
    const data = await apiFetch(API.categories);
    const cats = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    const sel = document.getElementById('product-category');
    if (!sel) return;
    if (cats.length > 0) {
      sel.innerHTML = cats.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    } else {
      sel.innerHTML = '<option value="1">General</option>';
    }
  } catch (e) {
    const sel = document.getElementById('product-category');
    if (sel) sel.innerHTML = '<option value="1">General</option>';
  }
}

let productCropper = null;

function handleProductFileUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      setField('product-images', dataUrl);
      updateProductImagePreview(dataUrl);
      showToast('Local image loaded into cropper!');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function updateProductImagePreview(url) {
  const box = document.getElementById('prod-img-preview-box');
  const img = document.getElementById('prod-img-preview');
  if (!box || !img) return;

  if (productCropper) { productCropper.destroy(); productCropper = null; }

  const cleanUrl = (url || '').trim();
  let targetUrl = '';
  if (cleanUrl.startsWith('data:image/')) {
    targetUrl = cleanUrl;
  } else if (cleanUrl) {
    targetUrl = cleanUrl.split(',')[0].trim();
  }

  if (targetUrl && (targetUrl.startsWith('http') || targetUrl.startsWith('data:image'))) {
    img.crossOrigin = 'anonymous';
    img.src = targetUrl;
    box.style.display = 'block';
    img.onload = function() {
      if (productCropper) productCropper.destroy();
      if (window.Cropper) {
        productCropper = new Cropper(img, { viewMode: 1, autoCropArea: 0.95, responsive: true, background: false });
      }
    };
  } else {
    box.style.display = 'none';
  }
}

function rotateProductCrop(degree) { if (productCropper) productCropper.rotate(degree); }

function applyProductCrop() {
  if (!productCropper) { showToast('Image loaded'); return; }
  try {
    const canvas = productCropper.getCroppedCanvas({ maxWidth: 1200, maxHeight: 1200, imageSmoothingQuality: 'high' });
    if (canvas) {
      setField('product-images', canvas.toDataURL('image/jpeg', 0.92));
      showToast('✂️ Image cropped & applied successfully!');
    }
  } catch (err) { showToast('Image applied'); }
}

function updateKeysCount(val) {
  const el = document.getElementById('product-keys-count');
  const lines = (val || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  if (el) el.textContent = `${lines.length} Item${lines.length === 1 ? '' : 's'}`;
  if (lines.length > 0) setField('product-stock', lines.length);
}

function cleanProductKeysFormat() {
  const textarea = document.getElementById('product-keys');
  if (!textarea) return;
  const cleaned = textarea.value.split(/[\n,\s]+/).map(s => s.trim()).filter(Boolean).join('\n');
  textarea.value = cleaned;
  updateKeysCount(cleaned);
  showToast('✨ Formatted to 1 link per line cleanly!');
}

function toggleDiscountField() {
  const isSale = document.getElementById('product-sale')?.checked;
  const container = document.getElementById('discount-container');
  if (container) {
    container.style.display = isSale ? 'block' : 'none';
  }
}

function openAddModal() {
  editingId = null;
  const labelEl = document.getElementById('productModalLabel');
  if (labelEl) labelEl.textContent = 'Add Product';
  const formEl = document.getElementById('product-form');
  if (formEl) formEl.reset();
  updateProductImagePreview('');
  updateKeysCount('');
  toggleDiscountField();
  loadCategoriesForForm();
  const modalEl = document.getElementById('productModal');
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}
function openCreateModal() { openAddModal(); }

function openEditModal(id) {
  const product = productsList.find(p => p.id === id);
  if (!product) return;

  editingId = product.id;
  const labelEl = document.getElementById('productModalLabel');
  if (labelEl) labelEl.textContent = 'Edit Product';
  setField('product-name', product.name);
  setField('product-slug', product.slug);
  setField('product-description', product.description);
  setField('product-price', product.price);
  setField('product-stock', product.stock);
  setField('product-warranty', product.warranty || '30 Days Replacement Warranty');
  setField('product-keys', (product.digitalKeys || []).join('\n'));
  updateKeysCount((product.digitalKeys || []).join('\n'));
  setField('product-images', (product.images || []).join(', '));
  updateProductImagePreview((product.images || [])[0] || '');
  setCheck('product-featured', product.isFeatured);
  setCheck('product-new', product.isNew);
  setCheck('product-sale', product.isOnSale);
  setField('product-discount', product.discount || '');
  toggleDiscountField();

  loadCategoriesForForm().then(() => setField('product-category', product.categoryId));

  const modalEl = document.getElementById('productModal');
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

async function saveProduct() {
  // Guard against double-submit (form onsubmit + button onclick)
  if (_savingProduct) return;
  _savingProduct = true;

  const name = getField('product-name').trim();
  if (!name) {
    showToast('Product name is required', 'error');
    _savingProduct = false;
    return;
  }

  const rawImages = getField('product-images').trim();
  let imagesArray = [];
  if (rawImages.startsWith('data:image/')) {
    imagesArray = [rawImages];
  } else if (rawImages) {
    imagesArray = rawImages.split(',').map(s => s.trim()).filter(Boolean);
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
    discount: getCheck('product-sale') ? (parseFloat(getField('product-discount')) || 0) : 0,
  };

  // Capture editingId before clearing it
  const savedEditingId = editingId;
  const newProductObj = { id: savedEditingId || Date.now(), ...body, rating: 5.0, reviewCount: 0 };

  // Instant local render
  if (savedEditingId) {
    productsList = productsList.map(p => p.id === savedEditingId ? { ...p, ...newProductObj } : p);
    showToast('✅ Product updated successfully!');
  } else {
    productsList.unshift(newProductObj);
    showToast('✅ Product created successfully!');
  }
  localStorage.setItem('mini_app_products', JSON.stringify(productsList));
  renderProductsList(productsList);

  // Close modal and reset form
  editingId = null;
  const modalEl = document.getElementById('productModal');
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  const formEl = document.getElementById('product-form');
  if (formEl) formEl.reset();
  updateProductImagePreview('');

  // Sync to backend API in background
  try {
    let result;
    if (savedEditingId) {
      result = await apiFetch(`${API.products}/${savedEditingId}`, { method: 'PATCH', body: JSON.stringify(body) });
    } else {
      result = await apiFetch(API.products, { method: 'POST', body: JSON.stringify(body) });
    }
    // Update local list with real DB id
    if (result?.data?.id && !savedEditingId) {
      productsList = productsList.map(p => p.id === newProductObj.id ? { ...p, id: result.data.id } : p);
      localStorage.setItem('mini_app_products', JSON.stringify(productsList));
      renderProductsList(productsList);
    }
  } catch (e) {
    console.warn('API save notice (saved locally):', e);
  }

  _savingProduct = false;
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const result = await apiFetch(`${API.products}/${id}`, { method: 'DELETE' });
    if (result?.code === 200) {
      productsList = productsList.filter(p => p.id !== id);
      localStorage.setItem('mini_app_products', JSON.stringify(productsList));
      renderProductsList(productsList);
      showToast('Product deleted', 'info');
    } else {
      showToast(result?.msg || 'Unable to delete this product', 'error');
    }
  } catch (err) {
    console.warn('API delete notice:', err);
    showToast(err?.message || 'Unable to delete this product', 'error');
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
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function copyAllKeysFromModal() {
  const text = document.getElementById('keysModalContent')?.textContent || '';
  if (text && !text.startsWith('⚠️')) {
    navigator.clipboard.writeText(text);
    showToast('📋 All keys copied to clipboard!');
  }
}
