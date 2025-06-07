// models/Folder.js
const mongoose = require("mongoose");

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
  ],
  folders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
  ],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null, // null for root folders
  },
  path: { type: String, required: true }, // Add this line
  createdAt: { type: Date, default: Date.now },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

module.exports = mongoose.model("Folder", FolderSchema);
