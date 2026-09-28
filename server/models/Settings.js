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
      default: '',
      trim: true,
    },
    storeAddress: {
      type: String,
      default: '',
      trim: true,
    },
    storeEmail: {
      type: String,
      default: '',
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
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
