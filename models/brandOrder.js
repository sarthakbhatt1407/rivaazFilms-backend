const mongoose = require("mongoose");

const brandOrderSchema = mongoose.Schema({
  brandName: { type: String, required: true },
  campaignName: { type: String, required: true },
  collaborationId: { type: String, required: true },
  userId: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  paymentOrderId: { type: String },
  remark: { type: String },
  status: { type: String, required: true },
  paymentAmount: { type: Number },
  influencersAmount: { type: Number },
  campaignUrl: { type: String, required: true },
  campaignDescription: { type: String, required: true },
  video: { type: String },
  images: { type: String },
  selectedInfluencers: { type: Array, required: true },
  audio: { type: String },
});

module.exports = mongoose.model("Brandorder", brandOrderSchema);
