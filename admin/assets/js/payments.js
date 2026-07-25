/**
 * admin/assets/js/payments.js
 * Loads real orders/payments from API into payments.html
 */
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => loadOrders(1));

async function loadOrders(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('payments-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Loading...</td></tr>`;

  try {
    const data = await apiFetch(`${API.orders}?page=${page}&limit=20`);
    const { orders = [], total = 0, totalPages = 1 } = data.data || data;

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><span class="fw-semibold">#${escHtml(o.orderNumber)}</span></td>
        <td>${escHtml(o.user?.name || '—')}</td>
        <td>${formatCurrency(o.totalAmount)}</td>
        <td><span class="badge bg-light text-dark border">${escHtml(o.paymentMethod)}</span></td>
        <td>${statusBadge(o.paymentStatus)}</td>
        <td>
          <select class="form-select form-select-sm" style="width:140px" onchange="updateOrderStatus(${o.id}, this.value)">
            ${['PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s =>
              `<option value="${s}" ${o.orderStatus === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </td>
        <td>${formatDate(o.createdAt)}</td>
      </tr>
    `).join('') || `<tr><td colspan="7" class="text-center text-muted py-4">No orders yet</td></tr>`;

    // Pagination
    const paginationEl = document.getElementById('orders-pagination');
    if (paginationEl && totalPages > 1) {
      paginationEl.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === page ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link" onclick="loadOrders(${i})">${i}</button>`;
        paginationEl.appendChild(li);
      }
    }

    const countEl = document.getElementById('orders-count');
    if (countEl) countEl.textContent = `${total} total orders`;

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error: ${e.message}</td></tr>`;
  }
}

async function updateOrderStatus(id, status) {
  try {
    await apiFetch(`${API.orders}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus: status })
    });
    showToast(`Order status updated to ${status}`);
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

function escHtml(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
