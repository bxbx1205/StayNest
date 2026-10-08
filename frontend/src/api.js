const API_BASE = 'http://localhost:5000/api';

const api = {
  // ── Rooms ──
  getRooms: () =>
    fetch(`${API_BASE}/rooms`).then(r => r.json()),

  searchRooms: (params) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/rooms/search?${qs}`).then(r => r.json());
  },

  getRoomById: (id) =>
    fetch(`${API_BASE}/rooms/${id}`).then(r => r.json()),

  addRoom: (data) =>
    fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateRoom: (id, data) =>
    fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteRoom: (id) =>
    fetch(`${API_BASE}/rooms/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // ── Bookings ──
  getBookings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/bookings?${qs}`).then(r => r.json());
  },

  getMyBookings: (email) =>
    fetch(`${API_BASE}/bookings/my/${encodeURIComponent(email)}`).then(r => r.json()),

  getBookingById: (id) =>
    fetch(`${API_BASE}/bookings/${id}`).then(r => r.json()),

  createBooking: (data) =>
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  cancelBooking: (id) =>
    fetch(`${API_BASE}/bookings/${id}/cancel`, { method: 'PUT' }).then(r => r.json()),

  checkInBooking: (id) =>
    fetch(`${API_BASE}/bookings/${id}/checkin`, { method: 'PUT' }).then(r => r.json()),

  checkOutBooking: (id) =>
    fetch(`${API_BASE}/bookings/${id}/checkout`, { method: 'PUT' }).then(r => r.json()),

  deleteBooking: (id) =>
    fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE' }).then(r => r.json()),

  getStats: () =>
    fetch(`${API_BASE}/bookings/stats`).then(r => r.json()),

  // ── Payments ──
  processPayment: (data) =>
    fetch(`${API_BASE}/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  refundPayment: (bookingId) =>
    fetch(`${API_BASE}/payments/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    }).then(r => r.json()),
};

export default api;
