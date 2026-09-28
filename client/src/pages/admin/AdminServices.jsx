import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Layers, 
  IndianRupee, 
  Clock, 
  Sparkles,
  RefreshCw,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { servicesAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'Dry Cleaning',
  'Wash & Fold',
  'Steam Iron',
  'Premium Care',
  'Household',
  'Footwear',
];

const UNITS = ['Piece', 'Set', 'Pair', 'Kg', 'Sq Ft'];

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Dry Cleaning',
    price: '',
    unit: 'Piece',
    image: '',
    turnaroundTime: '24-48 Hours',
    isActive: true,
    popular: false,
  });
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await servicesAPI.getAll({
        includeInactive: true,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search,
      });
      if (res.success && res.services) {
        setServices(res.services);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      addToast('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: 'Dry Cleaning',
      price: '',
      unit: 'Piece',
      image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
      turnaroundTime: '24-48 Hours',
      isActive: true,
      popular: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      price: service.price,
      unit: service.unit || 'Piece',
      image: service.image || '',
      turnaroundTime: service.turnaroundTime || '24-48 Hours',
      isActive: service.isActive !== undefined ? service.isActive : true,
      popular: service.popular || false,
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      addToast('Image size exceeds 8MB. Please select a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
        addToast('Service image uploaded and optimized successfully! 📸', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price === '' || !formData.category) {
      addToast('Please provide service name, price, and category.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingService) {
        // Update
        const res = await servicesAPI.adminUpdate(editingService._id, formData);
        if (res.success) {
          addToast(`Service "${formData.name}" updated successfully!`, 'success');
          setIsModalOpen(false);
          fetchServices();
        }
      } else {
        // Create
        const res = await servicesAPI.adminCreate(formData);
        if (res.success) {
          addToast(`Service "${formData.name}" created successfully!`, 'success');
          setIsModalOpen(false);
          fetchServices();
        }
      }
    } catch (err) {
      console.error('Failed to save service:', err);
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const res = await servicesAPI.adminUpdate(service._id, {
        isActive: !service.isActive,
      });
      if (res.success) {
        addToast(`Service status updated to ${!service.isActive ? 'Active' : 'Inactive'}`, 'info');
        setServices((prev) =>
          prev.map((s) => (s._id === service._id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch (err) {
      addToast('Failed to update service status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await servicesAPI.adminDelete(id);
      if (res.success) {
        addToast(`Service "${name}" deleted.`, 'info');
        setServices((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete service', 'error');
    }
  };

  return (
    <AdminLayout title="Services & Pricing Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Catalog & Rate Card</h1>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>Add new dry cleaning offerings, update per-piece prices, and toggle visibility.</p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services List Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ marginTop: '0.5rem' }}>Loading services catalog...</p>
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Layers size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <h3>No services found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or add a new service.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Turnaround</th>
                  <th>Popular</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={service.image}
                          alt={service.name}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700 }}>{service.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{service.category}</span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      ₹{service.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {service.unit || 'Piece'}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{service.turnaroundTime || '24-48 Hours'}</td>
                    <td>
                      {service.popular ? (
                        <span className="badge badge-purple" style={{ display: 'inline-flex', gap: '0.2rem' }}>
                          <Sparkles size={12} /> Yes
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>No</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`badge ${service.isActive ? 'badge-success' : 'badge-danger'}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {service.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                          title="Edit Service"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id, service.name)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.65rem', color: 'var(--danger)' }}
                          title="Delete Service"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.name}` : 'Add New Cleaning Service'}
        maxWidth="620px"
      >
        <form onSubmit={handleSaveService}>
          <div className="form-group">
            <label className="form-label">Service Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Silk Saree Dry Cleaning"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (in INR ₹) *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="100"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pricing Unit</label>
              <select
                className="form-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    Per {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Standard Turnaround</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 24-48 Hours"
                value={formData.turnaroundTime}
                onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
              />
            </div>
          </div>

          {/* Service Image Upload & URL Section */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Service Image</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upload photo or paste URL</span>
            </label>

            {/* Upload from device card */}
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--bg-card-subtle)', textAlign: 'center', marginBottom: '0.75rem' }}>
              {formData.image ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      Image Selected
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Photo ready for this dry clean service.
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <label
                        htmlFor="service-image-file-input"
                        className="btn btn-outline btn-sm"
                        style={{ cursor: 'pointer', padding: '0.3rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Upload size={14} />
                        <span>Change Photo</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', color: 'var(--danger)' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.65rem auto' }}>
                    <Upload size={20} />
                  </div>
                  <label
                    htmlFor="service-image-file-input"
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}
                  >
                    <Upload size={14} />
                    <span>Upload Image from Device</span>
                  </label>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PNG, JPG, or WebP up to 8MB (Auto-optimized)
                  </div>
                </div>
              )}

              <input
                id="service-image-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Or direct URL fallback */}
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Or paste direct Image URL:
              </div>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <textarea
              className="form-textarea"
              placeholder="Detailed description of cleaning procedure, fabric care instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '2rem', margin: '1rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active Service (Visible to customers)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              />
              <span>Featured on Homepage</span>
            </label>
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
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminServices;
