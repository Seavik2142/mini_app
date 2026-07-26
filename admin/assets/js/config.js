/**
 * admin/assets/js/config.js
 * Shared API config for all admin pages.
 * Change API_BASE to your Render backend URL when deployed.
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://mini-app-mzu6.onrender.com';

const API = {
  stats:         `${API_BASE}/admin-api/stats`,
  users:         `${API_BASE}/admin-api/users`,
  orders:        `${API_BASE}/admin-api/orders`,
  products:      `${API_BASE}/admin-api/products`,
  categories:    `${API_BASE}/admin-api/categories`,
  banners:       `${API_BASE}/admin-api/banners`,
  promos:        `${API_BASE}/admin-api/promos`,
  broadcastNews: `${API_BASE}/admin-api/broadcast-news`,
};

/**
 * Generic fetch helper — returns parsed JSON or throws error
 */
async function apiFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.msg || err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'success') {
  const existing = document.getElementById('adminToast');
  if (existing) existing.remove();

  const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' };
  const toast = document.createElement('div');
  toast.id = 'adminToast';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colors[type] || colors.success}; color:#fff;
    padding:12px 20px; border-radius:8px; font-size:14px;
    box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:500;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return '$' + Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format date
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Status badge HTML
 */
function statusBadge(status) {
  const map = {
    PENDING:    'bg-warning text-dark',
    PAID:       'bg-success',
    FAILED:     'bg-danger',
    PROCESSING: 'bg-primary',
    SHIPPED:    'bg-info',
    DELIVERED:  'bg-success',
    CANCELLED:  'bg-secondary',
    ACTIVE:     'bg-success',
    BLOCKED:    'bg-danger',
  };
  const cls = map[status?.toUpperCase()] || 'bg-secondary';
  return `<span class="badge ${cls}">${status || '—'}</span>`;
}
