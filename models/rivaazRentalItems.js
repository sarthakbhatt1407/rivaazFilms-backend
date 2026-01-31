const mongoose = require("mongoose");

const rentalItems = mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  dailyRate: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String },
  specifications: { type: String },
  quantity: { type: Number, default: 1 },
  remaining: { type: Number },
});

module.exports = mongoose.model("RentalItems", rentalItems);
