const mongoose = require("mongoose");

const notiSchema = mongoose.Schema({
  des: { type: String },
  date: { type: String },
  time: { type: String },
});

module.exports = mongoose.model("Notification", notiSchema);
