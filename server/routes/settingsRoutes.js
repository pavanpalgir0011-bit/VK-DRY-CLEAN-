const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Helper to get or create default settings
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  const defaultCities = [
    { name: 'New Delhi', state: 'Delhi', enabled: true },
    { name: 'South Delhi', state: 'Delhi', enabled: true },
    { name: 'West Delhi', state: 'Delhi', enabled: true },
    { name: 'North Delhi', state: 'Delhi', enabled: true },
    { name: 'East Delhi', state: 'Delhi', enabled: true },
    { name: 'Central Delhi', state: 'Delhi', enabled: true },
    { name: 'Noida', state: 'Uttar Pradesh', enabled: true },
    { name: 'Greater Noida', state: 'Uttar Pradesh', enabled: true },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', enabled: true },
    { name: 'Gurugram', state: 'Haryana', enabled: true },
    { name: 'Faridabad', state: 'Haryana', enabled: true },
    { name: 'Mumbai', state: 'Maharashtra', enabled: false },
    { name: 'Bengaluru', state: 'Karnataka', enabled: false },
    { name: 'Chandigarh', state: 'Chandigarh', enabled: false },
    { name: 'Jaipur', state: 'Rajasthan', enabled: false },
  ];

  if (!settings) {
    settings = new Settings({
      deliveryFee: 50,
      freeDeliveryThreshold: 499,
      gstRate: 5,
      gstNumber: '',
      storePhone: '',
      storeAddress: '',
      storeEmail: '',
      serviceableCities: defaultCities,
    });
    await settings.save();
  } else if (!settings.serviceableCities || settings.serviceableCities.length === 0) {
    settings.serviceableCities = defaultCities;
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
