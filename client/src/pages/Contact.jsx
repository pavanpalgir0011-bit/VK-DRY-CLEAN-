import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { contactAPI, settingsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [storeInfo, setStoreInfo] = useState({
    address: '',
    phone: '',
    email: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsAPI.getPublicSettings();
        if (res.success && res.settings) {
          setStoreInfo({
            address: res.settings.storeAddress || '',
            phone: res.settings.storePhone || '',
            email: res.settings.storeEmail || '',
          });
        }
      } catch (e) {
        // default graceful fallback
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please provide your name, email, and message.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await contactAPI.submitMessage(formData);
      if (res.success) {
        setSubmitted(true);
        addToast('Message sent! Our customer team will reach out shortly.', 'success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Direct Support</span>
          <h1 className="section-title">Get in Touch with VK Dry Clean</h1>
          <p className="section-desc">
            Have questions about specialized fabrics, bulk commercial laundry, or delivery times? We're always here to assist.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
          {/* Contact Details Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Contact Information</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="hero-feature-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Main Plant & Store</h5>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      {storeInfo.address || 'Doorstep Pickup & Delivery Service across the City'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="hero-feature-icon">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Phone & WhatsApp</h5>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      {storeInfo.phone || '+91 98765 43210'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="hero-feature-icon">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Customer Email</h5>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      {storeInfo.email || 'support@vkdryclean.com'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="hero-feature-icon">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>Working Hours</h5>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      Monday – Sunday: 8:00 AM – 9:00 PM (All 7 Days)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note Card */}
            <div className="card" style={{ padding: '1.5rem', background: 'var(--primary-light)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                Need Immediate Doorstep Pickup?
              </h4>
              <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                You can select your garments and book a collection online right now with real-time status tracking.
              </p>
              <a href="/services" className="btn btn-primary btn-sm">
                Book Service Online
              </a>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Send Us a Message</h3>
            <p style={{ marginBottom: '1.75rem', fontSize: '0.92rem' }}>
              Fill in your inquiry and our operations team will respond within 2 business hours.
            </p>

            {submitted && (
              <div style={{ padding: '1rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <CheckCircle2 size={20} />
                <span>Thank you! Your message has been received.</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message / Inquiry *</label>
                <textarea
                  name="message"
                  className="form-textarea"
                  placeholder="Tell us what you need help with..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.75rem' }}
              >
                <Send size={18} />
                <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
