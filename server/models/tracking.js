// server/models/Tracking.js
const mongoose = require('mongoose');

const TrackingSchema = new mongoose.Schema({
  userId: String,
  url: String,
  timeSpent: Number,
  timestamp: Date,
});

module.exports = mongoose.model('Tracking', TrackingSchema);
