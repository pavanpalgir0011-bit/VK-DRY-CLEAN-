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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
