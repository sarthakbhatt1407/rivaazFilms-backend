const mongoose = require("mongoose");

const InfOrderSchema = mongoose.Schema({
  brandName: { type: String, required: true },
  campaignName: { type: String, required: true },
  campaignDescription: { type: String, required: true },
  infId: { type: String, required: true },
  status: { type: String, required: true },
  orderAmount: { type: String },
  workLink: { type: String },
  remark: { type: String },
  remark: { type: String },
  images: { type: String, required: true },
  brandOrderId: { type: String, required: true },
});

module.exports = mongoose.model("Inforder", InfOrderSchema);
