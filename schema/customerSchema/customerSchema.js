const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  supplierId: { // Changed from shopId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier', // Changed from Shop
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^\+\d{10,15}$/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
customerSchema.index({ supplierId: 1 }); // Changed from shopId
customerSchema.index({ phone: 1 });
customerSchema.index({ 'address.coordinates': '2dsphere' });

// Update timestamp
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
