import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2,
  Truck
} from 'lucide-react';
import { servicesAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await servicesAPI.getById(id);
        if (res.success && res.service) {
          setService(res.service);
        }
      } catch (err) {
        console.error('Failed to get service details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleAddToCart = () => {
    if (service) {
      addToCart(service, quantity);
    }
  };

  const handleBuyNow = () => {
    if (service) {
      addToCart(service, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <p>Loading service information...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <h3>Service not found</h3>
        <p style={{ marginTop: '0.5rem' }}>The requested service is not available or has been removed.</p>
        <Link to="/services" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb / Back button */}
        <Link
          to="/services"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontWeight: 600 }}
        >
          <ArrowLeft size={18} />
          <span>Back to Services</span>
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
          {/* Image */}
          <div style={{ position: 'relative' }}>
            <img
              src={service.image}
              alt={service.name}
              style={{
                width: '100%',
                maxHeight: '480px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
              }}
            />
            <span
              className="service-category-tag"
              style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
            >
              {service.category}
            </span>
          </div>

          {/* Details & Action */}
          <div>
            <span className="section-tag">{service.category}</span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', marginTop: '0.25rem' }}>{service.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  ₹{service.price}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
                  / {service.unit || 'Piece'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
                <Clock size={16} />
                <span>Turnaround: {service.turnaroundTime || '24-48 Hours'}</span>
              </div>
            </div>

            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {service.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Select Quantity:</span>
                <div className="qty-controller">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Total: ₹{service.price * quantity}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, minWidth: '180px' }}
                >
                  <ShoppingBag size={20} />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-secondary btn-lg"
                  style={{ flex: 1, minWidth: '180px' }}
                >
                  <span>Proceed to Cart</span>
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={18} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>Zero Shrinkage</h5>
                  <p style={{ fontSize: '0.8rem' }}>Controlled temperature processing</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Truck size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>Free Pickup</h5>
                  <p style={{ fontSize: '0.8rem' }}>On orders ₹499 and above</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <Sparkles size={18} color="var(--purple)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>Steam Finish</h5>
                  <p style={{ fontSize: '0.8rem' }}>Hand inspection before delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
