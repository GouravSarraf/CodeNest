// models/Project.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  folders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }]
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ owner: 1, name: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
