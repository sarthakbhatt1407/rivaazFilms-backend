const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String },
    appleId: { type: String },
    spotifyId: { type: String },
    facebookUrl: { type: String },
    instagramUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", artistSchema);
