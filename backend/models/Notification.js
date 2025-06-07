const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  type:        { type: String, enum: ['invite', 'edit', 'join', 'custom'], required: true },
  message:     { type: String, required: true },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  isRead:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
