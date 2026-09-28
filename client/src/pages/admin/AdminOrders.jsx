import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  RotateCw, 
  Check, 
  X, 
  RefreshCw,
  MapPin,
  Clock,
  User,
  ShoppingBag,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ordersAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import OrderTimeline from '../../components/orders/OrderTimeline';
import InvoiceModal from '../../components/orders/InvoiceModal';
import { useToast } from '../../context/ToastContext';

const STATUSES = [
  'All',
  'Order Placed',
  'Order Accepted',
  'Pickup Assigned',
  'Picked Up',
  'At Store',
  'Processing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const ORDER_STAGES_LIST = [
  'Order Placed',
  'Order Accepted',
  'Pickup Assigned',
  'Picked Up',
  'At Store',
  'Processing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Order for quick modal management
  const [activeOrder, setActiveOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [updating, setUpdating] = useState(false);

  const { addToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.adminGetAll({
        search,
        status: selectedStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders for admin:', err);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, startDate, endDate]);

  const handleOpenOrderModal = (order) => {
    setActiveOrder(order);
    setNewStatus(order.status);
    setPaymentStatus(order.paymentStatus || 'Pending');
    setStatusNote('');
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;

    setUpdating(true);
    try {
      const res = await ordersAPI.adminUpdateStatus(activeOrder.orderId, {
        status: newStatus,
        note: statusNote || `Status updated to "${newStatus}" by admin team.`,
        paymentStatus,
      });

      if (res.success && res.order) {
        addToast(`Order ${activeOrder.orderId} updated to ${newStatus}`, 'success');
        setActiveOrder(res.order);
        // Refresh local orders list
        setOrders((prev) =>
          prev.map((o) => (o.orderId === activeOrder.orderId ? res.order : o))
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      addToast(err.message || 'Status update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout title="Order Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>All Customer Orders</h1>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>Track lifecycle, assign pickups, update stages, and view invoices.</p>
        </div>

        <button onClick={fetchOrders} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search ID, name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Filter from date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Filter to date"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ marginTop: '0.5rem' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <ShoppingBag size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <h3>No orders found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Scheduled Pickup</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{order.orderId}</td>
                    <td style={{ fontWeight: 600 }}>{order.customer?.name}</td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      <div>{order.customer?.phone || 'N/A'}</div>
                      <div style={{ fontSize: '0.78rem' }}>{order.customer?.email}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600 }}>{order.pickupDate}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{order.pickupTime}</div>
                    </td>
                    <td>
                      <span className="badge badge-muted" style={{ fontWeight: 600 }}>
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} Pcs ({order.items.length} types)
                      </span>
                    </td>
                    <td style={{ fontWeight: 800 }}>₹{order.total}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            setInvoiceOrder(order);
                            setIsInvoiceOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0284c7' }}
                          title="Tax Invoice"
                        >
                          <Receipt size={14} />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => handleOpenOrderModal(order)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          Update Status
                        </button>
                        <Link
                          to={`/admin/orders/${order.orderId}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                          title="Full Details"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Management & Status Transition Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update Order: ${activeOrder?.orderId}`}
        maxWidth="680px"
      >
        {activeOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Customer</span>
                <div style={{ fontWeight: 700 }}>{activeOrder.customer?.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>{activeOrder.customer?.phone}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Current Status</span>
                <div>
                  <StatusBadge status={activeOrder.status} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <strong>Pickup Location:</strong> {activeOrder.pickupAddress.address}, {activeOrder.pickupAddress.city} - {activeOrder.pickupAddress.pincode}
            </div>

            {/* Update Form */}
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label">Move Status along 10-Stage Timeline</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  {ORDER_STAGES_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Pending">Pending (Not Paid)</option>
                    <option value="Paid">Paid (Cash / UPI collected)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Status Note / Update</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rider Rahul assigned, or Fabric in wash cycle 2..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary"
                >
                  {updating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </AdminLayout>
  );
};

export default AdminOrders;
