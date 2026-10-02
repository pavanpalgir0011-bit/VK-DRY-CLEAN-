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
      default: 0,
      min: 0,
      max: 28,
    },
    gstNumber: {
      type: String,
      default: '',
      trim: true,
    },
    storePhone: {
      type: String,
      default: '+91 85868 25438',
      trim: true,
    },
    storeAddress: {
      type: String,
      default: 'Noida Sec 68, Garhi Chaukhandi, Uttar Pradesh 201301',
      trim: true,
    },
    storeEmail: {
      type: String,
      default: 'jkmdryclean68@gmail.com',
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
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
