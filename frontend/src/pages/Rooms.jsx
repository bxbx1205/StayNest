import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [modalRoom, setModalRoom] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  // Search / filter state
  const [searchType, setSearchType] = useState('all');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsFilter, setGuestsFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState(12000);
  const [sortBy, setSortBy] = useState('recommended');

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    guestName: '', email: '', phone: '', guests: 1, specialRequests: ''
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    method: 'card', cardNumber: '', nameOnCard: '', expiry: '', cvv: '', upiId: ''
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getDefaultDates = () => {
    const now = new Date();
    const ci = new Date(now); ci.setDate(ci.getDate() + 3);
    const co = new Date(ci); co.setDate(co.getDate() + 3);
    return {
      checkIn: ci.toISOString().split('T')[0],
      checkOut: co.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    const defaults = getDefaultDates();
    setCheckIn(defaults.checkIn);
    setCheckOut(defaults.checkOut);
    fetchRooms();
  }, []);

  const fetchRooms = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.searchRooms(params);
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err) {
      showToast('Failed to load rooms. Is the backend running?', 'error');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = {};
    if (searchType !== 'all') params.type = searchType;
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (guestsFilter) params.guests = guestsFilter;
    if (maxPrice < 12000) params.maxPrice = maxPrice;
    fetchRooms(params);
  };

  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const openBookingModal = (room) => {
    if (!checkIn || !checkOut) {
      showToast('Please select check-in and check-out dates first.', 'error');
      return;
    }
    setBookingForm({ guestName: '', email: '', phone: '', guests: 1, specialRequests: '' });
    setBookingModal(room);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createBooking({
        room: bookingModal._id,
        checkIn, checkOut,
        ...bookingForm
      });
      if (res.success) {
        setBookingModal(null);
        setPaymentModal({ booking: res.data, breakdown: res.breakdown });
        showToast(`Booking ${res.data.bookingId} created! Proceed to payment.`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Booking failed. Please try again.', 'error');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);
    try {
      const res = await api.processPayment({
        bookingId: paymentModal.booking._id,
        amount: paymentModal.breakdown.totalAmount,
        method: paymentForm.method,
        cardNumber: paymentForm.cardNumber,
        upiId: paymentForm.upiId,
        nameOnCard: paymentForm.nameOnCard
      });
      if (res.success) {
        showToast(`Payment of ₹${paymentModal.breakdown.totalAmount.toLocaleString('en-IN')} successful! TXN: ${res.data.transactionId}`, 'success');
        setPaymentModal(null);
        setPaymentForm({ method: 'card', cardNumber: '', nameOnCard: '', expiry: '', cvv: '', upiId: '' });
        handleSearch(); // refresh availability
      } else {
        showToast(res.message || 'Payment failed.', 'error');
      }
    } catch (err) {
      showToast('Payment processing error.', 'error');
    }
    setPaymentProcessing(false);
  };

  const availableCount = rooms.filter(r => r.isAvailable !== false).length;

  return (
    <div className="flex flex-col w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-[60] max-w-md">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-surface-container-lowest border-l-4 ${toast.type === 'success' ? 'border-secondary' : toast.type === 'error' ? 'border-error' : 'border-primary'}`}>
            <span className={`material-symbols-outlined text-[20px] ${toast.type === 'success' ? 'text-secondary' : toast.type === 'error' ? 'text-error' : 'text-primary'}`}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface flex-1">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header + Search */}
      <section className="relative w-full bg-surface-container-lowest pb-space-lg overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-gutter pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Private Suites & Residences
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Find your perfect room</h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-2">Search live availability, book instantly, and pay securely — all connected to our backend.</p>
            </div>
            <div className="hidden md:flex items-center gap-4 bg-surface-container-low px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">cloud_done</span>
                <div>
                  <div className="font-title-sm text-title-sm text-on-surface leading-tight">Live MongoDB</div>
                  <div className="font-label-sm text-label-sm text-secondary">{rooms.length} rooms loaded</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-sm">
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center" onSubmit={handleSearch}>
              <div className="lg:col-span-2 flex flex-col px-3 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">hotel</span> Type
                </label>
                <select className="bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer mt-0.5" value={searchType} onChange={e => setSearchType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Executive">Executive</option>
                  <option value="Presidential">Presidential</option>
                  <option value="Studio">Studio</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                <div className="flex flex-col px-3 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span> Check-In
                  </label>
                  <input className="bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer mt-0.5" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
                </div>
                <div className="flex flex-col px-3 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">event</span> Check-Out
                  </label>
                  <input className="bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer mt-0.5" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col px-3 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">group</span> Guests
                </label>
                <select className="bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer mt-0.5" value={guestsFilter} onChange={e => setGuestsFilter(e.target.value)}>
                  <option value="">Any</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
              <div className="lg:col-span-2 flex flex-col px-3 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">payments</span> Max ₹{maxPrice.toLocaleString('en-IN')}
                </label>
                <input className="w-full mt-1 accent-black cursor-pointer" type="range" min="2000" max="12000" step="500" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
              </div>
              <div className="lg:col-span-2">
                <button className="w-full h-full min-h-[52px] bg-primary text-on-primary hover:bg-on-surface transition-colors rounded-lg font-title-sm text-title-sm flex items-center justify-center gap-2 shadow-sm" type="submit">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Room Listing */}
      <section className="max-w-[1360px] mx-auto px-gutter w-full py-8">
        {/* Toolbar */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="font-headline-sm text-headline-sm text-on-surface">{availableCount}</span>
            <span className="font-body-md text-body-md text-on-surface-variant ml-1.5">of {rooms.length} rooms available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">sort</span>
              <select className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="recommended">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
              <button className={`p-1 rounded ${viewMode === 'grid' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setViewMode('grid')}>
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button className={`p-1 rounded ${viewMode === 'list' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setViewMode('list')}>
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="font-body-md text-body-md">Loading rooms from database...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 block">hotel</span>
            <p className="font-headline-sm text-headline-sm text-on-surface mb-2">No rooms found</p>
            <p className="font-body-md text-body-md">Try adjusting your search criteria or run the seed script.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-6'}>
            {sortedRooms.map(room => {
              const isAvailable = room.isAvailable !== false && room.status === 'available';
              return (
                <article key={room._id} className={`bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'} overflow-hidden group ${!isAvailable ? 'opacity-80' : ''}`}>
                  <div className={`relative ${viewMode === 'list' ? 'w-1/3' : 'w-full h-56'} overflow-hidden bg-surface-container`}>
                    <img alt={room.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!isAvailable ? 'grayscale-[20%]' : ''}`} src={room.image} />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container-lowest/90 backdrop-blur-md ${isAvailable ? 'text-secondary font-medium' : 'text-error font-medium'} shadow-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-secondary' : 'bg-error'}`}></span>
                        {isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded font-label-sm text-label-sm text-on-surface">
                      Room {room.roomNo} · {room.floor}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant uppercase">{room.type}</span>
                        <div className="flex items-center gap-3 text-on-surface-variant font-label-md text-label-md">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">group</span> {room.maxGuests}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">square_foot</span> {room.size}</span>
                        </div>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{room.name}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">{room.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {room.amenities.map(am => (
                          <span key={am} className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-label-sm text-label-sm">{am}</span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between mt-2">
                      <div>
                        <span className="font-headline-md text-headline-md text-on-surface">₹{room.price.toLocaleString('en-IN')}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant"> / night</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors" onClick={() => setModalRoom(room)}>Details</button>
                        {isAvailable ? (
                          <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-on-surface transition-colors shadow-sm" onClick={() => openBookingModal(room)}>Book Now</button>
                        ) : (
                          <span className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Room Details Modal */}
      {modalRoom && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModalRoom(null)}>
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors" onClick={() => setModalRoom(null)}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">Room {modalRoom.roomNo}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{modalRoom.type}</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">{modalRoom.name}</h2>
            <div className="font-title-md text-title-md text-secondary mt-1">₹{modalRoom.price.toLocaleString('en-IN')} / night</div>
            <div className="mt-4 rounded-lg overflow-hidden h-52 bg-surface-container">
              <img alt={modalRoom.name} className="w-full h-full object-cover" src={modalRoom.image} />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4">{modalRoom.description}</p>
            <div className="grid grid-cols-4 gap-3 my-4">
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <div className="font-label-sm text-label-sm text-on-surface-variant">Size</div>
                <div className="font-title-sm text-title-sm text-on-surface">{modalRoom.size}</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <div className="font-label-sm text-label-sm text-on-surface-variant">Floor</div>
                <div className="font-title-sm text-title-sm text-on-surface">{modalRoom.floor}</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <div className="font-label-sm text-label-sm text-on-surface-variant">Guests</div>
                <div className="font-title-sm text-title-sm text-on-surface">Up to {modalRoom.maxGuests}</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <div className="font-label-sm text-label-sm text-on-surface-variant">Status</div>
                <div className={`font-title-sm text-title-sm ${modalRoom.status === 'available' ? 'text-secondary' : 'text-error'}`}>{modalRoom.status}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-title-sm text-title-sm hover:bg-surface-variant" onClick={() => setModalRoom(null)}>Close</button>
              {modalRoom.isAvailable !== false && modalRoom.status === 'available' && (
                <button className="px-5 py-2 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-on-surface" onClick={() => { setModalRoom(null); openBookingModal(modalRoom); }}>Book This Room</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBookingModal(null)}>
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-variant" onClick={() => setBookingModal(null)}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Book {bookingModal.name}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Room {bookingModal.roomNo} · ₹{bookingModal.price.toLocaleString('en-IN')}/night · {checkIn} → {checkOut}</p>

            <form className="space-y-4" onSubmit={handleBookingSubmit}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Full Name *</label>
                <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="Rahul Sharma" value={bookingForm.guestName} onChange={e => setBookingForm({...bookingForm, guestName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Email *</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required type="email" placeholder="guest@email.com" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Phone *</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="+91 98765 43210" value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Number of Guests *</label>
                <select className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" value={bookingForm.guests} onChange={e => setBookingForm({...bookingForm, guests: Number(e.target.value)})}>
                  {Array.from({length: bookingModal.maxGuests}, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Special Requests</label>
                <textarea className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" rows="2" placeholder="Late check-in, dietary needs, etc." value={bookingForm.specialRequests} onChange={e => setBookingForm({...bookingForm, specialRequests: e.target.value})}></textarea>
              </div>
              <div className="p-3 bg-surface-container rounded-lg font-body-sm text-body-sm text-on-surface">
                <div className="flex justify-between"><span>Room rate × {Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)} nights</span><span>₹{(bookingModal.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-on-surface-variant"><span>GST (12%)</span><span>₹{Math.round(bookingModal.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000) * 0.12).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-title-sm text-title-sm pt-2 border-t border-outline-variant/20 mt-2"><span>Total</span><span>₹{Math.round(bookingModal.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000) * 1.12).toLocaleString('en-IN')}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" className="flex-1 py-2.5 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm hover:bg-surface-variant" onClick={() => setBookingModal(null)}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-on-surface">Create Booking & Pay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-variant" onClick={() => !paymentProcessing && setPaymentModal(null)}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-secondary text-[24px]">lock</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Secure Payment</h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Booking #{paymentModal.booking.bookingId} · ₹{paymentModal.breakdown.totalAmount.toLocaleString('en-IN')}</p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['card', 'upi', 'netbanking'].map(m => (
                    <label key={m} className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg cursor-pointer border transition-colors ${paymentForm.method === m ? 'border-primary bg-surface-container-low' : 'border-outline-variant/30 bg-surface-bright hover:bg-surface-container-low'}`}>
                      <input type="radio" name="payMethod" className="sr-only" checked={paymentForm.method === m} onChange={() => setPaymentForm({...paymentForm, method: m})} />
                      <span className="material-symbols-outlined text-[18px]">{m === 'card' ? 'credit_card' : m === 'upi' ? 'phone_android' : 'account_balance'}</span>
                      <span className="font-label-md text-label-md">{m === 'card' ? 'Card' : m === 'upi' ? 'UPI' : 'Net Banking'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {paymentForm.method === 'card' && (
                <>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1">Card Number</label>
                    <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="4242 4242 4242 4242" maxLength="19" value={paymentForm.cardNumber} onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1">Name on Card</label>
                    <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="RAHUL SHARMA" value={paymentForm.nameOnCard} onChange={e => setPaymentForm({...paymentForm, nameOnCard: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1">Expiry</label>
                      <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="MM/YY" maxLength="5" value={paymentForm.expiry} onChange={e => setPaymentForm({...paymentForm, expiry: e.target.value})} />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1">CVV</label>
                      <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="•••" type="password" maxLength="4" value={paymentForm.cvv} onChange={e => setPaymentForm({...paymentForm, cvv: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {paymentForm.method === 'upi' && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">UPI ID</label>
                  <input className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" required placeholder="yourname@paytm" value={paymentForm.upiId} onChange={e => setPaymentForm({...paymentForm, upiId: e.target.value})} />
                </div>
              )}

              {paymentForm.method === 'netbanking' && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Select Bank</label>
                  <select className="w-full bg-surface-bright border border-outline-variant/40 rounded-lg px-3.5 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra</option>
                  </select>
                </div>
              )}

              <div className="p-3 rounded-lg bg-surface-container font-body-sm text-body-sm flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] mt-0.5 text-secondary">info</span>
                <span>This is a <b>dummy payment gateway</b> for demo purposes. Use card <code>4000000000000002</code> to simulate a declined payment.</span>
              </div>

              <button type="submit" disabled={paymentProcessing} className={`w-full py-3 rounded-lg font-title-sm text-title-sm flex items-center justify-center gap-2 shadow-sm transition-colors ${paymentProcessing ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-on-surface'}`}>
                {paymentProcessing ? (
                  <><div className="w-5 h-5 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin"></div> Processing...</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">lock</span> Pay ₹{paymentModal.breakdown.totalAmount.toLocaleString('en-IN')}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
