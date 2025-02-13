const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String },
  description: { type: String },
  discountedPrice: { type: Number },
  originalPrice: { type: Number },
  selectedInf: { type: Array },
  type: { type: String },
});

module.exports = mongoose.model("package", userSchema);
