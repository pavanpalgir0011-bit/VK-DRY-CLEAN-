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
              <span>VK Dry Clean</span>
            </h3>
            <p className="footer-desc">
              VK Dry Clean is your neighborhood's premier dry cleaning and laundry service. We combine Italian hydrocarbon cleaning technology with hand-finish craftsmanship to deliver pristine garments right to your doorstep.
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
              <span>104, VK House, Connaught Place, New Delhi — 110001</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} />
              <span>+91 98765 43210 / +91 98112 34567</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <span>care@vkdryclean.com</span>
            </div>
            <div className="footer-contact-item">
              <Clock size={18} />
              <span>Open 7 Days: 8:00 AM – 9:00 PM</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} VK Dry Clean. All rights reserved. Crafted with care for pristine fabric.
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
