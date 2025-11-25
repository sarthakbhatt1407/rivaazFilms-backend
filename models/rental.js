const mongoose = require("mongoose");

const rentalAccessorySchema = mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'jewelry', 'dress', 'decor'
  name: { type: String, required: true }, // accessory name
  period: { type: String, required: true }, // accessory name
  link: { type: String, required: true }, // image or detail link
  price: { type: Number, required: true }, // rental price
  available: { type: Boolean, default: true }, // availability status
  description: { type: String }, // optional description
  specification: { type: String }, // optional description
  included: { type: String }, // optional description
});

module.exports = mongoose.model(
  "WeddingRentalAccessory",
  rentalAccessorySchema
);
