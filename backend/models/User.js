const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  postalCode: String,
  country: { type: String, default: 'India' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: String,
  profileImage: String,
  defaultAddress: addressSchema,
  savedAddresses: { type: [addressSchema], default: [] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false },
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0 },
  resetOtp: String,
  resetOtpExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
