import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [editRoomModal, setEditRoomModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Add Room form
  const [roomForm, setRoomForm] = useState({
    roomNo: '', type: 'Deluxe', name: '', description: '', price: '', maxGuests: 2, size: '', floor: '', amenities: '', image: '', status: 'available'
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, roomsRes] = await Promise.all([
        api.getStats(),
        api.getBookings({}),
        api.getRooms()
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);
    } catch (err) {
      showToast('Failed to load dashboard. Is the backend running?', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredBookings = bookings.filter(b => {
    const matchFilter = activeFilter === 'all' || b.status === activeFilter;
    const matchSearch = !searchQuery || b.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) || b.guestName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleCheckIn = async (booking) => {
    const res = await api.checkInBooking(booking._id);
    if (res.success) { showToast(res.message); fetchAll(); }
    else showToast(res.message, 'error');
  };

  const handleCheckOut = async (booking) => {
    const res = await api.checkOutBooking(booking._id);
    if (res.success) { showToast(res.message); fetchAll(); }
    else showToast(res.message, 'error');
  };

  const handleCancelBooking = async (booking) => {
    const res = await api.cancelBooking(booking._id);
    if (res.success) { showToast(res.message); fetchAll(); }
    else showToast(res.message, 'error');
  };

  const handleDeleteBooking = async (booking) => {
    if (!confirm(`Permanently delete booking #${booking.bookingId}?`)) return;
    const res = await api.deleteBooking(booking._id);
    if (res.success) { showToast(res.message); fetchAll(); }
    else showToast(res.message, 'error');
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const data = {
      ...roomForm,
      price: Number(roomForm.price),
      maxGuests: Number(roomForm.maxGuests),
      amenities: roomForm.amenities.split(',').map(a => a.trim()).filter(Boolean)
    };
    const res = await api.addRoom(data);
    if (res.success) {
      showToast(`Room ${data.roomNo} added successfully!`);
      setIsAddRoomModalOpen(false);
      setRoomForm({ roomNo: '', type: 'Deluxe', name: '', description: '', price: '', maxGuests: 2, size: '', floor: '', amenities: '', image: '', status: 'available' });
      fetchAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    const data = {
      ...editRoomModal,
      price: Number(editRoomModal.price),
      maxGuests: Number(editRoomModal.maxGuests),
      amenities: typeof editRoomModal.amenities === 'string' ? editRoomModal.amenities.split(',').map(a => a.trim()).filter(Boolean) : editRoomModal.amenities
    };
    const res = await api.updateRoom(editRoomModal._id, data);
    if (res.success) {
      showToast(`Room ${data.roomNo} updated!`);
      setEditRoomModal(null);
      fetchAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!confirm(`Delete Room ${room.roomNo}? This cannot be undone.`)) return;
    const res = await api.deleteRoom(room._id);
    if (res.success) { showToast(res.message); fetchAll(); }
    else showToast(res.message, 'error');
  };

  const handleRoomStatusChange = async (room, newStatus) => {
    const res = await api.updateRoom(room._id, { status: newStatus });
    if (res.success) { showToast(`Room ${room.roomNo} → ${newStatus}`); fetchAll(); }
    else showToast(res.message, 'error');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  const getStatusColor = (s) => {
    const map = { available: 'bg-secondary', occupied: 'bg-primary', maintenance: 'bg-tertiary-fixed-dim', housekeeping: 'bg-on-tertiary-container' };
    return map[s] || 'bg-outline';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant">
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="font-body-md text-body-md">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-[60] max-w-md">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-surface-container-lowest border-l-4 ${toast.type === 'success' ? 'border-secondary' : 'border-error'}`}>
            <span className={`material-symbols-outlined text-[20px] ${toast.type === 'success' ? 'text-secondary' : 'text-error'}`}>{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            <span className="font-body-sm text-body-sm text-on-surface flex-1">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <section className="w-full bg-surface-container-lowest shadow-sm">
        <div className="max-w-[1360px] mx-auto px-gutter py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Admin Dashboard
            </span>
            <span className="text-on-surface-variant font-body-sm text-body-sm hidden sm:inline">Live MongoDB Connection</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium hover:bg-surface-container transition-all shadow-sm min-h-[44px]" onClick={fetchAll}>
              <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-on-surface transition-all shadow-sm min-h-[44px]" onClick={() => setIsAddRoomModalOpen(true)}>
              <span className="material-symbols-outlined text-[18px]">add</span> Add Room
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-gutter w-full py-space-lg space-y-space-lg">
        {/* Stats Cards */}
        {stats && (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wide">Rooms</span>
                <span className="material-symbols-outlined text-[20px]">hotel</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">{stats.totalRooms}</div>
              <div className="text-secondary font-label-sm text-label-sm mt-1">Occupancy: {stats.occupancyRate}%</div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wide">Available</span>
                <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
              </div>
              <div className="font-headline-md text-headline-md text-secondary">{stats.availableRooms}</div>
              <div className="text-on-surface-variant font-label-sm text-label-sm mt-1">Ready for check-in</div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wide">Occupied</span>
                <span className="material-symbols-outlined text-[20px]">night_shelter</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">{stats.occupiedRooms}</div>
              <div className="text-on-surface-variant font-label-sm text-label-sm mt-1">{stats.maintenanceRooms} in maintenance</div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wide">Check-Ins</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">{stats.checkInsToday}</div>
              <div className="text-on-surface-variant font-label-sm text-label-sm mt-1">Today</div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wide">Bookings</span>
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">{stats.totalBookings}</div>
              <div className="text-secondary font-label-sm text-label-sm mt-1">{stats.activeBookings} active</div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wide">Revenue</span>
                <span className="material-symbols-outlined text-[20px] text-secondary">payments</span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface">₹{stats.monthRevenue.toLocaleString('en-IN')}</div>
              <div className="text-secondary font-label-sm text-label-sm mt-1">This month (paid)</div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Bookings Table */}
          <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Bookings ({bookings.length})</h2>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                  <input className="w-full bg-surface-bright rounded-lg pl-9 pr-4 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none shadow-sm" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-lg overflow-x-auto">
              {['all', 'confirmed', 'checked-in', 'completed', 'cancelled'].map(s => (
                <button key={s} className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors whitespace-nowrap ${activeFilter === s ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setActiveFilter(s)}>
                  {s === 'checked-in' ? 'Checked In' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md">
                    <th className="py-3 px-3 font-semibold">Booking</th>
                    <th className="py-3 px-3 font-semibold">Guest</th>
                    <th className="py-3 px-3 font-semibold">Room</th>
                    <th className="py-3 px-3 font-semibold">Dates</th>
                    <th className="py-3 px-3 font-semibold">Amount</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm text-on-surface">
                  {filteredBookings.length === 0 ? (
                    <tr><td colSpan="7" className="py-12 text-center text-on-surface-variant">No bookings match your filter.</td></tr>
                  ) : filteredBookings.map(b => (
                    <tr key={b._id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors border-b border-surface-container/50">
                      <td className="py-3 px-3 font-mono font-medium text-on-surface">#{b.bookingId}</td>
                      <td className="py-3 px-3">
                        <div className="font-title-sm text-title-sm text-on-surface">{b.guestName}</div>
                        <div className="text-on-surface-variant text-[12px]">{b.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium">{b.room?.roomNo || '—'}</div>
                        <div className="text-on-surface-variant text-[12px]">{b.room?.type}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div>{formatDate(b.checkIn)} – {formatDate(b.checkOut)}</div>
                      </td>
                      <td className="py-3 px-3 font-medium">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${b.status === 'confirmed' ? 'bg-secondary-container text-on-secondary-container' : b.status === 'checked-in' ? 'bg-surface-container-high text-on-surface' : b.status === 'cancelled' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'confirmed' ? 'bg-secondary' : b.status === 'checked-in' ? 'bg-primary' : b.status === 'cancelled' ? 'bg-error' : 'bg-outline'}`}></span>
                          {b.status}
                        </span>
                        <span className={`ml-1 text-[11px] ${b.paymentStatus === 'paid' ? 'text-secondary' : b.paymentStatus === 'refunded' ? 'text-on-surface-variant' : 'text-error'}`}>
                          ({b.paymentStatus})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {b.status === 'confirmed' && b.paymentStatus === 'paid' && (
                          <button className="px-2 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm mr-1 hover:bg-on-surface" onClick={() => handleCheckIn(b)}>Check In</button>
                        )}
                        {b.status === 'checked-in' && (
                          <button className="px-2 py-1 rounded bg-secondary text-on-secondary font-label-sm text-label-sm mr-1 hover:bg-on-secondary-fixed-variant" onClick={() => handleCheckOut(b)}>Check Out</button>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="px-2 py-1 rounded bg-error-container text-on-error-container font-label-sm text-label-sm mr-1 hover:bg-error" onClick={() => handleCancelBooking(b)}>Cancel</button>
                        )}
                        {(b.status === 'cancelled' || b.status === 'completed') && (
                          <button className="px-2 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-variant" onClick={() => handleDeleteBooking(b)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Room Inventory */}
          <section className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Room Inventory ({rooms.length})</h3>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-bright text-on-surface hover:bg-surface-container font-label-md text-label-md shadow-sm" onClick={() => setIsAddRoomModalOpen(true)}>
                <span className="material-symbols-outlined text-[16px]">add</span> Add
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-label-sm font-label-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span> Maintenance</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container"></span> Housekeeping</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {rooms.map(room => (
                <div key={room._id} className={`p-3 rounded-xl ${room.status === 'available' ? 'bg-secondary-container/30 hover:bg-secondary-container/50' : room.status === 'occupied' ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-tertiary-fixed/30 hover:bg-tertiary-fixed/50'} transition-colors cursor-pointer group`} onClick={() => { setEditRoomModal({...room, amenities: room.amenities.join(', ')}); }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-sm text-headline-sm text-on-surface">{room.roomNo}</span>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(room.status)}`}></span>
                  </div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">{room.status}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 text-[11px] leading-tight truncate">{room.type} · ₹{room.price.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl max-w-lg w-full p-space-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-space-sm">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add New Room</h3>
              <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant" onClick={() => setIsAddRoomModalOpen(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleAddRoom}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Room Number *</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="e.g. 301" value={roomForm.roomNo} onChange={e => setRoomForm({...roomForm, roomNo: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Type *</label>
                  <select className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})}>
                    <option>Deluxe</option><option>Executive</option><option>Presidential</option><option>Studio</option><option>Penthouse</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Room Name *</label>
                <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="e.g. Royal Garden Suite" value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Description</label>
                <textarea className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" rows="2" placeholder="Room description..." value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Price/Night (₹) *</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required type="number" min="0" placeholder="4500" value={roomForm.price} onChange={e => setRoomForm({...roomForm, price: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Max Guests *</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required type="number" min="1" max="10" value={roomForm.maxGuests} onChange={e => setRoomForm({...roomForm, maxGuests: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Size</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" placeholder="48 m²" value={roomForm.size} onChange={e => setRoomForm({...roomForm, size: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Floor</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" placeholder="Level 3" value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Status</label>
                  <select className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" value={roomForm.status} onChange={e => setRoomForm({...roomForm, status: e.target.value})}>
                    <option value="available">Available</option><option value="maintenance">Maintenance</option><option value="housekeeping">Housekeeping</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Amenities (comma-separated)</label>
                <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" placeholder="WiFi, AC, King Bed, Breakfast" value={roomForm.amenities} onChange={e => setRoomForm({...roomForm, amenities: e.target.value})} />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Image URL</label>
                <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" placeholder="https://..." value={roomForm.image} onChange={e => setRoomForm({...roomForm, image: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" className="flex-1 py-2.5 rounded-lg bg-surface-bright text-on-surface font-body-sm text-body-sm hover:bg-surface-container" onClick={() => setIsAddRoomModalOpen(false)}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-on-surface shadow-sm">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl max-w-lg w-full p-space-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-space-sm">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Edit Room {editRoomModal.roomNo}</h3>
              <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant" onClick={() => setEditRoomModal(null)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleUpdateRoom}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Room Number</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" value={editRoomModal.roomNo} onChange={e => setEditRoomModal({...editRoomModal, roomNo: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Type</label>
                  <select className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" value={editRoomModal.type} onChange={e => setEditRoomModal({...editRoomModal, type: e.target.value})}>
                    <option>Deluxe</option><option>Executive</option><option>Presidential</option><option>Studio</option><option>Penthouse</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Name</label>
                <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" value={editRoomModal.name} onChange={e => setEditRoomModal({...editRoomModal, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Price (₹)</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" type="number" value={editRoomModal.price} onChange={e => setEditRoomModal({...editRoomModal, price: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Status</label>
                  <select className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" value={editRoomModal.status} onChange={e => setEditRoomModal({...editRoomModal, status: e.target.value})}>
                    <option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option><option value="housekeeping">Housekeeping</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Amenities (comma-separated)</label>
                <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none" value={editRoomModal.amenities} onChange={e => setEditRoomModal({...editRoomModal, amenities: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" className="py-2.5 px-4 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm hover:bg-error" onClick={() => { handleDeleteRoom(editRoomModal); setEditRoomModal(null); }}>Delete Room</button>
                <div className="flex-1"></div>
                <button type="button" className="py-2.5 px-4 rounded-lg bg-surface-bright text-on-surface font-body-sm text-body-sm hover:bg-surface-container" onClick={() => setEditRoomModal(null)}>Cancel</button>
                <button type="submit" className="py-2.5 px-4 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-on-surface shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
