import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Sparkles, Package, ChevronDown, MapPin, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(true);
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar glass">
        <div className="container nav-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-icon">
              <Sparkles size={20} />
            </div>
            <span>JKM Dry Clean</span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Contact
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  My Orders
                </NavLink>
              </li>
            )}
          </ul>

          {/* Nav Actions */}
          <div className="nav-actions">
            {/* Search shortcut button */}
            <Link to="/services" className="nav-search-btn" aria-label="Search services">
              <Search size={18} />
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="cart-btn" aria-label="Shopping Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </Link>

            {/* Auth State (if logged in, show user dropdown; login/signup are inside the menu drawer) */}
            {isAuthenticated && (
              <div className="user-menu">
                <button
                  className="user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User Account Menu"
                >
                  <User size={18} color="#2563eb" />
                  <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={14} />
                </button>

                <div className={`user-dropdown ${userDropdownOpen ? 'show' : ''}`}>
                  <div style={{ padding: '0.4rem 0.85rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/orders"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Package size={16} />
                    <span>My Orders</span>
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/services" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              All Services
            </Link>
            <Link to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              About Us
            </Link>
            <Link to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Contact Us
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  My Orders
                </Link>
                <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  My Profile
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
