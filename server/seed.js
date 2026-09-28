const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Order = require('./models/Order');
const ContactMessage = require('./models/ContactMessage');
const postgres = require('./config/postgres');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pavanpalgir0011@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Himanshu@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Vikas';

const seedInitialData = async () => {
  try {
    console.log('--- Initializing Clean Production Setup for VK Dry Clean ---');

    // 1. Remove any legacy mock/demo users, mock orders, and mock contact messages
    await User.deleteMany({ email: { $in: ['admin@vkdryclean.com', 'rahul@example.com'] } });
    await Order.deleteMany({ $or: [{ orderId: { $in: ['VK-2026-1001', 'VK-2026-1002', 'VK-2026-1003'] } }, { 'customer.email': 'rahul@example.com' }] });
    await ContactMessage.deleteMany({ email: { $in: ['priya@example.com', 'amit@example.com'] } });

    // 2. Remove all seed mock services (Admin will add real services directly from Admin Panel)
    await Service.deleteMany({});
    try {
      if (postgres && postgres.pool) {
        await postgres.query('DELETE FROM services;');
        console.log('✅ Cleared all mock services from Supabase PostgreSQL');
      }
    } catch (pgErr) {
      console.warn('Postgres services cleanup notice:', pgErr.message);
    }
    console.log('✅ Cleaned up mock services from MongoDB and Supabase');

    // 3. Setup / Update Administrator from Environment Variables (without mock address)
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
      console.log(`✅ Production Admin created from .env: ${ADMIN_EMAIL} (role: admin, name: ${ADMIN_NAME})`);
    } else {
      admin.name = ADMIN_NAME;
      admin.role = 'admin';
      admin.password = hashedPassword;
      admin.address = '';
      admin.city = '';
      admin.pincode = '';
      await admin.save();
      console.log(`✅ Production Admin updated from .env: ${ADMIN_EMAIL} (role: admin, name: ${ADMIN_NAME}, mock address removed)`);
    }

    // 4. Update Admin in Supabase PostgreSQL (remove mock address)
    try {
      if (postgres && postgres.pool) {
        await postgres.query(`
          UPDATE users 
          SET address = '', city = '', pincode = '', name = $2, role = 'admin', password_hash = $3, updated_at = NOW()
          WHERE email = $1;
        `, [ADMIN_EMAIL, ADMIN_NAME, hashedPassword]);
        console.log('✅ Synchronized clean Admin account in Supabase PostgreSQL (no mock address)');
      }
    } catch (pgAdminErr) {
      console.warn('Postgres admin update notice:', pgAdminErr.message);
    }

    console.log('--- Production Initialization Complete (0 Mock Services, 0 Mock Addresses) ---');
  } catch (error) {
    console.error('Error during data seeding:', error);
  }
};

module.exports = seedInitialData;
