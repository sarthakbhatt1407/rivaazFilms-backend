const mongoose = require("mongoose");

const rentalPortfolioSchema = mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model("RentalPortfolio", rentalPortfolioSchema);
