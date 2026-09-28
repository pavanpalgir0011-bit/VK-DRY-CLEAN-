const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Settings = require('../models/Settings');
const postgres = require('../config/postgres');
const { requireAdmin } = require('../middleware/auth');

// All endpoints in this file require admin privileges
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics & statistics
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['Order Placed', 'Order Accepted', 'Pickup Assigned', 'Picked Up'] },
    });
    const processingOrders = await Order.countDocuments({
      status: { $in: ['At Store', 'Processing', 'Ready', 'Out for Delivery'] },
    });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalServices = await Service.countDocuments();

    // Total Revenue from completed or active non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Recent orders (last 7)
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(7);

    // Status breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalCustomers,
        totalServices,
        totalRevenue,
        statusBreakdown: statusMap,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
});

// @route   GET /api/admin/customers
// @desc    Get customer list with spending & order count
router.get('/customers', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'customer' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(filter).sort({ createdAt: -1 });

    // Aggregate orders for each customer
    const customerList = await Promise.all(
      customers.map(async (cust) => {
        const orderSummary = await Order.aggregate([
          { $match: { userId: cust._id, status: { $ne: 'Cancelled' } } },
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              totalSpent: { $sum: '$total' },
            },
          },
        ]);

        const allOrdersCount = await Order.countDocuments({ userId: cust._id });

        return {
          _id: cust._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone || 'N/A',
          city: cust.city || 'N/A',
          address: cust.address || '',
          pincode: cust.pincode || '',
          createdAt: cust.createdAt,
          totalOrders: allOrdersCount,
          totalSpent: orderSummary.length > 0 ? orderSummary[0].totalSpent : 0,
          status: 'Active',
        };
      })
    );

    res.json({
      success: true,
      count: customerList.length,
      customers: customerList,
    });
  } catch (error) {
    console.error('Admin customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
});

// @route   GET /api/admin/customers/:id
// @desc    Get single customer profile + their order history
router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const orders = await Order.find({ userId: customer._id }).sort({ createdAt: -1 });

    const totalSpent = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      customer,
      orders,
      stats: {
        totalOrders: orders.length,
        totalSpent,
      },
    });
  } catch (error) {
    console.error('Admin customer details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer details.' });
  }
});

// @route   GET /api/admin/settings
// @desc    Get system settings (delivery fee, GST, etc.)
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Admin get settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings (delivery fee, free delivery threshold, GST rate)
router.put('/settings', async (req, res) => {
  try {
    const { deliveryFee, freeDeliveryThreshold, gstRate, gstNumber, storePhone, storeAddress, storeEmail } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (deliveryFee !== undefined) settings.deliveryFee = Math.max(0, Number(deliveryFee));
    if (freeDeliveryThreshold !== undefined) settings.freeDeliveryThreshold = Math.max(0, Number(freeDeliveryThreshold));
    if (gstRate !== undefined) settings.gstRate = Math.max(0, Math.min(28, Number(gstRate)));
    if (gstNumber !== undefined) settings.gstNumber = gstNumber.trim();
    if (storePhone !== undefined) settings.storePhone = storePhone.trim();
    if (storeAddress !== undefined) settings.storeAddress = storeAddress.trim();
    if (storeEmail !== undefined) settings.storeEmail = storeEmail.trim();

    await settings.save();

    // Also synchronize live to Supabase PostgreSQL database
    try {
      await postgres.query(`
        UPDATE settings 
        SET delivery_fee = $1, 
            free_delivery_threshold = $2, 
            gst_rate = $3, 
            gst_number = $4, 
            store_phone = $5, 
            store_address = $6, 
            store_email = $7, 
            updated_at = NOW()
      `, [
        settings.deliveryFee,
        settings.freeDeliveryThreshold,
        settings.gstRate,
        settings.gstNumber,
        settings.storePhone,
        settings.storeAddress,
        settings.storeEmail,
      ]);
    } catch (pgErr) {
      console.warn('Supabase PostgreSQL sync notice:', pgErr.message);
    }

    res.json({
      success: true,
      message: 'Pricing, Delivery & GST settings updated successfully in Supabase & Backend!',
      settings,
    });
  } catch (error) {
    console.error('Admin update settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

module.exports = router;
