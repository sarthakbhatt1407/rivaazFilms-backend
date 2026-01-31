const mongoose = require("mongoose");

const rentalCategory = mongoose.Schema({
  name: { type: String, required: true }, // accessory name
  image: { type: String, required: true }, // accessory image
});

module.exports = mongoose.model("RentalCategory", rentalCategory);
