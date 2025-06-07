const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  role:        { type: String, enum: ['editor', 'viewer'], default: 'editor' },
  status:      { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Invite', inviteSchema);
