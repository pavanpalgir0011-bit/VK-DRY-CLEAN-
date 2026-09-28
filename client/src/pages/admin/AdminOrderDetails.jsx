import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  RotateCw, 
  Check, 
  Banknote,
  RefreshCw,
  HelpCircle,
  Receipt
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ordersAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import OrderTimeline from '../../components/orders/OrderTimeline';
import InvoiceModal from '../../components/orders/InvoiceModal';
import { useToast } from '../../context/ToastContext';

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

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [updating, setUpdating] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const { addToast } = useToast();

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.adminGetById(id);
      if (res.success && res.order) {
        setOrder(res.order);
        setSelectedStatus(res.order.status);
        setPaymentStatus(res.order.paymentStatus || 'Pending');
      }
    } catch (err) {
      console.error('Failed to get admin order details:', err);
      addToast(err.message || 'Failed to fetch order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendInvoiceEmail = async () => {
    if (!order) return;
    setSendingEmail(true);
    try {
      const res = await ordersAPI.adminSendInvoice(order.orderId);
      if (res.success) {
        addToast(res.message || 'Tax Invoice emailed to customer successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to email invoice to customer', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!order) return;

    setUpdating(true);
    try {
      const res = await ordersAPI.adminUpdateStatus(order.orderId, {
        status: selectedStatus,
        note: statusNote || `Status updated to ${selectedStatus} by admin team.`,
        paymentStatus,
      });

      if (res.success && res.order) {
        setOrder(res.order);
        setStatusNote('');
        addToast(`Order ${order.orderId} moved to "${selectedStatus}"`, 'success');
        if (selectedStatus === 'Delivered') {
          addToast('Tax Invoice automatically emailed to customer!', 'success');
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      addToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order Details">
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <p style={{ marginTop: '0.75rem' }}>Loading full order record...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Not Found">
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h3>Order {id} could not be located.</h3>
          <Link to="/admin/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order Details: ${order.orderId}`}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/admin/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600 }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0284c7' }}
          >
            <Receipt size={15} />
            <span>Tax Invoice</span>
          </button>
          <button
            onClick={handleSendInvoiceEmail}
            disabled={sendingEmail}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Email official Tax Invoice PDF/HTML directly to customer"
          >
            <Mail size={15} />
            <span>{sendingEmail ? 'Sending Invoice...' : 'Email Invoice'}</span>
          </button>
          <StatusBadge status={order.status} />
          <button onClick={fetchOrder} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Status Management & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Status Update Card */}
          <div className="card" style={{ padding: '1.75rem', border: '2px solid var(--primary-light)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCw size={18} color="var(--primary)" />
              <span>Update Order Lifecycle</span>
            </h3>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Next Stage in Timeline</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ fontWeight: 700 }}
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
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Action Note</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rider dispatched, or QC passed..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.75rem' }}
              >
                {updating ? 'Saving Changes...' : 'Save & Notify Customer'}
              </button>
            </form>
          </div>

          {/* Timeline History */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              Complete Order Status History
            </h3>

            <OrderTimeline
              currentStatus={order.status}
              statusHistory={order.statusHistory || []}
            />
          </div>
        </div>

        {/* Right Column: Customer & Order Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Details */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              Customer Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700 }}>{order.customer?.name}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={18} color="var(--primary)" />
                <span>{order.customer?.phone || 'No phone provided'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={18} color="var(--primary)" />
                <span>{order.customer?.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Doorstep Address:</div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {order.pickupAddress?.address}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {order.pickupAddress?.city} - {order.pickupAddress?.pincode}, {order.pickupAddress?.state}
                  </div>
                  {order.pickupAddress?.landmark && (
                    <div style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>
                      Landmark: {order.pickupAddress.landmark}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} color="var(--primary)" />
                <div>
                  <strong>Scheduled Slot:</strong> {order.pickupDate} ({order.pickupTime})
                </div>
              </div>
            </div>
          </div>

          {/* Garments Breakdown */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              Garments & Invoicing
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} {item.unit || 'Piece'} × ₹{item.price}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Pickup & Delivery Fee</span>
                {order.deliveryFee === 0 ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span> : <span>₹{order.deliveryFee}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', fontWeight: 800, fontSize: '1.2rem' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <strong>Payment:</strong> {order.paymentMethod} • <span style={{ fontWeight: 700, color: order.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--warning)' }}>{order.paymentStatus}</span>
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
    </AdminLayout>
  );
};

export default AdminOrderDetails;
