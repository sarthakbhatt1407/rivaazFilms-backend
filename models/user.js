const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  finacialReport: { type: Array, required: true },
  analytics: { type: Array, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  password: { type: String, required: true },
  userSince: { type: String, required: true },
  isAdmin: { type: Boolean, required: true },
  bankDetails: { type: Array, required: true },
  channelUrl: { type: String, required: true },
  sign: { type: String, required: true },
  userPic: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
