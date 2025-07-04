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
  socialMediaUrl: { type: String },
  facebookUrl: { type: String },
  youtubeUrl: { type: String },
  tikTokUrl: { type: String },
  spotifyUrl: { type: String },
  jioSaavnUrl: { type: String },
  bankAccountHolderName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  bankName: { type: String },
  profession: { type: String },
  profileImage: { type: String },
  status: { type: String },
  paymentStatus: { type: String },
  paymentOrderId: { type: String },
  price: { type: Number },
  city: { type: String },
  state: { type: String },
  bonus: { type: Array },
  wallet: { type: Array },

  legalDoc: { type: String, required: true },
});

module.exports = mongoose.model("infUser", userSchema);
