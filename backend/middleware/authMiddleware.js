const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    // Support frontend local demo tokens:
    // frontend stores token like: local-<base64(JSON.stringify({id, role}))>
    // This keeps order placement working even when JWT_SECRET verification isn't possible.
    if (token.startsWith('local-')) {
      try {
        const payloadBase64 = token.slice('local-'.length);
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const decoded = JSON.parse(payloadJson);
        const demoUser = demoStore.findUserById(decoded.id) || { _id: decoded.id, id: decoded.id, role: decoded.role || 'user' };
        req.user = demoUser;
        return next();
      } catch {
        return res.status(401).json({ message: 'Token failed' });
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (!isMongoReady()) {
      const demoUser = demoStore.findUserById(decoded.id) || { _id: decoded.id, id: decoded.id, role: decoded.role || 'user' };

      req.user = demoUser;
      return next();
    }
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token failed' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};
