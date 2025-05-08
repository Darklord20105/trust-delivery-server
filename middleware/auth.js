const jwt = require('jsonwebtoken');
const User = require('../schema/usersSchema/usersSchema');

const authMiddleware = (resource, action) => async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const apiKey = req.header('X-API-Key');
    if (!token || !apiKey) {
      return res.status(401).json({ error: 'Missing token or API key' });
    }
    const decoded = jwt.verify(token, 'space');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (user.apiKey !== apiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (user.role === 'supplierAdmin' && !user.kyc.verified) {
      return res.status(403).json({ error: 'KYC not verified' });
    }
    if (user.role === 'superAdmin') {
      req.user = decoded;
      return next();
    }
    const permission = user.permissions.find(p => p.resource === resource);
    if (!permission || !permission.actions.includes(action)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
