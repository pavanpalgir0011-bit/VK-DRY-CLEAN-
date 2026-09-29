const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Settings = require('./models/Settings');
const postgres = require('./config/postgres');
const { DEFAULT_SERVICES } = require('./servicesCatalog');
const { getOrCreateSettings } = require('./routes/settingsRoutes');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pavanpalgir0011@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Himanshu@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Vikas';

/**
 * Safe Production Initializer
 * Seeds Admin, Wash & Wow Store Settings, and 10 products per category (60 total products)
 */
const seedInitialData = async () => {
  try {
    console.log('--- Initializing Safe Production Verification for Wash & Wow ---');

    // 1. Ensure Admin user exists (do NOT delete any other users or services!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        phone: '+91 90585 54448',
        role: 'admin',
        city: 'Kasganj',
        address: 'Soron Gate Main Market Rd, Jakharudder Pur, Kasganj, Uttar Pradesh 207123',
        pincode: '207123',
      });
      await admin.save();
      console.log(`✅ Production Admin created: ${ADMIN_EMAIL}`);
    } else {
      admin.role = 'admin';
      admin.name = ADMIN_NAME;
      admin.password = hashedPassword;
      await admin.save();
      console.log(`✅ Production Admin verified: ${ADMIN_EMAIL}`);
    }

    // 2. Sync Admin in Supabase PostgreSQL if connected
    try {
      if (postgres && postgres.pool) {
        await postgres.query(`
          INSERT INTO users (name, email, role, password_hash, phone, city, address, pincode)
          VALUES ($1, $2, 'admin', $3, '+91 90585 54448', 'Kasganj', 'Soron Gate Main Market Rd, Jakharudder Pur, Kasganj, Uttar Pradesh 207123', '207123')
          ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash;
        `, [ADMIN_NAME, ADMIN_EMAIL, hashedPassword]);
      }
    } catch (pgAdminErr) {
      console.warn('Postgres admin sync notice:', pgAdminErr.message);
    }

    // 3. Ensure Store Settings in MongoDB and Supabase
    try {
      await getOrCreateSettings();
      console.log('✅ Wash & Wow Store Settings synchronized in MongoDB');
    } catch (settingsErr) {
      console.warn('Settings sync warning:', settingsErr.message);
    }

    try {
      if (postgres && postgres.pool) {
        await postgres.query(`
          UPDATE settings SET
            store_phone = '+91 90585 54448',
            store_address = 'Soron Gate Main Market Rd, Jakharudder Pur, Kasganj, Uttar Pradesh 207123',
            store_email = 'care@washandwow.com',
            updated_at = NOW();
        `);
      }
    } catch (pgSetErr) {
      console.warn('Postgres settings sync notice:', pgSetErr.message);
    }

    // 4. Seed / Upsert the 60 services (10 per category) in MongoDB
    try {
      for (const item of DEFAULT_SERVICES) {
        await Service.findOneAndUpdate(
          { name: item.name },
          { $set: item },
          { upsert: true, new: true }
        );
      }
      const serviceCount = await Service.countDocuments();
      console.log(`✅ MongoDB Active Services Catalog: ${serviceCount} services`);
    } catch (svcErr) {
      console.warn('MongoDB service catalog seed warning:', svcErr.message);
    }

    // 5. Seed / Upsert the 60 services in Supabase Postgres
    try {
      if (postgres && postgres.pool) {
        for (const s of DEFAULT_SERVICES) {
          const check = await postgres.query('SELECT id FROM services WHERE name = $1 LIMIT 1', [s.name]);
          if (check.rows.length === 0) {
            await postgres.query(`
              INSERT INTO services (name, description, category, price, unit, image, is_active, turnaround_time, popular)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [s.name, s.description, s.category, s.price, s.unit, s.image, s.isActive, s.turnaroundTime, s.popular]);
          } else {
            await postgres.query(`
              UPDATE services SET
                description = $1, category = $2, price = $3, unit = $4, image = $5,
                is_active = $6, turnaround_time = $7, popular = $8, updated_at = NOW()
              WHERE name = $9
            `, [s.description, s.category, s.price, s.unit, s.image, s.isActive, s.turnaroundTime, s.popular, s.name]);
          }
        }
        const pgCount = await postgres.query('SELECT count(*) FROM services');
        console.log(`✅ Supabase Postgres Active Services Catalog: ${pgCount.rows[0].count} services`);
      }
    } catch (pgSvcErr) {
      console.warn('Supabase service catalog seed warning:', pgSvcErr.message);
    }

    console.log('--- Wash & Wow Production Verification Complete (All Records Preserved & Updated) ---');
  } catch (error) {
    console.error('Error during data initialization:', error);
  }
};

module.exports = seedInitialData;
