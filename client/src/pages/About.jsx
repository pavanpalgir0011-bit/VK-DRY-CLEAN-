import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Award, HeartHandshake, CheckCircle2, ArrowRight, Clock, Users } from 'lucide-react';

const About = () => {
  return (
    <div>
      {/* Hero */}
      <section className="section" style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)', paddingBottom: '3rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="section-tag">Since 2012</span>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>
            Elevating the Art of <span style={{ color: 'var(--primary)' }}>Garment Care</span>
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
            JKM Dry Clean was founded on a simple yet unyielding philosophy: <em>"From Dryclean to Laundry - We Care For Everything."</em> Every piece of clothing tells a story, and delicate fabrics deserve obsessive care, closed-loop Italian solvent technology, and effortless doorstep convenience.
          </p>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span className="section-tag">Our Heritage</span>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1.25rem' }}>Noida's Trusted Dry Cleaning & Fabric Care Workshop</h2>
              <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                Located at Noida Sec 68, Garhi Chaukhandi, JKM Dry Clean has established itself as the region's benchmark for automated, premium garment care.
              </p>
              <p style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Traditional dry cleaners rely on toxic PERC chemicals that degrade fibers and leave harsh synthetic odors. At JKM Dry Clean, we transitioned 100% of our dry cleaning operations to closed-loop Italian hydrocarbon and soft-water washing technology. The result? Vivid colors, soft textures, and zero chemical smell.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    100,000+
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Garments Cleaned</div>
                </div>

                <div style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    99.4%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>On-Time Delivery</div>
                </div>
              </div>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80"
                alt="JKM Dry Clean Precision Steam Finish"
                style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Core Principles</span>
            <h2 className="section-title">What Guides Everything We Do</h2>
            <p className="section-desc">
              From our stain extraction experts to our doorstep riders, our standards are uncompromising.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-box">
                <Sparkles size={24} />
              </div>
              <h3 className="feature-title">Eco-Safe Hydrocarbon</h3>
              <p className="feature-desc">
                Bio-degradable solvents that dissolve stubborn oil and grease spots without breaking down delicate silk, wool, or zari threads.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-box">
                <Award size={24} />
              </div>
              <h3 className="feature-title">Master Spotting Technique</h3>
              <p className="feature-desc">
                Our certified spotting masters use localized ultrasonic guns and specialized pH-balanced reagents for wine, ink, and grease stains.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-box">
                <HeartHandshake size={24} />
              </div>
              <h3 className="feature-title">100% Satisfaction Guarantee</h3>
              <p className="feature-desc">
                If you are not completely delighted with the finish or press of any garment, we re-clean and steam iron it free of charge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-banner">
            <h2>Experience the JKM Dry Clean Standard</h2>
            <p>Join thousands of professionals and families who trust us with their everyday and high-fashion wardrobe.</p>
            <Link to="/services" className="btn btn-white btn-lg">
              <span>Explore Services & Book Pickup</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
