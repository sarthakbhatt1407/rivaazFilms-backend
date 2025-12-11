const mongoose = require("mongoose");

const gallerySchema = mongoose.Schema({
  type: { type: String, required: true },
  category: { type: String, required: true },
  link: { type: String, required: true },
});

module.exports = mongoose.model("WeddingGallery", gallerySchema);
