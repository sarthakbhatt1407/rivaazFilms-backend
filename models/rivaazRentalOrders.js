const mongoose = require("mongoose");

const rivaazRentalOrdersSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    fromDate: { type: String },
    toDate: { type: String },
    notes: { type: String },
    items: { type: Array },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RivaazRentalOrder", rivaazRentalOrdersSchema);
