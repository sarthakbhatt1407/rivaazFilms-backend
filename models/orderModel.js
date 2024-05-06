const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  labelName: { type: String, required: true },
  subLabel1: { type: String },
  subLabel2: { type: String },
  subLabel3: { type: String },
  title: { type: String, required: true },
  dateOfRelease: { type: String, required: true },
  albumType: { type: String, required: true },
  language: { type: String, required: true },
  thumbnail: { type: String },
  orderDateAndTime: { type: String, required: true },
  file: { type: String, required: true },
  mood: { type: String, required: true },
  userId: { type: String, required: true },
  description: { type: String, required: true },
  singer: { type: String, required: true },
  composer: { type: String, required: true },
  director: { type: String, required: true },
  producer: { type: String, required: true },
  starCast: { type: String, required: true },
  lyrics: { type: String },
  status: { type: String },
  remark: { type: String },
  deleted: { type: Boolean },
  upc: { type: String },
  isrc: { type: String },
  lyricist: { type: String, required: true },
  crbt: { type: String },
  genre: { type: String },
});

module.exports = mongoose.model("Order", orderSchema);
