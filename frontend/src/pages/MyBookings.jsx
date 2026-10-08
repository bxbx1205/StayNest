import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [folioModal, setFolioModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (searchQuery) params.q = searchQuery;
      const res = await api.getBookings(params);
      if (res.success) setBookings(res.data);
    } catch (err) {
      showToast('Failed to fetch bookings. Is the backend running?', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [activeTab]);

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchBookings();
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      const res = await api.cancelBooking(cancelModal._id);
      if (res.success) {
        showToast(`Booking ${cancelModal.bookingId} cancelled. Refund of ₹${cancelModal.totalAmount.toLocaleString('en-IN')} initiated.`, 'success');
        setCancelModal(null);
        fetchBookings();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Cancellation failed.', 'error');
    }
  };

  const handleCheckIn = async (booking) => {
    try {
      const res = await api.checkInBooking(booking._id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchBookings();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Check-in failed.', 'error');
    }
  };

  const handleCheckOut = async (booking) => {
    try {
      const res = await api.checkOutBooking(booking._id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchBookings();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Check-out failed.', 'error');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const getNights = (ci, co) => Math.ceil((new Date(co) - new Date(ci)) / 86400000);

  const getStatusBadge = (status, paymentStatus) => {
    const map = {
      confirmed: { bg: 'bg-secondary-container/40', text: 'text-on-secondary-container', dot: 'bg-secondary', label: 'Confirmed' },
      'checked-in': { bg: 'bg-surface-container-high', text: 'text-on-surface', dot: 'bg-primary', label: 'Checked In' },
      completed: { bg: 'bg-surface-container', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Completed' },
      cancelled: { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error', label: paymentStatus === 'refunded' ? 'Cancelled · Refunded' : 'Cancelled' }
    };
    const s = map[status] || map.confirmed;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${s.bg} ${s.text}`}>
        {status === 'confirmed' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
        )}
        {status !== 'confirmed' && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>}
        {s.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-[60] max-w-md">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-surface-container-lowest border-l-4 ${toast.type === 'success' ? 'border-secondary' : toast.type === 'error' ? 'border-error' : 'border-primary'}`}>
            <span className={`material-symbols-outlined text-[20px] ${toast.type === 'success' ? 'text-secondary' : toast.type === 'error' ? 'text-error' : 'text-primary'}`}>
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface flex-1">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-[1360px] mx-auto px-gutter">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest mb-space-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Guest Folio & Stays
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Bookings</h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
                All bookings from MongoDB — manage, cancel, check-in/out in real time.
              </p>
            </div>
            <Link to="/rooms" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-on-surface transition-colors shadow-sm self-start md:self-auto">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Booking
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1360px] w-full mx-auto px-gutter py-space-lg">
        {/* Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm mb-space-md">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'confirmed', 'checked-in', 'completed', 'cancelled'].map(tab => (
              <button key={tab} className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${activeTab === tab ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`} onClick={() => setActiveTab(tab)}>
                {tab === 'checked-in' ? 'Checked In' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <form className="flex items-center gap-2" onSubmit={handleSearch}>
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
              <input className="w-full bg-surface pl-9 pr-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest" placeholder="Search by ID or name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button type="submit" className="px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </form>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="font-body-md text-body-md">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-space-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px]">hotel</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No bookings found</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-space-md">
              {activeTab !== 'all' ? `No ${activeTab} bookings. Try a different filter.` : 'Start by booking a room!'}
            </p>
            <Link to="/rooms" className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-body-sm text-body-sm font-medium hover:bg-on-surface transition-colors">
              Explore Rooms <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-space-md">
            {bookings.map(booking => (
              <article key={booking._id} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                {/* Booking Header Bar */}
                <div className="p-space-sm px-space-md flex flex-wrap items-center justify-between gap-space-xs bg-surface-container-low/50">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">#{booking.bookingId}</span>
                    {getStatusBadge(booking.status, booking.paymentStatus)}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm ${booking.paymentStatus === 'paid' ? 'bg-secondary-container/30 text-secondary' : booking.paymentStatus === 'refunded' ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                      {booking.paymentStatus === 'paid' ? '💰 Paid' : booking.paymentStatus === 'refunded' ? '↩ Refunded' : '⏳ Pending'}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Booked {formatDate(booking.createdAt)}</span>
                </div>

                {/* Booking Body */}
                <div className="p-space-md">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                    {/* Room Image */}
                    <div className={`md:col-span-4 relative group overflow-hidden rounded-lg aspect-[16/10] bg-surface-container ${booking.status === 'cancelled' ? 'grayscale opacity-70' : ''}`}>
                      {booking.room?.image ? (
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={booking.room.image} alt={booking.room.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[48px]">hotel</span>
                        </div>
                      )}
                      <span className="absolute bottom-2.5 left-2.5 bg-primary/80 backdrop-blur-md text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded-md">
                        Room {booking.room?.roomNo} · {booking.room?.floor}
                      </span>
                    </div>

                    {/* Booking Details */}
                    <div className="md:col-span-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h2 className="font-headline-sm text-headline-sm text-on-surface">{booking.room?.name || 'Room'}</h2>
                          <div className="text-right shrink-0">
                            <div className="font-headline-sm text-headline-sm text-on-surface">₹{booking.totalAmount.toLocaleString('en-IN')}</div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">{booking.room?.type}</div>
                          </div>
                        </div>

                        {/* Check-in / Check-out dates */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs my-space-sm p-space-sm rounded-lg bg-surface">
                          <div>
                            <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Check-In</div>
                            <div className="font-title-sm text-title-sm text-on-surface">{formatDate(booking.checkIn)}</div>
                          </div>
                          <div>
                            <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Check-Out</div>
                            <div className="font-title-sm text-title-sm text-on-surface">{formatDate(booking.checkOut)}</div>
                          </div>
                          <div>
                            <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Nights</div>
                            <div className="font-title-sm text-title-sm text-on-surface">{getNights(booking.checkIn, booking.checkOut)}</div>
                          </div>
                          <div>
                            <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Guests</div>
                            <div className="font-title-sm text-title-sm text-on-surface">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</div>
                          </div>
                        </div>

                        {/* Guest info */}
                        <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-body-sm text-body-sm">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> {booking.guestName}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">email</span> {booking.email}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> {booking.phone}</span>
                        </div>

                        {booking.specialRequests && (
                          <div className="mt-2 p-2 rounded bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant italic">
                            💬 "{booking.specialRequests}"
                          </div>
                        )}

                        {booking.transactionId && (
                          <div className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
                            {booking.paymentMethod} · TXN: {booking.transactionId}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-space-sm pt-space-sm border-t border-outline-variant/20 flex flex-wrap items-center justify-end gap-2">
                        {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                          <span className="mr-auto font-label-sm text-label-sm text-error flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">warning</span> Payment pending
                          </span>
                        )}

                        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface hover:bg-surface-container font-body-sm text-body-sm text-on-surface transition-colors" onClick={() => setFolioModal(booking)}>
                          <span className="material-symbols-outlined text-[16px]">receipt_long</span> Folio
                        </button>

                        {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-on-surface transition-colors" onClick={() => handleCheckIn(booking)}>
                            <span className="material-symbols-outlined text-[16px]">login</span> Check In
                          </button>
                        )}

                        {booking.status === 'checked-in' && (
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-on-secondary font-body-sm text-body-sm font-medium hover:bg-on-secondary-fixed-variant transition-colors" onClick={() => handleCheckOut(booking)}>
                            <span className="material-symbols-outlined text-[16px]">logout</span> Check Out
                          </button>
                        )}

                        {(booking.status === 'confirmed' || (booking.status === 'confirmed' && booking.paymentStatus === 'pending')) && (
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error-container/40 text-error font-body-sm text-body-sm font-medium hover:bg-error-container transition-colors" onClick={() => setCancelModal(booking)}>
                            <span className="material-symbols-outlined text-[16px]">cancel</span> Cancel
                          </button>
                        )}

                        {booking.status === 'completed' && (
                          <Link to="/rooms" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-on-surface transition-colors">
                            <span className="material-symbols-outlined text-[16px]">restart_alt</span> Rebook
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl p-space-lg shadow-xl">
            <div className="w-12 h-12 rounded-full bg-error-container/60 text-error flex items-center justify-center mb-space-sm">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Cancel Booking?</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Are you sure you want to cancel <b>#{cancelModal.bookingId}</b> for <b>{cancelModal.room?.name}</b>?
            </p>
            <div className="p-space-sm rounded-lg bg-surface-container-low mb-space-md font-body-sm text-body-sm text-on-surface">
              <div className="flex justify-between py-1 border-b border-surface-container"><span className="text-on-surface-variant">Original Amount</span><span>₹{cancelModal.totalAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between py-1 border-b border-surface-container"><span className="text-on-surface-variant">Cancellation Fee</span><span className="text-secondary font-medium">₹0 (Free)</span></div>
              <div className="flex justify-between py-1 font-title-sm text-title-sm pt-2"><span>Refund Amount</span><span className="text-secondary">₹{cancelModal.paymentStatus === 'paid' ? cancelModal.totalAmount.toLocaleString('en-IN') : '0'}</span></div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-lg bg-surface text-on-surface font-body-sm text-body-sm font-medium hover:bg-surface-container transition-colors" onClick={() => setCancelModal(null)}>Keep Booking</button>
              <button className="flex-1 py-2.5 rounded-lg bg-error text-on-error font-body-sm text-body-sm font-medium hover:bg-on-error-container transition-colors" onClick={handleCancel}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Folio Modal */}
      {folioModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl p-space-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-space-sm">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Booking Folio</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">#{folioModal.bookingId}</p>
              </div>
              <button className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant" onClick={() => setFolioModal(null)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface border-t border-surface-container pt-space-sm">
              <div className="flex justify-between"><span className="text-on-surface-variant">Guest</span><span className="font-medium">{folioModal.guestName}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Email</span><span>{folioModal.email}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Phone</span><span>{folioModal.phone}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Room</span><span className="font-medium">{folioModal.room?.name} ({folioModal.room?.roomNo})</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Stay</span><span>{formatDate(folioModal.checkIn)} – {formatDate(folioModal.checkOut)} ({getNights(folioModal.checkIn, folioModal.checkOut)} nights)</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Status</span><span className="font-medium capitalize">{folioModal.status}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Payment</span><span className="font-medium capitalize">{folioModal.paymentStatus}</span></div>
              {folioModal.transactionId && <div className="flex justify-between"><span className="text-on-surface-variant">Transaction</span><span className="font-mono text-[12px]">{folioModal.transactionId}</span></div>}
            </div>
            <div className="mt-space-md pt-space-sm border-t border-surface-container">
              <table className="w-full font-body-sm text-body-sm">
                <thead>
                  <tr className="text-left text-on-surface-variant font-label-sm text-label-sm border-b border-surface-container">
                    <th className="pb-2">Description</th><th className="pb-2 text-right">Qty</th><th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface">
                  <tr>
                    <td className="py-2">{folioModal.room?.type} Room Nightly</td>
                    <td className="py-2 text-right">{getNights(folioModal.checkIn, folioModal.checkOut)}</td>
                    <td className="py-2 text-right">₹{(folioModal.room?.price * getNights(folioModal.checkIn, folioModal.checkOut)).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2">GST (12%)</td>
                    <td className="py-2 text-right">1</td>
                    <td className="py-2 text-right">₹{(folioModal.totalAmount - folioModal.room?.price * getNights(folioModal.checkIn, folioModal.checkOut)).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="font-title-sm text-title-sm border-t border-surface-container">
                    <td className="pt-3">Total</td><td></td>
                    <td className="pt-3 text-right">₹{folioModal.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-space-md flex justify-end">
              <button className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm hover:bg-surface-variant" onClick={() => setFolioModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
