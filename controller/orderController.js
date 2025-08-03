const Order = require("../models/orderModel");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const Artist = require("../models/artist");

const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fs = require("fs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMPT_EMAIL,
    pass: process.env.SMPT_PASS,
  },
});
// sendSongLiveEmailToUser({email:'sarthakbhatt1407@gmail.com'},{});
function sendSongLiveEmailToUser(user, order) {
  console.log("Sending song live email to user:", user, order);

  if (!user.email) return;
  const mailOptions = {
    from: process.env.SMPT_EMAIL,
    to: user.email,
    subject: `🎵 Your Song "${order.title}" is Now Live!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
        <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
          <div style="text-align:center;">
            <img src="https://i.ibb.co/1ttPGZbp/ready.png" alt="Song Live" width="50" style="margin-bottom: 16px;" />
            <h2 style="color: #222;">Your Song is Live!</h2>
          </div>
          <p style="font-size: 16px; color: #444;">
            Hello <b>${user.name || "User"}</b>,
          </p>
          <p style="font-size: 16px; color: #444;">
            Congratulations! Your song <b>${
              order.title
            }</b> is now live on Rivaaz Films.
          </p>
          <div style="background: #f1f5fb; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <b>Label:</b> ${order.labelName || ""}<br/>
            <b>Release Date:</b> ${order.releaseDate || ""}<br/>
            <b>Status:</b> <span style="color:green;font-weight:bold;">Live</span>
          </div>
          <p style="font-size: 16px; color: #444;">
            Thank you for choosing Rivaaz Films. We wish your song great success!
          </p>
          <div style="text-align:center; margin: 24px 0;">
            <a href="https://rivaazfilms.com/" style="background: #007bff; color: #fff; padding: 12px 28px; border-radius: 5px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
          </div>
          <p style="font-size: 14px; color: #888; text-align:center;">
            Best regards,<br/>Rivaaz Films Team
          </p>
        </div>
      </div>
    `,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(`Failed to send live song email to user ${user._id}:`, err);
    }
  });
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dateFetcher = () => {
  const currentTime = new Date();

  const currentOffset = currentTime.getTimezoneOffset();

  const ISTOffset = 330; // IST offset UTC +5:30

  const date = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hrs = date.getHours();
  let min = date.getMinutes();
  let sec = date.getSeconds();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  if (hrs < 10) {
    hrs = "0" + hrs;
  }

  if (hrs < 10) {
    hrs = "0" + hrs;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  const fullDate = year + "-" + month + "-" + day;

  const time = hrs + ":" + min;
  const currentTimeAndDate = fullDate + "/" + time;
  return currentTimeAndDate;

  //   return { date: [year, months[month - 1], day], time: time };
};
function capitalizeName(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const orderCreator = async (req, res) => {
  const {
    labelName,
    title,
    dateOfRelease,
    albumType,
    language,
    mood,
    description,
    singer,
    composer,
    director,
    producer,
    starCast,
    lyrics,
    userId,
    subLabel1,
    subLabel2,
    subLabel3,
    upc,
    isrc,
    lyricist,
    crbt,
    genre,
    singerAppleId,
    singerSpotifyId,
    singerFacebookUrl,
    singerInstagramUrl,
    composerAppleId,
    composerSpotifyId,
    composerFacebookUrl,
    composerInstagramUrl,
    lyricistAppleId,
    lyricistSpotifyId,
    lyricistFacebookUrl,
    lyricistInstagramUrl,
    musicDirector,
    releaseDate,
    subgenre,
  } = req.body;
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }
  if (!req.files.file[0]) {
    return res.status(400).json({ message: "Please upload file!" });
  }
  if (!req.files.thumbnail[0]) {
    return res.status(400).json({ message: "Please upload thumbnail!" });
  }

  const file = req.files.file[0];
  const image = req.files.thumbnail[0];

  const dateAndTime = dateFetcher();
  const createdOrder = new Order({
    labelName,
    title,
    dateOfRelease,
    albumType,
    language,
    userId,
    thumbnail: "",
    file: file.path,
    thumbnail: image.path,
    mood,
    description,
    singer,
    composer,
    director,
    producer,
    starCast,
    lyrics,
    status: "waiting",
    orderDateAndTime: dateAndTime,
    deleted: false,
    remark: "",
    subLabel1,
    subLabel2,
    subLabel3,
    upc,
    isrc,
    lyricist,
    musicDirector,
    crbt,
    genre,
    singerAppleId,
    singerSpotifyId,
    singerFacebookUrl,
    singerInstagramUrl,
    composerAppleId,
    composerSpotifyId,
    composerFacebookUrl,
    composerInstagramUrl,
    lyricistAppleId,
    lyricistSpotifyId,
    lyricistFacebookUrl,
    lyricistInstagramUrl,
    dateLive: " ",
    releaseDate,
    subgenre,
  });

  try {
    await createdOrder.save();
  } catch (error) {
    console.log(error);
    fs.unlink(file.path, (err) => {});
    fs.unlink(image.path, (err) => {});

    return res.status(400).json({ message: "Unable to create order" });
  }
  let createdSinger,
    createdComposer,
    createdLyricist,
    createdDirector,
    createdProducer,
    createdMusicDirector;
  createdSinger = await Artist.findOne({ name: capitalizeName(singer) });
  if (!createdSinger) {
    createdSinger = new Artist({
      name: capitalizeName(singer),
      role: "singer",
      appleId: singerAppleId,
      spotifyId: singerSpotifyId,
      facebookUrl: singerFacebookUrl,
      instagramUrl: singerInstagramUrl,
    });
    await createdSinger.save();
  } else {
    createdSinger.appleId = singerAppleId;
    createdSinger.spotifyId = singerSpotifyId;
    createdSinger.facebookUrl = singerFacebookUrl;
    createdSinger.instagramUrl = singerInstagramUrl;
    await createdSinger.save();
  }
  if (composer.length > 0) {
    createdComposer = await Artist.findOne({ name: capitalizeName(composer) });
    if (!createdComposer) {
      createdComposer = new Artist({
        name: capitalizeName(composer),
        appleId: composerAppleId,
        spotifyId: composerSpotifyId,
        facebookUrl: composerFacebookUrl,
        instagramUrl: composerInstagramUrl,
        role: "composer",
      });
      await createdComposer.save();
    } else {
      createdComposer.appleId = composerAppleId;
      createdComposer.spotifyId = composerSpotifyId;
      createdComposer.facebookUrl = composerFacebookUrl;
      createdComposer.instagramUrl = composerInstagramUrl;
      await createdComposer.save();
    }
  }
  if (lyricist.length > 0) {
    createdLyricist = await Artist.findOne({ name: capitalizeName(lyricist) });
    if (!createdLyricist) {
      createdLyricist = new Artist({
        name: capitalizeName(lyricist),
        appleId: lyricistAppleId,
        spotifyId: lyricistSpotifyId,
        facebookUrl: lyricistFacebookUrl,
        instagramUrl: lyricistInstagramUrl,
        role: "lyricist",
      });
      await createdLyricist.save();
    } else {
      createdLyricist.appleId = lyricistAppleId;
      createdLyricist.spotifyId = lyricistSpotifyId;
      createdLyricist.facebookUrl = lyricistFacebookUrl;
      createdLyricist.instagramUrl = lyricistInstagramUrl;
      await createdLyricist.save();
    }
  }
  if (director.length > 0) {
    createdDirector = await Artist.findOne({ name: capitalizeName(director) });
    if (!createdDirector) {
      createdDirector = new Artist({
        name: capitalizeName(director),
        appleId: "",
        spotifyId: "",
        facebookUrl: "",
        instagramUrl: "",
        role: "lyricist",
      });
      await createdDirector.save();
    } else {
      createdDirector.appleId = "";
      createdDirector.spotifyId = "";
      createdDirector.facebookUrl = "";
      createdDirector.instagramUrl = "";
      await createdDirector.save();
    }
  }
  if (producer.length > 0) {
    createdProducer = await Artist.findOne({ name: capitalizeName(producer) });
    if (!createdProducer) {
      createdProducer = new Artist({
        name: capitalizeName(producer),
        appleId: "",
        spotifyId: "",
        facebookUrl: "",
        instagramUrl: "",
        role: "producer",
      });
      await createdProducer.save();
    } else {
      createdProducer.appleId = "";
      createdProducer.spotifyId = "";
      createdProducer.facebookUrl = "";
      createdProducer.instagramUrl = "";
      await createdProducer.save();
    }
  }

  if (musicDirector.length > 0) {
    createdMusicDirector = await Artist.findOne({
      name: capitalizeName(musicDirector),
    });

    if (!createdMusicDirector) {
      createdMusicDirector = new Artist({
        name: capitalizeName(musicDirector),
        appleId: "",
        spotifyId: "",
        facebookUrl: "",
        instagramUrl: "",
        role: "musicDirector",
      });
      await createdMusicDirector.save();
    } else {
      createdMusicDirector.appleId = "";
      createdMusicDirector.spotifyId = "";
      createdMusicDirector.facebookUrl = "";
      createdMusicDirector.instagramUrl = "";
      await createdMusicDirector.save();
    }
  }

  return res.status(200).json({ message: "Order created", createdOrder });
};

const getAllArtists = async (req, res) => {
  let artists;
  try {
    artists = await Artist.find({});
    if (!artists || artists.length === 0) {
      throw new Error("No artists found");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "No artists found" });
  }
  return res.status(200).json({
    artists: artists.map((artist) => {
      return artist.toObject({ getters: true });
    }),
  });
};

const addImage = async (req, res) => {
  const { orderId } = req.body;

  let order;
  try {
    order = await Order.findById(orderId);
    if (!order) {
      throw new Error("No order found");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "No order found" });
  }

  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  const img = req.files[0];

  order.thumbnail = img.path;
  try {
    await order.save();
  } catch (error) {
    console.log(error);
    cloudinary.v2.api
      .delete_resources([req.files.filename], {
        type: "upload",
        resource_type: "image",
      })
      .then(console.log);
    return res.status(404).json({ message: "unable to update order" });
  }
  return res.status(200).json({ message: "order updated successfully", order });
};

const getOrderByOrderId = async (req, res) => {
  const { id } = req.query;

  let order;
  try {
    order = await Order.findById(id);
    if (!order) {
      throw new Error("No order found");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "No order found" });
  }
  return res.status(200).json({ order: order.toObject({ getters: true }) });
};
const getOrderByUser = async (req, res) => {
  const { user } = req.query;

  let orders;
  try {
    orders = await Order.find({ userId: user });
    if (orders.length === 0) {
      throw new Error("No orders found");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "No orders found" });
  }
  return res.status(200).json({
    orders: orders.map((order) => {
      return order.toObject({ getters: true });
    }),
  });
};

const editOrderById = async (req, res) => {
  const { id, action, userId } = req.query;
  console.log(action);

  const {
    labelName,
    title,
    dateOfRelease,
    albumType,
    language,
    mood,
    description,
    singer,
    composer,
    director,
    producer,
    starCast,
    musicDirector,
    lyrics,
    remark,
    subLabel1,
    subLabel2,
    subLabel3,
    upc,
    isrc,
    lyricist,
    crbt,
    genre,
    singerAppleId,
    singerSpotifyId,
    singerFacebookUrl,
    singerInstagramUrl,
    composerAppleId,
    composerSpotifyId,
    composerFacebookUrl,
    composerInstagramUrl,
    lyricistAppleId,
    lyricistSpotifyId,
    lyricistFacebookUrl,
    lyricistInstagramUrl,
    admin,
    releaseDate,
    subgenre,
  } = req.body;

  let order, user;

  try {
    order = await Order.findById(id);
    if (!order) {
      throw new Error("No order found");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "No order found" });
  }

  if (action === "delete") {
    order.deleted = true;
    fs.unlink(order.file, (err) => {});
    fs.unlink(order.thumbnail, (err) => {});
  }
  if (action === "restore") {
    order.deleted = false;
  }
  if (
    action === "statusAccepted" ||
    action === "statusRejected" ||
    action === "takedown" ||
    action === "completed"
  ) {
    try {
      user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found!");
      }
    } catch (error) {
      return res.status(404).json({ message: "User not found!" });
    }
    if (!user.isAdmin) {
      return res
        .status(400)
        .json({ message: "You are not allowed to perform this action!" });
    }

    if (action === "statusAccepted") {
      order.status = "processing";
    }
    if (action === "statusRejected") {
      if (!remark) {
        return res.status(400).json({ message: "Please add remark!" });
      }
      order.status = "rejected";
      order.remark = remark;
    }
    if (action === "completed") {
      order.status = "completed";
      order.remark = "";
    }
    if (action === "takedown") {
      console.log(action);
      order.status = "takedown";
      order.remark = "";
    }
  }

  let file, thumbnail;

  if (action === "edit") {
    if (!req.files) {
      return res.status(400).json({ message: "Please upload files!" });
    }
    if (!req.files.file[0]) {
      return res.status(400).json({ message: "Please upload file!" });
    }
    if (!req.files.thumbnail[0]) {
      return res.status(400).json({ message: "Please upload thumbnail!" });
    }

    file = req.files.file[0];
    thumbnail = req.files.thumbnail[0];

    fs.unlink(order.file, (err) => {
      console.log(err);
    });
    fs.unlink(order.thumbnail, (err) => {});
    // if (!order.thumbnail.toString().includes("cloudinary")) {
    //   console.log("file removed!");
    //   fs.unlink(order.thumbnail, (err) => {});
    // } else {
    //   console.log("file not found!");
    // }

    order.labelName = labelName;
    order.title = title;
    order.dateOfRelease = dateOfRelease;
    order.albumType = albumType;
    order.mood = mood;
    order.description = description;
    order.singer = singer;
    order.composer = composer;
    order.director = director;
    order.producer = producer;
    order.starCast = starCast;
    order.lyrics = lyrics;
    order.language = language;
    order.upc = upc;
    order.genre = genre;
    order.isrc = isrc;
    order.lyricist = lyricist;
    order.crbt = crbt;
    order.musicDirector = musicDirector;
    order.status = "waiting";
    order.file = file.path;
    order.thumbnail = thumbnail.path;
    order.singerAppleId = singerAppleId;
    order.singerSpotifyId = singerSpotifyId;
    order.singerFacebookUrl = singerFacebookUrl;
    order.singerInstagramUrl = singerInstagramUrl;
    order.composerAppleId = composerAppleId;
    order.composerSpotifyId = composerSpotifyId;
    order.composerFacebookUrl = composerFacebookUrl;
    order.composerInstagramUrl = composerInstagramUrl;
    order.lyricistAppleId = lyricistAppleId;
    order.lyricistSpotifyId = lyricistSpotifyId;
    order.lyricistFacebookUrl = lyricistFacebookUrl;
    order.lyricistInstagramUrl = lyricistInstagramUrl;
    order.subLabel1 = subLabel1;
    order.subLabel2 = subLabel2;
    order.subLabel3 = subLabel3;
    order.remark = "";
    if (releaseDate && releaseDate.length > 0) {
      order.releaseDate = releaseDate;
    }
    order.subgenre = subgenre;
  }

  try {
    await order.save();
  } catch (error) {
    console.log(error);
    fs.unlink(file.path, (err) => {});
    return res.status(404).json({ message: "Unable to update order" });
  }
  return res
    .status(200)
    .json({ message: "Order updated successfully", success: true });
};

const getAllOrders = async (req, res) => {
  const { userId } = req.query;
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
  if (!user.isAdmin) {
    return res
      .status(400)
      .json({ message: "You are not allowed to perform this action!" });
  }
  let orders;
  try {
    orders = await Order.find({});
    if (!orders) {
      throw new Error("Something went wrong!");
    }
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }

  return res.status(200).json({
    orders: orders.map((ord) => {
      return ord.toObject({ getters: true });
    }),
  });
};

const addUPCISRT = async (req, res) => {
  const { id, upc, isrc, adminId } = req.body;
  const dateAndTime = dateFetcher();

  let admin;
  try {
    admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(400).json({ message: "Something went wrong" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
  let order;
  try {
    order = await Order.findById(id);
    if (!order) {
      return res.status(400).json({ message: "No order found" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
  order.upc = upc;
  order.isrc = isrc;
  order.status = "completed";
  order.dateLive = dateAndTime.split("/")[0];
  try {
    order.markModified("upc");
    order.markModified("isrc");
    order.markModified("status");
    order.markModified("dateLive");
    await order.save();
    const orderUser = await User.findById(order.userId);
    console.log("orderUser", orderUser);

    if (orderUser) {
      sendSongLiveEmailToUser(orderUser, order);
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
  return res.status(200).json({ message: "Order Updated Successfully", order });
};

exports.orderCreator = orderCreator;
exports.getOrderByOrderId = getOrderByOrderId;
exports.getOrderByUser = getOrderByUser;
exports.editOrderById = editOrderById;
exports.getAllOrders = getAllOrders;
exports.addImage = addImage;
exports.addUPCISRT = addUPCISRT;
exports.getAllArtists = getAllArtists;
