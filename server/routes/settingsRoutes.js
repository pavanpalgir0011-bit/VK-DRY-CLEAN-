const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Helper to get or create default settings
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({
      deliveryFee: 50,
      freeDeliveryThreshold: 499,
      gstRate: 5,
      gstNumber: '',
      storePhone: '',
      storeAddress: '',
      storeEmail: '',
    });
    await settings.save();
  }
  return settings;
};

// @route   GET /api/settings
// @desc    Get public pricing & business settings (delivery fee, free delivery threshold, GST rate)
router.get('/', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      success: true,
      settings: {
        deliveryFee: settings.deliveryFee,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        gstRate: settings.gstRate,
        gstNumber: settings.gstNumber,
        storePhone: settings.storePhone,
        storeAddress: settings.storeAddress,
        storeEmail: settings.storeEmail,
      },
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

module.exports = { settingsRouter: router, getOrCreateSettings };
