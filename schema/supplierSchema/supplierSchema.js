const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\+\d{10,15}$/ // E.g., +1234567890
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation
  },
  createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  socialMedia: {
    instagram: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    other: {
      type: String,
      trim: true
    }
  },
  address: {
    street: {
      type: String,
      // required: true,
      trim: true
    },
    city: {
      type: String,
      // required: true,
      trim: true
    },
    postalCode: {
      type: String,
      // required: true,
      trim: true
    },
    country: {
      type: String,
      trim: true // For future global expansion
    },
    coordinates: {
      lat: Number,
      lng: Number // For OpenStreetMap routing
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

// Indexes for performance
// supplierSchema.index({ phone: 1 });
// supplierSchema.index({ email: 1 });
// supplierSchema.index({ 'address.coordinates': '2dsphere' });

// Update timestamp on save
supplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Supplier', supplierSchema);
