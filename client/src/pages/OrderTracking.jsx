import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  ShieldCheck, 
  RefreshCw,
  ShoppingBag,
  HelpCircle,
  Receipt
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import OrderTimeline from '../components/orders/OrderTimeline';
import StatusBadge from '../components/common/StatusBadge';
import InvoiceModal from '../components/orders/InvoiceModal';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ordersAPI.getOrderById(id);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.message || 'Failed to find order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        <p style={{ marginTop: '0.75rem' }}>Loading order tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <h3>Unable to load order</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{error || 'Order not found or permission denied.'}</p>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        {/* Navigation / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link
            to="/orders"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600 }}
          >
            <ArrowLeft size={16} />
            <span>Back to My Orders</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7' }}
            >
              <Receipt size={14} />
              <span>Tax Invoice</span>
            </button>
            <button
              onClick={fetchOrder}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Order Summary Header Bar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Order Tracking
              </span>
              <h1 style={{ fontSize: '2rem', margin: '0.15rem 0' }}>{order.orderId}</h1>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <StatusBadge status={order.status} />
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  ₹{order.total}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Visual Timeline Left, Details Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left Column: Visual Order Timeline */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              Live Order Progress
            </h3>

            <OrderTimeline
              currentStatus={order.status}
              statusHistory={order.statusHistory || []}
            />

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <HelpCircle size={20} color="var(--primary)" />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Have questions regarding your order? Reach our customer helpline at <strong>+91 98765 43210</strong>.
              </div>
            </div>
          </div>

          {/* Right Column: Garment Items & Address info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Garments in this order */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                Garments ({order.items.length} Category(s))
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} {item.unit || 'Piece'} × ₹{item.price}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Doorstep Pickup & Delivery</span>
                  {order.deliveryFee === 0 ? (
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  ) : (
                    <span>₹{order.deliveryFee}</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', fontWeight: 800, fontSize: '1.15rem' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Pickup & Payment Details */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                Pickup & Delivery Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Pickup Address</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {order.pickupAddress.address}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {order.pickupAddress.city} - {order.pickupAddress.pincode}, {order.pickupAddress.state}
                    </div>
                    {order.pickupAddress.landmark && (
                      <div style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>
                        Landmark: {order.pickupAddress.landmark}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Calendar size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Scheduled Slot</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {order.pickupDate} ({order.pickupTime})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Payment Mode</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {order.paymentMethod} • <span style={{ fontWeight: 600, color: order.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--warning)' }}>{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div style={{ padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                    <strong>Special Instructions:</strong> {order.specialInstructions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      <InvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};

export default OrderTracking;
