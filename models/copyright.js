const mongoose = require("mongoose");

const copyrightSchema = mongoose.Schema({
  userId: { type: String, required: true },
  link: { type: String, required: true },
  platform: { type: String, required: true },
  created: { type: String, required: true },
  userName: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, required: true },
  deleted: { type: Boolean, required: true },
});

module.exports = mongoose.model("Copyright", copyrightSchema);
