import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & About */}
          <div className="footer-brand">
            <h3>
              <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
                <Sparkles size={16} />
              </div>
              <span>Wash & Wow</span>
            </h3>
            <p className="footer-desc">
              <strong>From Dryclean to Laundry - We Care For Everything.</strong> Wash & Wow is Kasganj's trusted garment care destination, combining Italian hydrocarbon technology with hand-finish craftsmanship for pristine results.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} />
              <span>100% Eco-Safe Solvents & Zero Harsh Chemicals</span>
            </div>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="footer-title">Contact & Store</h4>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>Soron Gate Main Market Rd, Jakharudder Pur, Kasganj, UP 207123</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} />
              <a href="tel:+919058554448" style={{ color: 'inherit' }}>+91 90585 54448</a>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <a href="mailto:care@washandwow.com" style={{ color: 'inherit' }}>care@washandwow.com</a>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} />
              <span>Open 7 Days: 10:00 AM – 8:00 PM</span>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <a
                href="https://maps.app.goo.gl/ysi9iS5xStcPHFzEA"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', color: '#38bdf8', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                📍 Find us on Google Maps ↗
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Wash & Wow. All rights reserved. Crafted with care for pristine fabric.
          </div>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
