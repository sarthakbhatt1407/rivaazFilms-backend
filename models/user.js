const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  finacialReport: { type: Array, required: true },
  analytics: { type: Array, required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  password: { type: String, required: true },
  userSince: { type: String, required: true },
  isAdmin: { type: Boolean, required: true },
});

module.exports = mongoose.model("User", userSchema);
