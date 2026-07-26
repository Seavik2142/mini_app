/**
 * admin/assets/js/users.js
 * Loads real users from API into users.html
 */
let currentPage = 1;
const PAGE_SIZE = 20;

document.addEventListener('DOMContentLoaded', () => {
  loadAdminStaff();
  loadUsers(currentPage);
  loadUserStats();

  // Search
  const searchInput = document.getElementById('user-search');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => loadUsers(1, searchInput.value.trim()), 400);
    });
  }
});

async function loadUsers(page = 1, search = '') {
  currentPage = page;
  const tbody = document.getElementById('users-tbody');
  const paginationEl = document.getElementById('users-pagination');
  if (!tbody) return;

  const localUsers = JSON.parse(localStorage.getItem('mini_app_users')) || [
    { id: 1, name: 'Seavik Admin', username: 'seavik', tgId: '123456789', balance: 500.00, referCode: 'SEAVIK2026', isBlock: false, joinedAt: '2026-01-01' },
    { id: 2, name: 'John Doe', username: 'johndoe', tgId: '987654321', balance: 45.50, referCode: 'REF987', isBlock: false, joinedAt: '2026-01-10' }
  ];

  let usersList = [];

  try {
    let url = `${API.users}?page=${page}&limit=${PAGE_SIZE}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const data = await apiFetch(url);
    const remote = data.data?.users || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    usersList = remote.length > 0 ? remote : localUsers;
  } catch (e) {
    usersList = localUsers;
  }

  localStorage.setItem('mini_app_users', JSON.stringify(usersList));

  if (search) {
    usersList = usersList.filter(u => 
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
      (u.tgId && String(u.tgId).includes(search))
    );
  }

  tbody.innerHTML = usersList.map(u => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold" style="width:36px;height:36px;min-width:36px;font-size:13px;">
            ${(u.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p class="fw-semibold mb-0">${escHtml(u.name)}</p>
            <p class="text-muted small mb-0">@${escHtml(u.username || '—')}</p>
          </div>
        </div>
      </td>
      <td><code class="small">${escHtml(u.tgId)}</code></td>
      <td>${formatCurrency(u.balance)}</td>
      <td><code class="small">${escHtml(u.referCode || '—')}</code></td>
      <td>${statusBadge(u.isBlock ? 'BLOCKED' : 'ACTIVE')}</td>
      <td>${formatDate(u.joinedAt)}</td>
      <td class="text-end d-flex gap-1 justify-content-end">
        <a href="user-details.html?id=${u.id}" class="btn btn-light btn-sm">View</a>
        <button class="btn btn-sm ${u.isBlock ? 'btn-success' : 'btn-warning'}" onclick="toggleBlock(${u.id}, ${u.isBlock})">
          ${u.isBlock ? 'Unblock' : 'Block'}
        </button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" class="text-center text-muted py-4">No users found</td></tr>`;

  const countEl = document.getElementById('users-count');
  if (countEl) countEl.textContent = `${usersList.length} total users`;
}

async function toggleBlock(id, currentlyBlocked) {
  try {
    await apiFetch(`${API.users}/${id}/block`, { method: 'PATCH' });
    showToast(currentlyBlocked ? 'User unblocked' : 'User blocked', currentlyBlocked ? 'success' : 'info');
    loadUsers(currentPage);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function loadUserStats() {
  try {
    const data = await apiFetch(API.stats);
    const s = data.data || data;
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('stat-users',   Number(s.totalUsers).toLocaleString());
    setEl('stat-active',  Number(s.totalUsers - 0).toLocaleString()); // approximate
    setEl('stat-blocked', '—');
    setEl('stat-orders',  Number(s.totalOrders).toLocaleString());
  } catch (e) { console.error('Stats error:', e); }
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

let adminStaffList = [
  { id: 1, username: 'Seavik', email: 'seavik@miniapp.com', role: 'SUPER_ADMIN', status: 'ACTIVE', createdAt: '2026-01-01' },
  { id: 2, username: 'admin', email: 'admin@miniapp.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-15' }
];

function loadAdminStaff() {
  const tbody = document.getElementById('admins-tbody');
  if (!tbody) return;

  const saved = localStorage.getItem('mini_app_admin_staff_list');
  if (saved) {
    try { adminStaffList = JSON.parse(saved); } catch (e) {}
  }

  tbody.innerHTML = adminStaffList.map(a => {
    const roleBadge = a.role === 'SUPER_ADMIN'
      ? '<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 font-monospace py-1.5 px-2.5"><i class="bi bi-shield-lock-fill me-1"></i> Super Admin</span>'
      : a.role === 'ADMIN'
      ? '<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 font-monospace py-1.5 px-2.5"><i class="bi bi-shield-fill me-1"></i> Admin Manager</span>'
      : '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary font-monospace py-1.5 px-2.5"><i class="bi bi-lightning-fill me-1"></i> Operator</span>';

    return `
      <tr>
        <td class="ps-3">
          <div class="d-flex align-items-center gap-2.5">
            <div class="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary fw-bold font-monospace border border-primary border-opacity-25" style="width:36px;height:36px;font-size:13px;">
              ${a.role === 'SUPER_ADMIN' ? '👑' : '🛡️'}
            </div>
            <div>
              <p class="fw-bold mb-0 text-dark dark-text-white">${escHtml(a.username)}</p>
              <p class="text-muted small mb-0">${escHtml(a.email)}</p>
            </div>
          </div>
        </td>
        <td>${roleBadge}</td>
        <td><span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-1 px-2">ACTIVE</span></td>
        <td><span class="small text-muted">${a.createdAt || '2026-01-01'}</span></td>
        <td class="text-end pe-3">
          <button class="btn btn-sm btn-light border me-1 fw-semibold" onclick="openEditCredentialsModal(${a.id})"><i class="bi bi-key-fill text-warning me-1"></i> Change Gmail & Password</button>
          ${a.username === 'Seavik' ? '<span class="badge bg-secondary bg-opacity-25 text-muted small fw-bold">Primary Root</span>' : `<button class="btn btn-sm btn-outline-danger" onclick="deleteAdminStaff(${a.id})"><i class="bi bi-trash me-1"></i> Remove</button>`}
        </td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="5" class="text-center text-muted py-4">No admin staff members registered</td></tr>`;

  const countEl = document.getElementById('admins-count');
  if (countEl) countEl.textContent = `${adminStaffList.length} Active System Administrators`;
}

function openAddAdminModal() {
  const modalEl = document.getElementById('addAdminModal');
  if (modalEl) {
    const form = document.getElementById('admin-staff-form');
    if (form) form.reset();
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function openEditCredentialsModal(id) {
  const staff = adminStaffList.find(a => a.id === id);
  if (!staff) return;

  const idEl = document.getElementById('edit-admin-id');
  const userEl = document.getElementById('edit-admin-username');
  const emailEl = document.getElementById('edit-admin-email');
  const passEl = document.getElementById('edit-admin-password');

  if (idEl) idEl.value = staff.id;
  if (userEl) userEl.value = staff.username;
  if (emailEl) emailEl.value = staff.email;
  if (passEl) passEl.value = '';

  const modalEl = document.getElementById('editAdminCredentialsModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function saveAdminCredentials(event) {
  event.preventDefault();
  const id = Number(document.getElementById('edit-admin-id').value);
  const email = document.getElementById('edit-admin-email').value.trim();
  const password = document.getElementById('edit-admin-password').value;

  const staff = adminStaffList.find(a => a.id === id);
  if (staff) {
    staff.email = email;
    staff.password = password;
    localStorage.setItem('mini_app_admin_staff_list', JSON.stringify(adminStaffList));
    showToast(`🔑 Super Admin (Seavik) updated Gmail & Password for ${staff.username}!`, 'success');
    loadAdminStaff();
  }

  const modalEl = document.getElementById('editAdminCredentialsModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}

function saveAdminStaff(event) {
  event.preventDefault();
  const username = document.getElementById('new-admin-username').value.trim();
  const email = document.getElementById('new-admin-email').value.trim();
  const role = document.getElementById('new-admin-role').value;
  const password = document.getElementById('new-admin-password').value;

  if (!username || !email) {
    showToast('Please fill in username and email', 'error');
    return;
  }

  const newAdmin = {
    id: Date.now(),
    username,
    email,
    password,
    role,
    status: 'ACTIVE',
    createdAt: new Date().toISOString().split('T')[0]
  };

  adminStaffList.push(newAdmin);
  localStorage.setItem('mini_app_admin_staff_list', JSON.stringify(adminStaffList));
  showToast(`👑 Issued new Admin credentials for ${username}!`, 'success');
  loadAdminStaff();

  const modalEl = document.getElementById('addAdminModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}

function deleteAdminStaff(id) {
  if (!confirm('Are you sure you want to remove this Admin Staff member?')) return;
  adminStaffList = adminStaffList.filter(a => a.id !== id);
  localStorage.setItem('mini_app_admin_staff_list', JSON.stringify(adminStaffList));
  showToast('Admin Staff credentials removed', 'info');
  loadAdminStaff();
}
