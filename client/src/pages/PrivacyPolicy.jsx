import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="card" style={{ padding: '3rem 2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="hero-feature-icon">
              <Shield size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Privacy Policy</h1>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Last updated: September 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.98rem' }}>
            <p>
              At <strong>VK Dry Clean</strong>, your privacy and data security are paramount. This Privacy Policy details how we collect, handle, and protect your personal information when you use our website, place laundry bookings, and utilize our doorstep pickup and delivery services.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>1. Information We Collect</h3>
            <p>
              To process your dry cleaning and laundry orders efficiently, we collect:
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li><strong>Contact Information:</strong> Your full name, email address, and active mobile phone number.</li>
              <li><strong>Pickup & Delivery Address:</strong> Street address, apartment/flat number, city, state, postal pincode, and nearby landmarks.</li>
              <li><strong>Order History:</strong> Services requested, garment quantities, invoice totals, and payment status.</li>
              <li><strong>Account Credentials:</strong> Encrypted password hashes or Google Authentication identifiers.</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem' }}>2. How We Use Your Information</h3>
            <p>
              Your data is strictly utilized for:
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Dispatching pickup and delivery riders directly to your doorstep.</li>
              <li>Providing real-time SMS and order progress updates along our 10-stage tracking pipeline.</li>
              <li>Customer service communication regarding specific fabric care notes or stains.</li>
              <li>Maintaining secure authentication and customer records.</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem' }}>3. Data Protection & Sharing</h3>
            <p>
              VK Dry Clean never sells, rents, or monetizes your personal information to third-party advertisers. Data is shared exclusively with our internal operations team and delivery riders for fulfillment purposes only.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>4. Security</h3>
            <p>
              We implement industry-standard SSL encryption, secure JSON Web Tokens (JWT), and hashed password storage via bcrypt to protect your profile against unauthorized access.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>5. Contact Us Regarding Privacy</h3>
            <p>
              If you have any questions or wish to delete your account data, please contact our Data Protection Officer at:
              <br />
              <strong>Email:</strong> support@vkdryclean.com
              <br />
              <strong>Customer Support Desk:</strong> VK Dry Clean Operations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
