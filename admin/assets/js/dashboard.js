/**
 * admin/assets/js/dashboard.js
 * Fetches real stats + recent users + recent orders for index.html
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadRecentUsers();
  await loadRecentOrders();
});

async function loadStats() {
  try {
    const data = await apiFetch(API.stats);
    const s = data.data || data;

    setEl('stat-revenue',  formatCurrency(s.totalRevenue));
    setEl('stat-orders',   Number(s.totalOrders).toLocaleString());
    setEl('stat-users',    Number(s.totalUsers).toLocaleString());
    setEl('stat-products', Number(s.totalProducts).toLocaleString());
  } catch (e) {
    console.error('Stats error:', e);
  }
}

async function loadRecentUsers() {
  try {
    const data = await apiFetch(API.users + '?page=1&limit=5');
    const users = data.data?.users || data.users || [];
    const tbody = document.getElementById('recent-users-tbody');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-img avatar-sm d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style="width:36px;height:36px;font-size:14px;font-weight:600;">
              ${(u.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p class="fw-semibold mb-0">${escHtml(u.name)}</p>
              <p class="text-muted small mb-0">@${escHtml(u.username || u.tgId)}</p>
            </div>
          </div>
        </td>
        <td>${formatCurrency(u.balance)}</td>
        <td>${statusBadge(u.isBlock ? 'BLOCKED' : 'ACTIVE')}</td>
        <td>${formatDate(u.joinedAt)}</td>
        <td class="text-end"><a class="btn btn-light btn-sm" href="user-details.html?id=${u.id}">View</a></td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-muted py-4">No users yet</td></tr>';
  } catch (e) {
    console.error('Recent users error:', e);
  }
}

async function loadRecentOrders() {
  try {
    const data = await apiFetch(API.orders + '?page=1&limit=5');
    const orders = data.data?.orders || data.orders || [];
    const tbody = document.getElementById('recent-orders-tbody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><span class="fw-semibold">#${o.orderNumber}</span></td>
        <td>${escHtml(o.user?.name || '—')}</td>
        <td>${formatCurrency(o.totalAmount)}</td>
        <td>${statusBadge(o.paymentStatus)}</td>
        <td>${statusBadge(o.orderStatus)}</td>
        <td>${formatDate(o.createdAt)}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">No orders yet</td></tr>';
  } catch (e) {
    console.error('Recent orders error:', e);
  }
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
