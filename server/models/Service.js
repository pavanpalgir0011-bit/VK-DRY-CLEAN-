const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: 'Piece',
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    turnaroundTime: {
      type: String,
      default: '24-48 Hours',
    },
    popular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);
