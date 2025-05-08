const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    match: /^\+\d{10,15}$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  role: {
    type: String,
    required: true,
    enum: ['supplierAdmin', 'supplierModerator', 'admin', 'superAdmin', 'driver'],
    default: 'supplierAdmin'
  },
  /*
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: function() { return ['supplierAdmin', 'supplierModerator'].includes(this.role); }
  },*/
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    resource: {
      type: String,
      required: true,
      enum: ['users', 'suppliers', 'customers', 'orders', 'payments', 'analytics', 'kyc', 'sms', 'logistics']
    },
    actions: [{
      type: String,
      required: true,
      enum: ['read', 'write', 'delete', 'updatePermissions', 'verify', 'assign', 'updateStatus', 'flag']
    }]
  }],
  kyc: {
    idType: {
      type: String,
      enum: ['passport', 'nationalId', 'driversLicense']
    },
    idNumber: {
      type: String,
    },
    documentUrl: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  auth: {
    otp: { type: String }, // Store hashed OTP
    otpExpires: { type: Date },
    uniqueId: { type: String, unique: true },  
    // unique start with P000 then 5 numbers acquired from _id
    password: {type: String},
    secretCode: { type: String }, 
    masterKey: { type: String }
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
/*
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ apiKey: 1 });
userSchema.index({ role: 1 });
userSchema.index({ supplierId: 1 });
*/

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
