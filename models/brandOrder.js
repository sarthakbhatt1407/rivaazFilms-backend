const mongoose = require("mongoose");

const brandOrderSchema = mongoose.Schema({
  brandName: { type: String, required: true },
  campaignName: { type: String, required: true },
  collaborationId: { type: String, required: true },
  userId: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  paymentOrderId: { type: String },
  status: { type: String, required: true },
  paymentAmount: { type: Number },
  campaignUrl: { type: String, required: true },
  campaignDescription: { type: String, required: true },
  video: { type: String, required: true },
  images: { type: String, required: true },
  selectedInfluencers: { type: Array, required: true },

  audio: { type: String, required: true },
});

module.exports = mongoose.model("Brandorder", brandOrderSchema);
