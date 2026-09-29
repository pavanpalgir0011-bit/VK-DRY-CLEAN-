const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    deliveryFee: {
      type: Number,
      default: 50,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 499,
      min: 0,
    },
    gstRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 28,
    },
    gstNumber: {
      type: String,
      default: '07AAAAA0000A1Z5',
      trim: true,
    },
    storePhone: {
      type: String,
      default: '+91 90585 54448',
      trim: true,
    },
    storeAddress: {
      type: String,
      default: 'Soron Gate Main Market Rd, Jakharudder Pur, Kasganj, Uttar Pradesh 207123',
      trim: true,
    },
    storeEmail: {
      type: String,
      default: 'care@washandwow.com',
      trim: true,
    },
    serviceableCities: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          state: { type: String, required: true, trim: true },
          enabled: { type: Boolean, default: true },
          pincodes: [{ type: String, trim: true }],
        },
      ],
      default: () => [
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
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
