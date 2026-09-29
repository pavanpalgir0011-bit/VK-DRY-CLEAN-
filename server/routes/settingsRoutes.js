const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Helper to get or create default settings
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  const defaultCities = [
    { name: 'Kasganj', state: 'Uttar Pradesh', enabled: true },
    { name: 'Aligarh', state: 'Uttar Pradesh', enabled: true },
    { name: 'Etah', state: 'Uttar Pradesh', enabled: true },
    { name: 'Hathras', state: 'Uttar Pradesh', enabled: true },
    { name: 'Agra', state: 'Uttar Pradesh', enabled: true },
    { name: 'Mathura', state: 'Uttar Pradesh', enabled: true },
    { name: 'Noida', state: 'Uttar Pradesh', enabled: true },
    { name: 'Greater Noida', state: 'Uttar Pradesh', enabled: true },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', enabled: true },
    { name: 'New Delhi', state: 'Delhi', enabled: true },
    { name: 'South Delhi', state: 'Delhi', enabled: true },
    { name: 'Gurugram', state: 'Haryana', enabled: true },
    { name: 'Faridabad', state: 'Haryana', enabled: true },
    { name: 'Lucknow', state: 'Uttar Pradesh', enabled: false },
    { name: 'Kanpur', state: 'Uttar Pradesh', enabled: false },
    { name: 'Mumbai', state: 'Maharashtra', enabled: false },
    { name: 'Bengaluru', state: 'Karnataka', enabled: false },
  ];

  if (!settings) {
    settings = new Settings({
      deliveryFee: 50,
      freeDeliveryThreshold: 499,
      gstRate: 5,
      gstNumber: '07AAAAA0000A1Z5',
      storePhone: '+91 90585 54448',
      storeAddress: 'Soron Gate Main Market Rd, Jakharudder Pur, Kasganj, Uttar Pradesh 207123',
      storeEmail: 'care@washandwow.com',
      serviceableCities: defaultCities,
    });
    await settings.save();
  } else {
    // Ensure store details stay up to date if previously empty
    if (!settings.storePhone || settings.storePhone === '0000000000') {
      settings.storePhone = '+91 90585 54448';
    }
    if (!settings.storeAddress || settings.storeAddress === 'Noida') {
      settings.storeAddress = 'Soron Gate Main Market Rd, Jakharudder Pur, Kasganj, Uttar Pradesh 207123';
    }
    if (!settings.storeEmail || settings.storeEmail === 'care@vkdryclean.com') {
      settings.storeEmail = 'care@washandwow.com';
    }
    if (!settings.serviceableCities || settings.serviceableCities.length === 0 || !settings.serviceableCities.some(c => c.name === 'Kasganj')) {
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
