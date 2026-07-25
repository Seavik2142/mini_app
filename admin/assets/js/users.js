/**
 * admin/assets/js/users.js
 * Loads real users from API into users.html
 */
let currentPage = 1;
const PAGE_SIZE = 20;

document.addEventListener('DOMContentLoaded', () => {
  loadUsers(currentPage);

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

  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading...</td></tr>`;

  try {
    let url = `${API.users}?page=${page}&limit=${PAGE_SIZE}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const data = await apiFetch(url);
    const { users = [], total = 0, totalPages = 1 } = data.data || data;

    tbody.innerHTML = users.map(u => `
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

    // Pagination
    if (paginationEl) {
      paginationEl.innerHTML = '';
      if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
          const li = document.createElement('li');
          li.className = `page-item ${i === page ? 'active' : ''}`;
          li.innerHTML = `<button class="page-link" onclick="loadUsers(${i})">${i}</button>`;
          paginationEl.appendChild(li);
        }
      }
    }

    // Update count
    const countEl = document.getElementById('users-count');
    if (countEl) countEl.textContent = `${total} total users`;

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error: ${e.message}</td></tr>`;
  }
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

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
