const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['preAdvance', 'cod']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  phone: {
    type: String,
    trim: true,
    match: /^\+\d{10,15}$/
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ driverId: 1 });
paymentSchema.index({ status: 1 });

// Update timestamp
paymentSchema.pre('save', function(next) {
  this.createdAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
