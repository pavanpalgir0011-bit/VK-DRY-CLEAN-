import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const Terms = () => {
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
              <FileText size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Terms & Conditions</h1>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Effective Date: September 2026</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.98rem' }}>
            <p>
              Welcome to <strong>Wash & Wow</strong>. By booking our dry cleaning, laundry, steam ironing, or doorstep delivery services, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>1. Garment Inspection & Acceptance</h3>
            <p>
              All garments are inspected by our master fabric specialists upon arrival at our processing facility. If a garment exhibits pre-existing damage, tears, weak stitching, or stubborn indelible stains, we will notify you before initiating the cleaning process.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>2. Doorstep Pickup & Delivery</h3>
            <p>
              Free doorstep pickup and delivery applies to orders with a subtotal of ₹499 and above. For orders under ₹499, a nominal delivery charge of ₹50 is applied to cover transit logistics. Customers must be present during the scheduled time slot or designate an authorized representative.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>3. Standard Turnaround Times</h3>
            <p>
              Standard dry cleaning and laundry turnaround is 24 to 48 hours. Heavy household items such as carpets, quilts, and designer bridal lehengas may require up to 72 hours for deep drying and delicate hand restoration.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>4. Personal Items in Pockets</h3>
            <p>
              Please check and empty all pockets prior to handing over clothes. While we make every attempt to return discovered items (coins, pens, pins, currency), Wash & Wow cannot accept responsibility for lost personal valuables left inside garments.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>5. Stain Removal Policy</h3>
            <p>
              We treat all stains using advanced eco-friendly spotting agents. However, depending on the fabric age, dye composition, and prior home-washing attempts, complete stain removal cannot be 100% guaranteed without compromising fabric fiber integrity.
            </p>

            <h3 style={{ fontSize: '1.25rem' }}>6. Re-Cleaning Guarantee</h3>
            <p>
              If you are dissatisfied with the cleaning or steam finish of any item, notify us within 48 hours of delivery. We will gladly collect, re-examine, and re-clean the item free of cost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
