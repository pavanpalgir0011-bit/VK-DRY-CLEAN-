import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, ShoppingBag, Package, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/services"
        className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
      >
        <Layers size={22} />
        <span>Services</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
      >
        <div style={{ position: 'relative', display: 'flex' }}>
          <ShoppingBag size={22} />
          {itemCount > 0 && <span className="bottom-nav-badge">{itemCount}</span>}
        </div>
        <span>Cart</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/orders' : '/login?redirect=/orders'}
        className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
      >
        <Package size={22} />
        <span>Orders</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/profile' : '/login?redirect=/profile'}
        className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
      >
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
