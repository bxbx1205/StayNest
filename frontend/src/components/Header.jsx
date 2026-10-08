import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const path = location.pathname;

  const getLinkClasses = (linkPath) => {
    const isActive = path === linkPath;
    return isActive
      ? "transition-colors text-on-surface font-semibold"
      : "font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="h-20 max-w-[1360px] mx-auto px-gutter flex items-center justify-between">
        <div className="flex items-center gap-2 space-md">
          <Link to="/" className="font-headline-sm text-headline-sm text-on-surface tracking-tight hover:text-on-surface-variant transition-colors">
            StayNest
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className={getLinkClasses('/')}>Home</Link>
          <Link to="/rooms" className={getLinkClasses('/rooms')}>Rooms</Link>
          <Link to="/my-bookings" className={getLinkClasses('/my-bookings')}>My Bookings</Link>
          <Link to="/admin-dashboard" className={getLinkClasses('/admin-dashboard')}>Admin Dashboard</Link>
        </nav>
        <div className="flex items-center gap-4 space-md">
          <Link to="/rooms" className="hidden sm:inline-flex items-center justify-center bg-primary text-on-primary font-body-sm text-body-sm font-medium px-5 py-2.5 rounded-lg shadow-sm hover:bg-on-surface hover:text-on-primary transition-colors min-h-[44px]">
            Book a Stay
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
