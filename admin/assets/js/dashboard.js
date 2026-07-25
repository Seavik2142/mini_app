/**
 * admin/assets/js/dashboard.js
 * Fetches real stats + recent users + recent orders for index.html
 */
document.addEventListener('DOMContentLoaded', async () => {
  loadStats();
  loadRecentUsers();
  loadRecentOrders();
});

async function loadStats() {
  try {
    const data = await apiFetch(API.stats);
    const s = data.data || data;

    setEl('stat-revenue',  formatCurrency(s.totalRevenue));
    setEl('stat-orders',   Number(s.totalOrders || 0).toLocaleString());
    setEl('stat-users',    Number(s.totalUsers || 0).toLocaleString());
    setEl('stat-products', Number(s.totalProducts || 0).toLocaleString());
  } catch (e) {
    console.error('Stats error:', e);
    setEl('stat-revenue',  '$0.00');
    setEl('stat-orders',   '0');
    setEl('stat-users',    '0');
    setEl('stat-products', '0');
  }
}

async function loadRecentUsers() {
  const tbody = document.getElementById('recent-users-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch(API.users + '?page=1&limit=5');
    const users = data.data?.users || data.users || [];

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-img avatar-sm d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style="width:36px;height:36px;font-size:14px;font-weight:600;">
              ${(u.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p class="fw-semibold mb-0">${escHtml(u.name)}</p>
              <p class="text-muted small mb-0">@${escHtml(u.username || u.tgId || '—')}</p>
            </div>
          </div>
        </td>
        <td>${formatCurrency(u.balance)}</td>
        <td>${statusBadge(u.isBlock ? 'BLOCKED' : 'ACTIVE')}</td>
        <td>${formatDate(u.joinedAt)}</td>
        <td class="text-end"><a class="btn btn-light btn-sm" href="users.html">View</a></td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-muted py-4">No users registered yet</td></tr>';
  } catch (e) {
    console.error('Recent users error:', e);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Unable to connect to database API</td></tr>';
  }
}

async function loadRecentOrders() {
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch(API.orders + '?page=1&limit=5');
    const orders = data.data?.orders || data.orders || [];

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><span class="fw-semibold">#${escHtml(o.orderNumber || o.id)}</span></td>
        <td>${escHtml(o.user?.name || 'Customer')}</td>
        <td>${formatCurrency(o.totalAmount)}</td>
        <td>${statusBadge(o.paymentStatus)}</td>
        <td>${statusBadge(o.orderStatus)}</td>
        <td>${formatDate(o.createdAt)}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">No orders placed yet</td></tr>';
  } catch (e) {
    console.error('Recent orders error:', e);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Unable to connect to database API</td></tr>';
  }
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
