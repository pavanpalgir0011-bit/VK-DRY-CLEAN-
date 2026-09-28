import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    deliveryFee, 
    gstAmount,
    gstRate,
    freeDeliveryThreshold,
    total, 
    clearCart 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      addToast('Please login to continue your order.', 'info');
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = freeDeliveryThreshold > 0 
    ? Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))
    : 100;

  if (cartItems.length === 0) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', maxWidth: '560px' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <ShoppingBag size={42} />
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Looks like you haven't added any garments or laundry services yet. Explore our services to schedule your pickup today!
          </p>
          <Link to="/services" className="btn btn-primary btn-lg">
            <span>Explore Services</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Your Laundry Cart</h1>
            <p>Review selected garments and schedule your doorstep pickup.</p>
          </div>
          <button onClick={clearCart} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
            Clear Cart
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.92rem' }}>
              <Truck size={18} color="var(--primary)" />
              {deliveryFee === 0 ? (
                <span style={{ color: 'var(--success)' }}>🎉 Congratulations! You unlocked Free Doorstep Pickup & Delivery!</span>
              ) : (
                <span>Add ₹{amountNeededForFreeDelivery} more to unlock <strong>Free Pickup & Delivery</strong></span>
              )}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
              {freeDeliveryPercent}%
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${freeDeliveryPercent}%`,
                height: '100%',
                background: deliveryFee === 0 ? 'var(--success)' : 'var(--primary)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.serviceId}
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{item.category}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    ₹{item.price} / {item.unit || 'Piece'}
                  </div>
                </div>

                {/* Quantity adjuster */}
                <div className="qty-controller">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Item Total */}
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.serviceId)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem', marginTop: '0.25rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <Link
              to="/services"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem' }}
            >
              <ArrowLeft size={16} />
              <span>Add more services to cart</span>
            </Link>
          </div>

          {/* Order Summary Card */}
          <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotal}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span>Pickup & Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                ) : (
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{deliveryFee}</span>
                )}
              </div>

              {gstRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span>Applicable GST ({gstRate}%)</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{gstAmount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span>Fabric Sanitization</span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '1rem', borderTop: '2px dashed var(--border-color)', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Grand Total</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                ₹{total}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontSize: '1.05rem', padding: '1rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {!isAuthenticated && (
              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
                * You will be prompted to login/signup to complete checkout.
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <ShieldCheck size={18} color="var(--success)" />
              <span>Safe & Contactless Doorstep Collection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
