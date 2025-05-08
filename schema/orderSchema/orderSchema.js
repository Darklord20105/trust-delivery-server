const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  supplierId: { // Changed from shopId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier', // Changed from Shop
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  shippingFee: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  preAdvancePaid: {
    type: Number,
    default: 0,
    min: 0
  },
  preAdvancePhone: {
    type: String,
    trim: true,
    match: /^\+\d{10,15}$/
  },
  codAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'dispatched', 'delivered'],
    default: 'pending'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  shippingAddress: {
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
orderSchema.index({ supplierId: 1 }); // Changed from shopId
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ driverId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'shippingAddress.coordinates': '2dsphere' });

// Update timestamp
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
