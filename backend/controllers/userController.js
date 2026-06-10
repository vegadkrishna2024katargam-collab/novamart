const mongoose = require('mongoose');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');
const { buildAddress, hasAddress, mergeSavedAddresses } = require('../utils/addressUtils');
const { serializeUser } = require('../utils/userSerializer');

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function normalizeProfilePayload(body = {}) {
  const addressSource = body.defaultAddress || body.shippingAddress || body.address || body;
  return {
    name: body.name?.trim?.() || undefined,
    email: body.email?.trim?.().toLowerCase?.() || undefined,
    phone: body.phone?.trim?.() || undefined,
    profileImage: body.profileImage || undefined,
    defaultAddress: buildAddress(addressSource),
    savedAddresses: Array.isArray(body.savedAddresses) ? body.savedAddresses.map(buildAddress) : undefined,
  };
}

exports.getMe = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const user = demoStore.findUserById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user: demoStore.publicUser(user) });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const payload = normalizeProfilePayload(req.body);
    if (!isMongoReady()) {
      let user = demoStore.updateUserProfile(req.user._id, payload);
      if (!user && payload.email) {
        user = await demoStore.upsertUser({
          id: req.user._id,
          role: req.user.role || 'user',
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          defaultAddress: payload.defaultAddress,
          savedAddresses: payload.savedAddresses,
        });
      }
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user: demoStore.publicUser(user) });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (req.file) user.profileImage = `/uploads/${req.file.filename}`;
    if (hasAddress(payload.defaultAddress)) {
      user.defaultAddress = payload.defaultAddress;
      user.savedAddresses = mergeSavedAddresses(user.savedAddresses, payload.defaultAddress);
    }
    if (Array.isArray(payload.savedAddresses)) user.savedAddresses = payload.savedAddresses;
    await user.save();
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '').trim();
    const newPassword = String(req.body.newPassword || '').trim();
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

    if (!isMongoReady()) {
      const result = await demoStore.changeUserPassword(req.user._id, currentPassword, newPassword);
      if (!result.user) return res.status(404).json({ message: 'User not found' });
      if (!result.valid) return res.status(400).json({ message: 'Current password is incorrect' });
      return res.json({ message: 'Password updated successfully' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
