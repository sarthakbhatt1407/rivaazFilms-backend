const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  labelName: { type: String },
  subLabel1: { type: String },
  subLabel2: { type: String },
  subLabel3: { type: String },
  title: { type: String },
  dateOfRelease: { type: String },
  albumType: { type: String },
  language: { type: String },
  thumbnail: { type: String },
  orderDateAndTime: { type: String },
  file: { type: String },
  mood: { type: String },
  userId: { type: String },
  description: { type: String },
  singer: { type: String },
  composer: { type: String },
  director: { type: String },
  producer: { type: String },
  starCast: { type: String },
  lyrics: { type: String },
  status: { type: String },
  remark: { type: String },
  deleted: { type: Boolean },
  upc: { type: String },
  isrc: { type: String },
  lyricist: { type: String },
  crbt: { type: String },
  genre: { type: String },
  singerAppleId: { type: String },
  singerSpotifyId: { type: String },
  singerFacebookUrl: { type: String },
  singerInstagramUrl: { type: String },
  composerAppleId: { type: String },
  composerSpotifyId: { type: String },
  composerFacebookUrl: { type: String },
  composerInstagramUrl: { type: String },
  lyricistAppleId: { type: String },
  lyricistSpotifyId: { type: String },
  lyricistFacebookUrl: { type: String },
  lyricistInstagramUrl: { type: String },
});

module.exports = mongoose.model("Order", orderSchema);
