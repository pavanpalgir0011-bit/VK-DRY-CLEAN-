import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp, 
  IndianRupee, 
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStats();
      if (res.success) {
        setStats(res.stats);
        setRecentOrders(res.recentOrders || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout title="Operational Dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Welcome to VK Dry Clean Operations</h1>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>Real-time metrics, pickup scheduling, and processing statuses.</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <p style={{ marginTop: '0.75rem' }}>Loading operations metrics...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards Grid */}
          <div className="stat-grid">
            {/* Total Revenue */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                <IndianRupee size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-val">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <ShoppingBag size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Orders</span>
                <span className="stat-val">{stats?.totalOrders || 0}</span>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Pending / Pickup</span>
                <span className="stat-val">{stats?.pendingOrders || 0}</span>
              </div>
            </div>

            {/* Processing Orders */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--purple-light)', color: 'var(--purple)' }}>
                <RotateCw size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">In Processing</span>
                <span className="stat-val">{stats?.processingOrders || 0}</span>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Delivered</span>
                <span className="stat-val">{stats?.completedOrders || 0}</span>
              </div>
            </div>

            {/* Cancelled Orders */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
                <XCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Cancelled</span>
                <span className="stat-val">{stats?.cancelledOrders || 0}</span>
              </div>
            </div>

            {/* Total Customers */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Registered Clients</span>
                <span className="stat-val">{stats?.totalCustomers || 0}</span>
              </div>
            </div>
          </div>

          {/* Status Distribution Summary Visual Bar */}
          {stats?.statusBreakdown && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Order Distribution Overview</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(stats.statusBreakdown).map(([statusName, count]) => (
                  <div
                    key={statusName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.85rem',
                      background: 'var(--bg-card-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <StatusBadge status={statusName} />
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Recent Orders</h3>
              <Link to="/admin/orders" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>View All Orders</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{order.orderId}</td>
                        <td style={{ fontWeight: 600 }}>{order.customer?.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{order.customer?.phone || 'N/A'}</td>
                        <td style={{ fontWeight: 700 }}>₹{order.total}</td>
                        <td>
                          <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <Link to={`/admin/orders/${order.orderId}`} className="btn btn-outline btn-sm">
                            <Eye size={14} />
                            <span>Manage</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
