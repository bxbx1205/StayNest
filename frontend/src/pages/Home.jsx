import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Home = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState({ show: false, text: '', type: 'success' });
  const [modalRoom, setModalRoom] = useState(null);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  
  // Search state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [type, setType] = useState('all');

  const showToast = (message, type = 'success') => {
    setToastMessage({ show: true, text: message, type });
    setTimeout(() => {
      setToastMessage({ show: false, text: '', type: 'success' });
    }, 4000);
  };

  useEffect(() => {
    const now = new Date();
    const ci = new Date(now); ci.setDate(ci.getDate() + 3);
    const co = new Date(ci); co.setDate(co.getDate() + 3);
    setCheckIn(ci.toISOString().split('T')[0]);
    setCheckOut(co.toISOString().split('T')[0]);

    // Load featured rooms from API
    api.getRooms().then(res => {
      if (res.success && res.data.length > 0) {
        // Just take the first 3 rooms for the homepage
        setFeaturedRooms(res.data.slice(0, 3));
      }
    }).catch(err => console.error(err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);
    if (type && type !== 'all') params.append('type', type);
    navigate(`/rooms?${params.toString()}`);
  };

  const handleInstantBook = (room) => {
    navigate('/rooms');
  };

  const toggleFavorite = (e, roomName) => {
    const icon = e.currentTarget.querySelector('.material-symbols-outlined');
    const isFilled = icon.style.fontVariationSettings?.includes("'FILL' 1");
    if (isFilled) {
      icon.style.fontVariationSettings = "'FILL' 0";
      icon.classList.remove('text-error');
      showToast(`Removed ${roomName} from your saved retreats.`, 'info');
    } else {
      icon.style.fontVariationSettings = "'FILL' 1";
      icon.classList.add('text-error');
      showToast(`Added ${roomName} to your curated wishlist.`, 'success');
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Notification Toast Container */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toastMessage.show && (
          <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-on-surface bg-surface-container-lowest border-l-4 ${toastMessage.type === 'success' ? 'border-secondary' : toastMessage.type === 'info' ? 'border-primary' : 'border-error'} transition-all max-w-md`}>
            <span className={`material-symbols-outlined text-[20px] ${toastMessage.type === 'success' ? 'text-secondary' : toastMessage.type === 'info' ? 'text-primary' : 'text-error'}`}>
              {toastMessage.type === 'success' ? 'check_circle' : toastMessage.type === 'info' ? 'info' : 'error'}
            </span>
            <div className="font-body-sm text-body-sm flex-1">{toastMessage.text}</div>
            <button onClick={() => setToastMessage({ show: false, text: '', type: 'success' })} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
      </div>

      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img alt="StayNest luxury hotel exterior at dusk" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGa6Q8xL_x0K5V1K4s9R2H-t_009N5x409s8O7_N6Jm2K9J2CjR2R-v2D9Zc9P-mR052V6nB1o4Y9-bX5t9qN594185U2t_9F7m40K12F2w85-8gL_b36pD8H8l2C_K_W9Y334b3fD3P6cR1vP9M6pG131qL_7Y7rQ" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/95 via-surface-container-lowest/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-gutter w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 backdrop-blur-md text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest mb-6 border border-outline-variant/30">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              The Art of Hospitality
            </div>
            <h1 className="font-display-hero text-display-hero text-on-surface mb-6">Find a stay <span className="italic font-serif text-secondary-fixed-dim block">worth remembering.</span></h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">Discover comfortable rooms, transparent pricing, and effortless booking crafted for the architectural connoisseur.</p>
            
            <div className="flex flex-wrap items-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-[24px] text-secondary">verified</span>
                <span className="font-label-md text-label-md">Direct Concierge</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-[24px] text-secondary">lock_open</span>
                <span className="font-label-md text-label-md">Zero Hidden Markups</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-[24px] text-secondary">star</span>
                <span className="font-label-md text-label-md">4.98/5 Guest Rating</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-gutter max-w-[1360px] mx-auto">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 p-2 sm:p-4">
            <form className="grid grid-cols-1 md:grid-cols-5 gap-3" onSubmit={handleSearchSubmit}>
              <div className="bg-surface-bright rounded-lg p-3 group transition-colors hover:bg-surface-container-low cursor-pointer">
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Check-In Date</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">calendar_today</span>
                  <input className="w-full bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
                </div>
              </div>
              <div className="bg-surface-bright rounded-lg p-3 group transition-colors hover:bg-surface-container-low cursor-pointer">
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Check-Out Date</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">event</span>
                  <input className="w-full bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
                </div>
              </div>
              <div className="bg-surface-bright rounded-lg p-3 group transition-colors hover:bg-surface-container-low">
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Guests</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">group</span>
                  <select className="w-full bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer" value={guests} onChange={e => setGuests(e.target.value)}>
                    <option value="1">1 Adult</option>
                    <option value="2">2 Adults</option>
                    <option value="3">3 Adults</option>
                    <option value="4">4 Guests</option>
                  </select>
                </div>
              </div>
              <div className="bg-surface-bright rounded-lg p-3 group transition-colors hover:bg-surface-container-low">
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Type</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">bed</span>
                  <select className="w-full bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer" value={type} onChange={e => setType(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Executive">Executive</option>
                    <option value="Presidential">Presidential</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col justify-end h-full">
                <button className="w-full h-full min-h-[52px] bg-primary text-on-primary rounded-lg font-title-sm text-title-sm flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-all" type="submit">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Search Rooms</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-[1360px] mx-auto px-gutter py-24 w-full mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-3">Accommodation Portfolio</div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Explore Our Featured Rooms</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-3">Quiet luxury defined by spacious proportions, hand-selected finishes, and uncompromised modern amenities.</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant/50 text-on-surface font-title-sm text-title-sm hover:bg-surface-container-low transition-colors" onClick={() => navigate('/rooms')}>
            View All Inventory <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredRooms.map(room => (
            <article key={room._id} className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/20">
              <div className="relative h-64 overflow-hidden bg-surface-container">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                  <button className="bg-surface-container-lowest/90 backdrop-blur-md text-on-surface px-6 py-3 rounded-full font-title-sm text-title-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-500" onClick={() => setModalRoom(room)}>
                    View Details
                  </button>
                </div>
                <img alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={room.image} />
                <div className="absolute top-4 right-4 z-20">
                  <button className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center shadow-sm text-on-surface-variant hover:text-error transition-colors" onClick={(e) => toggleFavorite(e, room.name)}>
                    <span className="material-symbols-outlined text-[20px] transition-all" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm uppercase tracking-wide shadow-sm">
                    {room.type}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">{room.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm mb-4 pb-4 border-b border-outline-variant/20">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">square_foot</span> {room.size}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">group</span> Up to {room.maxGuests} Guests</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-6 flex-1">
                  {room.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {room.amenities.slice(0, 4).map(am => (
                    <div key={am} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant">
                      <span className="font-label-sm text-label-sm">{am}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Starting from</div>
                    <div className="font-headline-md text-headline-md text-on-surface">₹{room.price.toLocaleString('en-IN')}<span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/night</span></div>
                  </div>
                  <button className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-on-surface transition-colors shadow-sm" onClick={() => handleInstantBook(room)}>
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      
      {/* Room Details Modal */}
      {modalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setModalRoom(null)}>
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-300"></div>
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shadow-sm" onClick={() => setModalRoom(null)}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-surface-container">
              <img alt={modalRoom.name} className="absolute inset-0 w-full h-full object-cover" src={modalRoom.image} />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm uppercase tracking-wide">{modalRoom.type}</span>
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wide">Room {modalRoom.roomNo}</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">{modalRoom.name}</h2>
              <div className="flex gap-4 text-on-surface-variant font-body-sm text-body-sm mb-6 pb-4 border-b border-outline-variant/20">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">square_foot</span> {modalRoom.size}</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">group</span> Up to {modalRoom.maxGuests} Guests</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                {modalRoom.description}
              </p>
              <div className="mb-8">
                <h4 className="font-title-sm text-title-sm text-on-surface mb-4">Room Amenities</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {modalRoom.amenities.map(am => (
                    <div key={am} className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[18px] text-secondary">check</span> {am}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="font-headline-md text-headline-md text-on-surface">₹{modalRoom.price.toLocaleString('en-IN')}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">per night, excluding taxes</div>
                </div>
                <button className="px-6 py-3 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-on-surface transition-colors shadow-sm" onClick={() => { setModalRoom(null); navigate('/rooms'); }}>
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
