// models/File.js
const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  language: { type: String, required: true }, // e.g. 'javascript', 'python'
  content: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null, // null for root folders
  },
  path: { type: String, required: true }, // Add this line
});

module.exports = mongoose.model("File", FileSchema);
