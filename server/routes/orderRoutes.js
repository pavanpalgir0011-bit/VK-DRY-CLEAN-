const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Service = require('../models/Service');
const Settings = require('../models/Settings');
const postgres = require('../config/postgres');
const { 
  sendNewOrderNotification, 
  sendCustomerInvoiceEmail, 
  sendCustomerOrderConfirmationEmail 
} = require('../utils/emailService');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Generate unique readable order ID e.g. VK-2026-8492
const generateOrderId = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `VK-2026-${random}`;
};

// @route   POST /api/orders
// @desc    Place a new dry cleaning order (Logged-in customer only)
// CRITICAL: SERVER-SIDE PRICE VALIDATION (Never trust frontend price)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, pickupAddress, pickupDate, pickupTime, specialInstructions, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add services to proceed.',
      });
    }

    if (!pickupAddress || !pickupAddress.address || !pickupAddress.city || !pickupAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete pickup address (street, city, pincode).',
      });
    }

    // Verify pickup city is enabled in live Admin Settings
    const liveSettings = await Settings.findOne();
    const activeCities = (liveSettings?.serviceableCities || []).filter((c) => c.enabled);
    if (activeCities.length > 0) {
      const orderCity = (pickupAddress.city || '').trim().toLowerCase();
      const isCityActive = activeCities.some((c) => c.name.trim().toLowerCase() === orderCity);
      if (!isCityActive) {
        const allowedCities = activeCities.map((c) => c.name).join(', ');
        return res.status(400).json({
          success: false,
          message: `Delivery is currently not available in "${pickupAddress.city}". We are actively serving in: ${allowedCities}.`,
        });
      }
    }

    if (!pickupDate || !pickupTime) {
      return res.status(400).json({
        success: false,
        message: 'Please select a pickup date and time slot.',
      });
    }

    // Fetch all services from database to calculate real prices
    const serviceIds = items.map((item) => item.serviceId);
    const dbServices = await Service.find({ _id: { $in: serviceIds } });
    const serviceMap = new Map();
    dbServices.forEach((s) => serviceMap.set(s._id.toString(), s));

    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const sId = item.serviceId ? item.serviceId.toString() : null;
      const dbService = serviceMap.get(sId);

      if (!dbService) {
        return res.status(400).json({
          success: false,
          message: `Service "${item.name || 'Unknown'}" is no longer available.`,
        });
      }

      if (!dbService.isActive) {
        return res.status(400).json({
          success: false,
          message: `Service "${dbService.name}" is currently inactive. Please remove it from your cart.`,
        });
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const itemPrice = dbService.price; // ALWAYS USE DB PRICE
      const itemSubtotal = itemPrice * qty;
      subtotal += itemSubtotal;

      validatedItems.push({
        serviceId: dbService._id,
        name: dbService.name,
        price: itemPrice,
        quantity: qty,
        unit: dbService.unit || 'Piece',
        image: dbService.image,
      });
    }

    // Dynamic Delivery Fee & GST Policy set by Admin Panel
    let settings = await Settings.findOne();
    if (!settings) {
      settings = { deliveryFee: 50, freeDeliveryThreshold: 499, gstRate: 5 };
    }

    const deliveryFee = subtotal >= settings.freeDeliveryThreshold ? 0 : Number(settings.deliveryFee);
    const gstRate = Number(settings.gstRate || 0);
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const total = subtotal + deliveryFee + gstAmount;

    let uniqueId = generateOrderId();
    // Ensure uniqueness
    let exists = await Order.findOne({ orderId: uniqueId });
    while (exists) {
      uniqueId = generateOrderId();
      exists = await Order.findOne({ orderId: uniqueId });
    }

    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = new Order({
      orderId: uniqueId,
      invoiceNumber,
      userId: req.user._id,
      customer: {
        name: (customer && customer.name) || req.user.name,
        email: (customer && customer.email) || req.user.email,
        phone: (customer && customer.phone) || req.user.phone || '',
      },
      items: validatedItems,
      subtotal,
      deliveryFee,
      gstRate,
      gstAmount,
      total,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      pickupAddress: {
        address: pickupAddress.address.trim(),
        city: pickupAddress.city.trim(),
        state: pickupAddress.state
          ? pickupAddress.state.trim()
          : (activeCities.find((c) => c.name.toLowerCase() === pickupAddress.city.trim().toLowerCase())?.state || ''),
        pincode: pickupAddress.pincode.trim(),
        landmark: pickupAddress.landmark ? pickupAddress.landmark.trim() : '',
      },
      pickupDate,
      pickupTime,
      specialInstructions: specialInstructions || '',
      status: 'Order Placed',
      statusHistory: [
        {
          status: 'Order Placed',
          note: 'Order successfully placed via website.',
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    // Synchronize order to Supabase PostgreSQL database
    try {
      await postgres.query(`
        INSERT INTO orders (
          order_id, invoice_number, user_id, customer, items, subtotal, delivery_fee, 
          gst_rate, gst_amount, total, payment_method, payment_status, pickup_address, 
          pickup_date, pickup_time, special_instructions, status, status_history
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (order_id) DO UPDATE SET
          status = EXCLUDED.status,
          payment_status = EXCLUDED.payment_status,
          status_history = EXCLUDED.status_history,
          updated_at = NOW()
      `, [
        order.orderId,
        order.invoiceNumber,
        req.user._id.toString(),
        JSON.stringify(order.customer),
        JSON.stringify(order.items),
        order.subtotal,
        order.deliveryFee,
        order.gstRate,
        order.gstAmount,
        order.total,
        order.paymentMethod,
        order.paymentStatus,
        JSON.stringify(order.pickupAddress),
        order.pickupDate,
        order.pickupTime,
        order.specialInstructions,
        order.status,
        JSON.stringify(order.statusHistory),
      ]);
    } catch (pgErr) {
      console.warn('Supabase PostgreSQL order sync notice:', pgErr.message);
    }

    // Instantly send email notification to admin with full order breakdown
    sendNewOrderNotification(order).catch((mailErr) => {
      console.warn('Admin order email notification deferred:', mailErr.message);
    });

    // Send order confirmation & schedule details to customer email
    sendCustomerOrderConfirmationEmail(order, liveSettings || {}).catch((custMailErr) => {
      console.warn('Customer order confirmation email deferred:', custMailErr.message);
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to place order. Please try again.',
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in customer's order history
router.get('/my-orders', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };

    if (status === 'Active') {
      query.status = { $nin: ['Delivered', 'Cancelled'] };
    } else if (status === 'Completed') {
      query.status = 'Delivered';
    } else if (status === 'Cancelled') {
      query.status = 'Cancelled';
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details & tracking info (by Mongo ID or human orderId)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    let order = null;

    if (id.startsWith('VK-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Security check: Only owner or admin can view order
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.',
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and search (Admin only)
router.get('/admin/orders/all', requireAdmin, async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin orders.' });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get order details for admin
router.get('/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let order = null;
    if (id.startsWith('VK-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Admin get single order error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status along the 10-stage timeline (Admin only)
router.put('/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, note, paymentStatus } = req.body;

    const validStatuses = [
      'Order Placed',
      'Order Accepted',
      'Pickup Assigned',
      'Picked Up',
      'At Store',
      'Processing',
      'Ready',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const id = req.params.id;
    let order = null;
    if (id.startsWith('VK-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.status = status;

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    } else if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status} by admin.`,
      timestamp: new Date(),
    });

    await order.save();

    // Synchronize status update to Supabase PostgreSQL
    try {
      await postgres.query(`
        UPDATE orders 
        SET status = $1, payment_status = $2, status_history = $3, updated_at = NOW()
        WHERE order_id = $4
      `, [
        order.status,
        order.paymentStatus,
        JSON.stringify(order.statusHistory),
        order.orderId,
      ]);
    } catch (pgErr) {
      console.warn('Supabase PostgreSQL order status sync notice:', pgErr.message);
    }

    // If order is completed / delivered, automatically send official Tax Invoice to customer email
    if (status === 'Delivered') {
      Settings.findOne()
        .then((liveSettings) => {
          sendCustomerInvoiceEmail(order, liveSettings || {}).catch((err) => {
            console.warn('Customer invoice email notification error:', err.message);
          });
        })
        .catch(() => {
          sendCustomerInvoiceEmail(order, {}).catch(() => {});
        });
    }

    res.json({
      success: true,
      message: `Order status updated to "${status}".`,
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// @route   POST /api/orders/admin/orders/:id/send-invoice
// @desc    Manually dispatch customer tax invoice email from admin panel
router.post('/admin/orders/:id/send-invoice', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let order = null;
    if (id.startsWith('VK-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const liveSettings = await Settings.findOne();
    const mailRes = await sendCustomerInvoiceEmail(order, liveSettings || {});

    if (mailRes.success) {
      res.json({
        success: true,
        message: `Tax Invoice successfully emailed to customer (${order.customer?.email})!`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: mailRes.message || mailRes.error || 'Failed to email invoice. Please check SMTP configuration.',
      });
    }
  } catch (error) {
    console.error('Send invoice email error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error sending invoice.' });
  }
});

// @route   POST /api/orders/:id/email-invoice
// @desc    Email invoice to customer (accessible by order owner or admin)
router.post('/:id/email-invoice', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    let order = null;
    if (id.startsWith('VK-')) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Security check: Must be the order's customer or an admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to access this order invoice.' });
    }

    const liveSettings = await Settings.findOne();
    const mailRes = await sendCustomerInvoiceEmail(order, liveSettings || {});

    if (mailRes.success) {
      res.json({
        success: true,
        message: `Tax Invoice sent to your email (${order.customer?.email}) successfully!`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: mailRes.message || mailRes.error || 'Failed to email invoice. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Customer email invoice error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error sending invoice.' });
  }
});

module.exports = router;
