import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FloatingCartBar = () => {
  const { itemCount, total } = useCart();
  const location = useLocation();

  // Do not show on cart or checkout pages
  const hiddenPaths = ['/cart', '/checkout', '/order-success', '/admin'];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));

  if (itemCount === 0 || shouldHide) {
    return null;
  }

  return (
    <div className="floating-cart-wrapper">
      <Link to="/cart" className="floating-cart-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="floating-cart-icon">
            <ShoppingBag size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
              {itemCount} {itemCount === 1 ? 'Garment' : 'Garments'} Added
            </div>
            <div style={{ fontSize: '0.8rem', color: '#e0f2fe' }}>
              Total: ₹{total} • Doorstep Pickup
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
          <span>View Cart</span>
          <ArrowRight size={16} />
        </div>
      </Link>
    </div>
  );
};

export default FloatingCartBar;
