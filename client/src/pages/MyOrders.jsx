import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, ArrowRight, Eye, RefreshCw, ShoppingBag } from 'lucide-react';
import { ordersAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

const TABS = ['All', 'Active', 'Completed', 'Cancelled'];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await ordersAPI.getMyOrders(activeTab);
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to load my orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>My Orders</h1>
            <p>Track live statuses and view your complete dry cleaning history.</p>
          </div>
          <Link to="/services" className="btn btn-primary btn-sm">
            <span>Book New Service</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs" style={{ marginBottom: '2rem' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ marginTop: '0.75rem' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Package size={48} color="var(--primary)" style={{ opacity: 0.6, marginBottom: '1rem' }} />
            <h3>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders found</h3>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} laundry or dry cleaning bookings.
            </p>
            <Link to="/services" className="btn btn-primary">
              <ShoppingBag size={18} />
              <span>Explore Services & Book Pickup</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <div key={order._id} className="card card-hover" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                        {order.orderId}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} />
                        Placed on {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} />
                        Pickup: {order.pickupDate} ({order.pickupTime})
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Total Amount
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      ₹{order.total}
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.82rem',
                          background: 'var(--bg-card-subtle)',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                      >
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>

                  <Link to={`/orders/${order.orderId}`} className="btn btn-outline btn-sm">
                    <Eye size={16} />
                    <span>View Details / Track Order</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
