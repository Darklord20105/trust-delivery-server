const express = require('express');
const router = express.Router();
const User = require('../../schema/usersSchema/usersSchema');
const Supplier = require('../../schema/supplierSchema/supplierSchema');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');
const {
  generateData,
  compareHashedValues
} = require("../../utils/generator");
//const hashWithSCrypt = require("../../utils/generator");

// Route 1: Create First Super Admin
router.post('/create-superadmin', async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!/^\+\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({ error: 'Super Admin already exists. Use /signup to create users.' });
    }

    const user = new User({
      name,
      phone,
      email,
      role: 'superAdmin',
      apiKey: uuidv4(),
      permissions: [
        { resource: 'users', actions: ['read', 'write', 'delete', 'updatePermissions', 'verify'] },
        { resource: 'suppliers', actions: ['read', 'write', 'delete'] },
        { resource: 'customers', actions: ['read', 'write', 'delete'] },
        { resource: 'orders', actions: ['read', 'write', 'delete', 'assign', 'updateStatus', 'flag'] },
        { resource: 'payments', actions: ['read', 'write'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'kyc', actions: ['read', 'write', 'verify'] },
        { resource: 'sms', actions: ['read', 'write'] },
        { resource: 'logistics', actions: ['read', 'write'] }
      ]
    });

    await user.save();
    res.json({ success: true, userId: user._id, apiKey: user.apiKey });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Phone or email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// login with phone number ... Route 2 & 3
// request code OTP
// recieve it in email or sms or phone
// login directly with json web token

// Route 2: Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\+\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    user.auth.otp = otp; // In production, hash OTP
    user.auth.otpExpires = otpExpires;
    await user.save();

    // Log OTP (replace with SMS provider in production)
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' + error });
  }
});

// Route 3: Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, email } = req.body;

    if (!phone || !otp || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!/^\+\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await User.findOne({ phone, email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.auth.otp !== otp || user.auth.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.auth.otp = null;
    user.auth.otpExpires = null;

    // if we already have unique id, password, secret code, master key 
    // then do nothing and only return the jsonwebtoken
    if (!user.auth.uniqueId && !user.auth.password && !user.auth.secretCode && !user.auth.masterKey) {
      // Generate User login details
      const d = await generateData();

      user.auth.uniqueId = d.uniqueId;
      user.auth.secretCode = d.secretCode;
      user.auth.masterKey = d.masterKey;
      user.auth.password = d.password;

      user.markModified('auth');
    }

    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id }, 'space', { expiresIn: '6h' });

    return res.json({
      success: true, token, apiKey: user.apiKey, auth: user.auth
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' + error });
  }
});

// Route 4: Signup (Super Admin only Creates Users)
// when creating new user instance 

router.post('/signup', authMiddleware('users', 'write'), async (req, res) => {
  try {
    const { name, phone, email, role } = req.body;

    if (!name || !phone || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!/^\+\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!['supplierAdmin', 'supplierModerator', 'admin', 'superAdmin', 'driver'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    let permissions = [];
    if (role === 'superAdmin') {
      permissions = [
        { resource: 'users', actions: ['read', 'write', 'delete', 'updatePermissions', 'verify'] },
        { resource: 'suppliers', actions: ['read', 'write', 'delete'] },
        { resource: 'customers', actions: ['read', 'write', 'delete'] },
        { resource: 'orders', actions: ['read', 'write', 'delete', 'assign', 'updateStatus', 'flag'] },
        { resource: 'payments', actions: ['read', 'write'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'kyc', actions: ['read', 'write', 'verify'] },
        { resource: 'sms', actions: ['read', 'write'] },
        { resource: 'logistics', actions: ['read', 'write'] }
      ];
    } else if (role === 'admin') {
      permissions = [
        { resource: 'users', actions: ['read', 'updatePermissions'] },
        { resource: 'suppliers', actions: ['read'] },
        { resource: 'customers', actions: ['read'] },
        { resource: 'orders', actions: ['read', 'assign', 'flag'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    }
    else if (role === 'supplierAdmin') {
      permissions = [
        { resource: 'suppliers', actions: ['read', 'write'] },
        { resource: 'customers', actions: ['read', 'write', 'delete'] },
        { resource: 'orders', actions: ['read', 'write', 'assign'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    } else if (role === 'supplierModerator') {
      permissions = [
        { resource: 'suppliers', actions: ['read'] },
        { resource: 'customers', actions: ['read'] },
        { resource: 'orders', actions: ['read', 'flag'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    } else if (role === 'driver') {
      permissions = [
        { resource: 'orders', actions: ['read', 'updateStatus'] },
        { resource: 'logistics', actions: ['read'] }
      ];
    }

    const user = new User({
      name,
      phone,
      email,
      role,
      apiKey: uuidv4(),
      permissions,
    });

    await user.save();

    res.json({ success: true, userId: user._id, apiKey: user.apiKey });
  } catch (error) {
    if (error.code === 11000) {
      console.log(error)
      return res.status(400).json({ error: 'Phone or email already exists' });
    }
    res.status(500).json({ error: 'Server error' + error });
  }
});

// Route 5 login with credentials provided by our server
// when user is created auto generate 
// unique id, password, secretcode, and master key 
// for highest level of security
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!password) {
      return res.status(400).json({ error: 'invalid password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('from db', user.auth.password);
    console.log('from request', password);

    const isMatch = await compareHashedValues(user.auth.password, user.auth.secretCode, password);
    console.log(isMatch, 'compare function');

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'space', { expiresIn: '6h' });
    return res.json({ success: true, token, apiKey: user.apiKey });

  } catch (error) {
    res.status(500).json({ error: 'Server error' + error });
  }
})

router.get('/list', async (req, res) => {
  const list = await User.find({});
  res.json({ list: list });
});

module.exports = router;
