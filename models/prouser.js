const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  contactNum: { type: String, required: true },
  email: { type: String, required: true },
  userSince: { type: String },
  userType: { type: String },
  deleted: { type: Boolean },
  fullAddress: { type: String },
  pinCode: { type: String },
  city: { type: String },
  state: { type: String },
  profileImage: { type: String },
});

module.exports = mongoose.model("brandUser", userSchema);
