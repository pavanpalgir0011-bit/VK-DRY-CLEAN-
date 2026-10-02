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
              <span>JKM Dry Clean</span>
            </h3>
            <p className="footer-desc">
              <strong>From Dryclean to Laundry - We Care For Everything.</strong> JKM Dry Clean is Noida Sec 68's trusted garment care destination, combining Italian hydrocarbon technology with hand-finish craftsmanship for pristine results.
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
              <span>Noida Sec 68, Garhi Chaukhandi, UP 201301</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} />
              <a href="tel:+918586825438" style={{ color: 'inherit' }}>+91 85868 25438</a>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <a href="mailto:jkmdryclean68@gmail.com" style={{ color: 'inherit' }}>jkmdryclean68@gmail.com</a>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} />
              <span>Open 7 Days: 10:00 AM – 8:00 PM</span>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Garhi+Chaukhandi+Sector+68+Noida+201301"
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
            © {new Date().getFullYear()} JKM Dry Clean. All rights reserved. Crafted with care for pristine fabric.
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
