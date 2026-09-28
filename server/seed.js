const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const postgres = require('./config/postgres');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pavanpalgir0011@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Himanshu@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Vikas';

/**
 * Safe Production Initializer
 * CRITICAL: NEVER delete or wipe services, orders, or customer data on server restart!
 */
const seedInitialData = async () => {
  try {
    console.log('--- Initializing Safe Production Verification for VK Dry Clean ---');

    // 1. Ensure Admin user exists (do NOT delete any other users or services!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        phone: '',
        role: 'admin',
        city: '',
        address: '',
        pincode: '',
      });
      await admin.save();
      console.log(`✅ Production Admin created: ${ADMIN_EMAIL}`);
    } else {
      // Keep admin credentials synced with .env, do not touch other data
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
          INSERT INTO users (name, email, role, password_hash)
          VALUES ($1, $2, 'admin', $3)
          ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash;
        `, [ADMIN_NAME, ADMIN_EMAIL, hashedPassword]);
      }
    } catch (pgAdminErr) {
      console.warn('Postgres admin sync notice:', pgAdminErr.message);
    }

    // 3. Count existing services to ensure data persistence
    const serviceCount = await Service.countDocuments();
    console.log(`✅ Current Active Services in Database: ${serviceCount} (Data is protected and persistent)`);

    console.log('--- Production Verification Complete (0 Data Deleted, All Records Preserved) ---');
  } catch (error) {
    console.error('Error during data initialization:', error);
  }
};

module.exports = seedInitialData;
