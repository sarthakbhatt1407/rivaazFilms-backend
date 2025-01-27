const mongoose = require("mongoose");

const InfOrderSchema = mongoose.Schema({
  brandName: { type: String, required: true },
  campaignName: { type: String, required: true },
  campaignDescription: { type: String, required: true },
  infId: { type: String, required: true },

  images: { type: String, required: true },

  brandOrderId: { type: String, required: true },
});

module.exports = mongoose.model("Inforder", InfOrderSchema);
