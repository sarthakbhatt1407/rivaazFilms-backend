const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  contactNum: { type: Number, required: true },
  email: { type: String, required: true },
  chats: { type: Array, required: true },
  userSince: { type: String },
  userType: { type: String },
  deleted: { type: Boolean },
});

module.exports = mongoose.model("brandUser", userSchema);
