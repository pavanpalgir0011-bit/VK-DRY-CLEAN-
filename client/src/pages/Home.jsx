import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Truck, 
  CheckCircle, 
  Calendar, 
  ShoppingBag, 
  Layers, 
  Search,
  Plus,
  Minus,
  Star,
  Shirt,
  Wind,
  Footprints,
  BedDouble,
  Crown
} from 'lucide-react';
import { servicesAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const QUICK_CATEGORIES = [
  { name: 'Dry Clean', query: 'Dry Cleaning', icon: Sparkles },
  { name: 'Wash & Fold', query: 'Wash & Fold', icon: Shirt },
  { name: 'Steam Iron', query: 'Steam Iron', icon: Wind },
  { name: 'Saree & Silk', query: 'Premium Care', icon: Crown },
  { name: 'Suit & Blazer', query: 'Dry Cleaning', icon: Layers },
  { name: 'Blanket / Quilt', query: 'Household', icon: BedDouble },
  { name: 'Shoe Laundry', query: 'Footwear', icon: Footprints },
];

const Home = () => {
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, updateQuantity, cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await servicesAPI.getAll();
        if (res.success && res.services) {
          const popular = res.services.filter((s) => s.popular);
          setPopularServices(popular.length > 0 ? popular.slice(0, 6) : res.services.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching popular services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const getCartQuantity = (serviceId) => {
    const item = cartItems.find((i) => i.serviceId === serviceId);
    return item ? item.quantity : 0;
  };

  return (
    <div>
      {/* Mobile App Search & Hero Banner Area */}
      <section style={{ backgroundColor: '#ffffff', padding: '1.25rem 0 2rem 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={20}
                color="var(--primary)"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{
                  paddingLeft: '48px',
                  paddingRight: '90px',
                  borderRadius: 'var(--radius-full)',
                  height: '50px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.95rem',
                }}
                placeholder="Search dry cleaning, shirts, sarees, suits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', borderRadius: 'var(--radius-full)', padding: '0 1rem' }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Native App-Style Circular Category Scroller */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-main)' }}>
                Categories
              </span>
              <Link to="/services" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                See All →
              </Link>
            </div>

            <div className="app-categories-scroll">
              {QUICK_CATEGORIES.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={idx}
                    to={`/services?category=${encodeURIComponent(cat.query)}`}
                    className="app-category-card"
                  >
                    <div className="app-category-icon-circle">
                      <IconComponent size={26} />
                    </div>
                    <span className="app-category-name">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* App Promotional Banners */}
          <div className="app-banner-grid">
            <Link to="/services" className="app-banner-card app-banner-blue">
              <div>
                <span className="app-banner-tag">
                  <Sparkles size={14} /> 20% OFF
                </span>
                <div className="app-banner-title">First Doorstep Booking</div>
                <div className="app-banner-desc">Use code VKFIRST at collection for instant discount.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', marginTop: '1rem' }}>
                <span>Book Pickup Now</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/services?category=Steam+Iron" className="app-banner-card app-banner-teal">
              <div>
                <span className="app-banner-tag">
                  <Clock size={14} /> Express
                </span>
                <div className="app-banner-title">Steam Ironing @ ₹15</div>
                <div className="app-banner-desc">Crisp wrinkle-free perfection delivered in 24 hours.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', marginTop: '1rem' }}>
                <span>Explore Ironing</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/services?category=Premium+Care" className="app-banner-card app-banner-purple">
              <div>
                <span className="app-banner-tag">
                  <Crown size={14} /> Luxury Fabric
                </span>
                <div className="app-banner-title">Silk & Saree Dry Cleaning</div>
                <div className="app-banner-desc">Zero-bleed delicate Italian hydrocarbon care.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', marginTop: '1rem' }}>
                <span>Book Silk Care</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-page)', paddingTop: '2.5rem' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <span className="section-tag" style={{ marginBottom: '0.35rem' }}>Top Picked</span>
              <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Popular Services</h2>
            </div>
            <Link to="/services" className="btn btn-outline btn-sm">
              <span>View All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p>Loading catalog...</p>
            </div>
          ) : popularServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
              <Sparkles size={36} color="var(--primary)" style={{ opacity: 0.6, marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Our service catalog is being updated</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>Services added from the Admin Panel will appear here immediately.</p>
              <Link to="/services" className="btn btn-primary btn-sm">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="services-grid">
              {popularServices.map((service) => {
                const cartQty = getCartQuantity(service._id);
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
                    <p className="service-desc">
                      {service.description}
                    </p>

                    <div className="service-footer">
                      <div className="service-price">
                        <span className="price-label">Price</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                          <span className="price-value">₹{service.price}</span>
                          <span className="price-unit">/{service.unit || 'Pc'}</span>
                        </div>
                      </div>

                      {/* Interactive App-Style Add / Quantity Controller */}
                      <div className="service-actions">
                        {cartQty > 0 ? (
                          <div className="qty-controller">
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(service._id, cartQty - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="qty-value">{cartQty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(service._id, cartQty + 1)}
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
      </section>

      {/* How VK Dry Clean Works */}
      <section className="section-sm" style={{ backgroundColor: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Convenient & Contactless</span>
            <h2 className="section-title" style={{ fontSize: '1.75rem' }}>How It Works in 5 Easy Steps</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <div className="step-icon" style={{ width: '52px', height: '52px' }}>
                <ShoppingBag size={24} />
              </div>
              <h4 className="step-title" style={{ fontSize: '1.05rem' }}>Select Services</h4>
              <p className="step-desc">Pick dry cleaning, laundry or pressing items.</p>
            </div>

            <div className="step-card">
              <span className="step-number">2</span>
              <div className="step-icon" style={{ width: '52px', height: '52px' }}>
                <Layers size={24} />
              </div>
              <h4 className="step-title" style={{ fontSize: '1.05rem' }}>Add to Cart</h4>
              <p className="step-desc">Select quantities with transparent per-piece rates.</p>
            </div>

            <div className="step-card">
              <span className="step-number">3</span>
              <div className="step-icon" style={{ width: '52px', height: '52px' }}>
                <Calendar size={24} />
              </div>
              <h4 className="step-title" style={{ fontSize: '1.05rem' }}>Schedule Pickup</h4>
              <p className="step-desc">Choose doorstep pickup date and time slot.</p>
            </div>

            <div className="step-card">
              <span className="step-number">4</span>
              <div className="step-icon" style={{ width: '52px', height: '52px' }}>
                <Sparkles size={24} />
              </div>
              <h4 className="step-title" style={{ fontSize: '1.05rem' }}>Clean & Press</h4>
              <p className="step-desc">Processed with eco solvents and steam finish.</p>
            </div>

            <div className="step-card">
              <span className="step-number">5</span>
              <div className="step-icon" style={{ width: '52px', height: '52px' }}>
                <Truck size={24} />
              </div>
              <h4 className="step-title" style={{ fontSize: '1.05rem' }}>Doorstep Delivery</h4>
              <p className="step-desc">Delivered fresh in protective garment covers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="section-sm" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, #eff6ff, #f8fafc)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="hero-feature-icon" style={{ width: '48px', height: '48px' }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>100% Quality Fabric Guarantee</h3>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>
                  If you are not delighted with the finish, we will re-clean your garments for free.
                </p>
              </div>
            </div>

            <Link to="/services" className="btn btn-primary">
              <span>Book a Service</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
