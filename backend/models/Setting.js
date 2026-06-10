const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true },
  values: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
