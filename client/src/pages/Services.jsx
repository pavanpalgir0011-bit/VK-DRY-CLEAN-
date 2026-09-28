import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, Sparkles, Clock, Check, RefreshCw } from 'lucide-react';
import { servicesAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  'All',
  'Dry Cleaning',
  'Wash & Fold',
  'Steam Iron',
  'Premium Care',
  'Household',
  'Footwear',
];

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, updateQuantity, cartItems } = useCart();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await servicesAPI.getAll({
          category: activeCategory !== 'All' ? activeCategory : undefined,
          search: searchQuery || undefined,
        });
        if (res.success && res.services) {
          setServices(res.services);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchServices();
    }, 200);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (category) => {
    if (category === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  const getItemCartQuantity = (serviceId) => {
    const item = cartItems.find((i) => i.serviceId === serviceId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Pricing & Catalog</span>
          <h1 className="section-title">Our Cleaning & Care Services</h1>
          <p className="section-desc">
            Transparent per-piece pricing with door-to-door pickup. Select the services you need and we will handle the rest.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
            <Search
              size={20}
              color="var(--text-light)"
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '48px', borderRadius: 'var(--radius-full)' }}
              placeholder="Search services (e.g. Dry Clean, Saree, Suit, Iron)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <div className="filter-tabs" style={{ justifyContent: 'center' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RefreshCw size={32} className="spin" color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem' }}>Loading services from database...</p>
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <Sparkles size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3>No services found</h3>
            <p style={{ marginTop: '0.5rem' }}>Try adjusting your search query or selecting another category.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('All');
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1.25rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => {
              const inCartQty = getItemCartQuantity(service._id);
              return (
                <div key={service._id} className="service-card">
                  <Link to={`/services/${service._id}`} className="service-img-wrapper" style={{ display: 'block' }}>
                    <img src={service.image} alt={service.name} className="service-img" />
                    <span className="service-category-tag">{service.category}</span>
                  </Link>

                  <div className="service-content">
                    <Link to={`/services/${service._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="service-title">{service.name}</h3>
                    </Link>

                    <div className="service-turnaround" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      <Clock size={13} />
                      <span>{service.turnaroundTime || '24-48h'}</span>
                    </div>

                    <p className="service-desc">{service.description}</p>

                    <div className="service-footer">
                      <div className="service-price">
                        <span className="price-label">Price</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                          <span className="price-value">₹{service.price}</span>
                          <span className="price-unit">/{service.unit || 'Pc'}</span>
                        </div>
                      </div>

                      <div className="service-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Link to={`/services/${service._id}`} className="btn btn-outline btn-sm">
                          Details
                        </Link>
                        {inCartQty > 0 ? (
                          <div className="qty-controller">
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(service._id, inCartQty - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="qty-value">{inCartQty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(service._id, inCartQty + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(service, 1)}
                            className="btn btn-primary btn-sm service-add-btn"
                            aria-label={`Add ${service.name} to cart`}
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
