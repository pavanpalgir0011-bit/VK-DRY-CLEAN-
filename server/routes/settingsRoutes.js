const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Helper to get or create default settings
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  const defaultCities = [
    { name: 'Noida', state: 'Uttar Pradesh', enabled: true },
    { name: 'Greater Noida', state: 'Uttar Pradesh', enabled: true },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', enabled: true },
    { name: 'New Delhi', state: 'Delhi', enabled: true },
    { name: 'South Delhi', state: 'Delhi', enabled: true },
    { name: 'Gurugram', state: 'Haryana', enabled: true },
    { name: 'Faridabad', state: 'Haryana', enabled: true },
    { name: 'Kasganj', state: 'Uttar Pradesh', enabled: true },
    { name: 'Aligarh', state: 'Uttar Pradesh', enabled: true },
    { name: 'Etah', state: 'Uttar Pradesh', enabled: true },
    { name: 'Hathras', state: 'Uttar Pradesh', enabled: true },
    { name: 'Agra', state: 'Uttar Pradesh', enabled: true },
    { name: 'Mathura', state: 'Uttar Pradesh', enabled: true },
    { name: 'Lucknow', state: 'Uttar Pradesh', enabled: false },
    { name: 'Kanpur', state: 'Uttar Pradesh', enabled: false },
    { name: 'Mumbai', state: 'Maharashtra', enabled: false },
    { name: 'Bengaluru', state: 'Karnataka', enabled: false },
  ];

  if (!settings) {
    settings = new Settings({
      deliveryFee: 50,
      freeDeliveryThreshold: 499,
      gstRate: 0,
      gstNumber: '',
      storePhone: '+91 85868 25438',
      storeAddress: 'Noida Sec 68, Garhi Chaukhandi, Uttar Pradesh 201301',
      storeEmail: 'jkmdryclean68@gmail.com',
      serviceableCities: defaultCities,
    });
    await settings.save();
  } else {
    // Ensure store details stay up to date with JKM Dry Clean
    if (!settings.storePhone || settings.storePhone === '0000000000' || settings.storePhone.includes('90585')) {
      settings.storePhone = '+91 85868 25438';
    }
    if (!settings.storeAddress || settings.storeAddress.includes('Kasganj') || settings.storeAddress.includes('Soron Gate')) {
      settings.storeAddress = 'Noida Sec 68, Garhi Chaukhandi, Uttar Pradesh 201301';
    }
    if (!settings.storeEmail || settings.storeEmail.includes('washandwow') || settings.storeEmail.includes('vkdryclean')) {
      settings.storeEmail = 'jkmdryclean68@gmail.com';
    }
    if (settings.gstNumber === '07AAAAA0000A1Z5') {
      settings.gstNumber = '';
      settings.gstRate = 0;
    }
    if (!settings.serviceableCities || settings.serviceableCities.length === 0 || !settings.serviceableCities.some(c => c.name === 'Noida')) {
      settings.serviceableCities = defaultCities;
    }
    await settings.save();
  }
  return settings;
};

// @route   GET /api/settings
// @desc    Get public pricing & business settings (delivery fee, free delivery threshold, GST rate, active serviceable cities)
router.get('/', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const allCities = settings.serviceableCities || [];
    const activeCities = allCities.filter((c) => c.enabled);

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
        serviceableCities: allCities,
        activeCities: activeCities,
      },
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

// @route   GET /api/settings/cities
// @desc    Get active serviceable cities for checkout and profile
router.get('/cities', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const allCities = settings.serviceableCities || [];
    const activeCities = allCities.filter((c) => c.enabled);

    res.json({
      success: true,
      cities: activeCities,
      allCities: allCities,
    });
  } catch (error) {
    console.error('Fetch cities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch serviceable cities.' });
  }
});

module.exports = { settingsRouter: router, getOrCreateSettings };
