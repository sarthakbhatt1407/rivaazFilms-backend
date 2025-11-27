const mongoose = require("mongoose");

const rentalOrderSchema = mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  bookingDateFrom: { type: String, required: true },
  bookingDateTo: { type: String, required: true },
  notes: { type: String },
  amount: { type: Number, required: true },
  rentalItem: {
    type: Array,
    required: true,
  },
  status: { type: String, default: "Pending" },
});

module.exports = mongoose.model("RentalOrder", rentalOrderSchema);
