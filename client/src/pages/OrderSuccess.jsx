import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Home, Calendar, MapPin, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ordersAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    // Fire festive celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn('Confetti effect ignored:', e);
    }

    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          const res = await ordersAPI.getOrderById(orderId);
          if (res.success && res.order) {
            setOrder(res.order);
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <p>Loading order confirmation details...</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="card" style={{ padding: '3rem 2.5rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 0 10px rgba(16, 185, 129, 0.15)',
            }}
          >
            <CheckCircle2 size={48} />
          </div>

          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Order Placed Successfully 🎉</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Thank you for booking with JKM Dry Clean! Your clothes are in good hands.
          </p>

          {/* Details Card */}
          <div
            style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              textAlign: 'left',
              marginBottom: '2.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order ID
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {order?.orderId || orderId}
                </div>
              </div>
              <StatusBadge status={order?.status || 'Order Placed'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.92rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Customer Name</span>
                <div style={{ fontWeight: 600 }}>{order?.customer?.name || 'Customer'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Amount</span>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>
                  ₹{order?.total || '0'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Order Date</span>
                <div style={{ fontWeight: 600 }}>
                  {order?.createdAt ? new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Scheduled Pickup</span>
                <div style={{ fontWeight: 600 }}>
                  {order?.pickupDate} ({order?.pickupTime})
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment Method</span>
                <div style={{ fontWeight: 600 }}>
                  {order?.paymentMethod || 'Cash on Delivery'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Items</span>
                <div style={{ fontWeight: 600 }}>
                  {order?.items?.length || 0} Garment Category(s)
                </div>
              </div>
            </div>

            {order?.pickupAddress && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <MapPin size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  {order.pickupAddress.address}, {order.pickupAddress.city} - {order.pickupAddress.pincode}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to={`/orders/${order?.orderId || orderId}`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <span>Track Order Live</span>
              <ArrowRight size={18} />
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link to="/orders" className="btn btn-outline">
                <Package size={16} />
                <span>View My Orders</span>
              </Link>
              <Link to="/" className="btn btn-outline">
                <Home size={16} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
