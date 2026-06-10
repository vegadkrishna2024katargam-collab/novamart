const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');
const generateToken = require('../utils/generateToken');
const { serializeUser } = require('../utils/userSerializer');

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

exports.signup = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const user = await demoStore.upsertUser({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        role: 'user',
      });
      return res.status(201).json({ user: demoStore.publicUser(user), token: generateToken(user) });
    }
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ ...req.body, profileImage: req.file ? `/uploads/${req.file.filename}` : undefined });
    res.status(201).json({ user: serializeUser(user), token: generateToken(user) });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const role = req.body.email?.toLowerCase().includes('admin') ? 'admin' : 'user';
      let user = demoStore.findUserByEmail(req.body.email);
      if (!user) {
        user = await demoStore.upsertUser({ email: req.body.email, name: req.body.email?.split('@')[0], password: req.body.password, role });
      } else if (user.passwordHash) {
        const valid = await demoStore.verifyPassword(user, req.body.password);
        if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
      } else {
        await demoStore.setPassword(user, req.body.password);
      }
      return res.json({ user: demoStore.publicUser(user), token: generateToken(user) });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matchPassword(req.body.password))) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });
    res.json({ user: serializeUser(user), token: generateToken(user) });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => res.json({ message: 'Logged out' });

exports.forgotPassword = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json({ message: 'Password reset is unavailable in demo mode' });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If the email exists, an OTP was generated' });
    user.resetOtp = crypto.randomInt(100000, 999999).toString();
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.json({ message: 'OTP generated for email verification', otp: process.env.NODE_ENV === 'production' ? undefined : user.resetOtp });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.status(400).json({ message: 'Password reset is unavailable in demo mode' });
    const user = await User.findOne({ email: req.body.email, resetOtp: req.body.otp, resetOtpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
    user.password = req.body.password;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
