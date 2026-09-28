import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Calendar, 
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Detail Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCustomers(search);
      if (res.success && res.customers) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCustomerDetails = async (id) => {
    setSelectedCustomerId(id);
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await adminAPI.getCustomerById(id);
      if (res.success) {
        setCustomerDetails(res);
      }
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <AdminLayout title="Customer Accounts & History">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Registered Customers</h1>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>Customer registry with lifetime order counts, address records, and total revenue.</p>
        </div>

        <button onClick={fetchCustomers} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ marginTop: '0.5rem' }}>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Users size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <h3>No customers found</h3>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{cust.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cust.city || 'Delhi'}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{cust.email}</td>
                    <td>{cust.phone || 'N/A'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(cust.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className="badge badge-primary">{cust.totalOrders} Orders</span>
                    </td>
                    <td style={{ fontWeight: 800 }}>₹{cust.totalSpent.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenCustomerDetails(cust._id)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Eye size={14} />
                        <span>View Orders</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail & Orders History Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customer Profile & Order History"
        maxWidth="720px"
      >
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p>Loading customer profile and order history...</p>
          </div>
        ) : customerDetails ? (
          <div>
            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{customerDetails.customer?.name}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{customerDetails.customer?.email}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{customerDetails.customer?.phone || 'No phone'}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lifetime Value</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  ₹{customerDetails.stats?.totalSpent?.toLocaleString('en-IN') || 0}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {customerDetails.stats?.totalOrders || 0} Total Bookings
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ padding: '0.85rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <strong>Registered Address:</strong> {customerDetails.customer?.address || 'Not saved yet'}, {customerDetails.customer?.city} {customerDetails.customer?.pincode}
            </div>

            {/* Orders list */}
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Past Orders</h4>

            {customerDetails.orders?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No orders placed by this customer yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                {customerDetails.orders.map((o) => (
                  <div
                    key={o._id}
                    style={{
                      padding: '0.85rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{o.orderId}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {o.items?.length} Services
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 800 }}>₹{o.total}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
};

export default AdminCustomers;
