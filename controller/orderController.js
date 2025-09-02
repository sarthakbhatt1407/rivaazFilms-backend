const Order = require("../models/orderModel");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const Artist = require("../models/artist");

const cloudinary = require("cloudinary");
const xlsx = require("xlsx");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fs = require("fs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
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
    youtubeContentId,
    youtubeMusic,
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
  console.log(musicDirector);

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
    youtubeContentId,
    youtubeMusic,
  });

  try {
    await createdOrder.save();
  } catch (error) {
    console.log(error);
    fs.unlink(file.path, (err) => {});
    fs.unlink(image.path, (err) => {});

    return res.status(400).json({ message: "Unable to create order" });
  }
  // let createdSinger,
  //   createdComposer,
  //   createdLyricist,
  //   createdDirector,
  //   createdProducer,
  //   createdMusicDirector;
  // createdSinger = await Artist.findOne({ name: capitalizeName(singer) });
  // if (!createdSinger) {
  //   createdSinger = new Artist({
  //     name: capitalizeName(singer),
  //     role: "singer",
  //     appleId: singerAppleId,
  //     spotifyId: singerSpotifyId,
  //     facebookUrl: singerFacebookUrl,
  //     instagramUrl: singerInstagramUrl,
  //   });
  //   await createdSinger.save();
  // } else {
  //   createdSinger.appleId = singerAppleId;
  //   createdSinger.spotifyId = singerSpotifyId;
  //   createdSinger.facebookUrl = singerFacebookUrl;
  //   createdSinger.instagramUrl = singerInstagramUrl;
  //   await createdSinger.save();
  // }
  // if (composer.length > 0) {
  //   createdComposer = await Artist.findOne({ name: capitalizeName(composer) });
  //   if (!createdComposer) {
  //     createdComposer = new Artist({
  //       name: capitalizeName(composer),
  //       appleId: composerAppleId,
  //       spotifyId: composerSpotifyId,
  //       facebookUrl: composerFacebookUrl,
  //       instagramUrl: composerInstagramUrl,
  //       role: "composer",
  //     });
  //     await createdComposer.save();
  //   } else {
  //     createdComposer.appleId = composerAppleId;
  //     createdComposer.spotifyId = composerSpotifyId;
  //     createdComposer.facebookUrl = composerFacebookUrl;
  //     createdComposer.instagramUrl = composerInstagramUrl;
  //     await createdComposer.save();
  //   }
  // }
  // if (lyricist.length > 0) {
  //   createdLyricist = await Artist.findOne({ name: capitalizeName(lyricist) });
  //   if (!createdLyricist) {
  //     createdLyricist = new Artist({
  //       name: capitalizeName(lyricist),
  //       appleId: lyricistAppleId,
  //       spotifyId: lyricistSpotifyId,
  //       facebookUrl: lyricistFacebookUrl,
  //       instagramUrl: lyricistInstagramUrl,
  //       role: "lyricist",
  //     });
  //     await createdLyricist.save();
  //   } else {
  //     createdLyricist.appleId = lyricistAppleId;
  //     createdLyricist.spotifyId = lyricistSpotifyId;
  //     createdLyricist.facebookUrl = lyricistFacebookUrl;
  //     createdLyricist.instagramUrl = lyricistInstagramUrl;
  //     await createdLyricist.save();
  //   }
  // }
  // if (director.length > 0) {
  //   createdDirector = await Artist.findOne({ name: capitalizeName(director) });
  //   if (!createdDirector) {
  //     createdDirector = new Artist({
  //       name: capitalizeName(director),
  //       appleId: "",
  //       spotifyId: "",
  //       facebookUrl: "",
  //       instagramUrl: "",
  //       role: "lyricist",
  //     });
  //     await createdDirector.save();
  //   } else {
  //     createdDirector.appleId = "";
  //     createdDirector.spotifyId = "";
  //     createdDirector.facebookUrl = "";
  //     createdDirector.instagramUrl = "";
  //     await createdDirector.save();
  //   }
  // }
  // if (producer.length > 0) {
  //   createdProducer = await Artist.findOne({ name: capitalizeName(producer) });
  //   if (!createdProducer) {
  //     createdProducer = new Artist({
  //       name: capitalizeName(producer),
  //       appleId: "",
  //       spotifyId: "",
  //       facebookUrl: "",
  //       instagramUrl: "",
  //       role: "producer",
  //     });
  //     await createdProducer.save();
  //   } else {
  //     createdProducer.appleId = "";
  //     createdProducer.spotifyId = "";
  //     createdProducer.facebookUrl = "";
  //     createdProducer.instagramUrl = "";
  //     await createdProducer.save();
  //   }
  // }

  // if (musicDirector.length > 0) {
  //   createdMusicDirector = await Artist.findOne({
  //     name: capitalizeName(musicDirector),
  //   });

  //   if (!createdMusicDirector) {
  //     createdMusicDirector = new Artist({
  //       name: capitalizeName(musicDirector),
  //       appleId: "",
  //       spotifyId: "",
  //       facebookUrl: "",
  //       instagramUrl: "",
  //       role: "musicDirector",
  //     });
  //     await createdMusicDirector.save();
  //   } else {
  //     createdMusicDirector.appleId = "";
  //     createdMusicDirector.spotifyId = "";
  //     createdMusicDirector.facebookUrl = "";
  //     createdMusicDirector.instagramUrl = "";
  //     await createdMusicDirector.save();
  //   }
  // }

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
    // Only check for files if at least one is being uploaded
    if (req.files && req.files.file && req.files.file[0]) {
      file = req.files.file[0];
      if (order.file) {
        fs.unlink(order.file, (err) => {
          if (err) console.log(err);
        });
      }
      order.file = file.path;
    }
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      thumbnail = req.files.thumbnail[0];
      if (order.thumbnail) {
        fs.unlink(order.thumbnail, (err) => {
          if (err) console.log(err);
        });
      }
      order.thumbnail = thumbnail.path;
    }

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

// Add a new artist
const addArtist = async (req, res) => {
  try {
    const { name, appleId, spotifyId, facebookUrl, instagramUrl, role } =
      req.body;
    if (!name) {
      return res.status(400).json({ message: "Artist name is required." });
    }
    const artist = new Artist({
      name: capitalizeName(name),
      appleId,
      spotifyId,
      facebookUrl,
      instagramUrl,
      role,
    });
    await artist.save();
    return res
      .status(201)
      .json({ message: "Artist added successfully.", artist });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add artist." });
  }
};

// Edit an artist by ID
const editArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, appleId, spotifyId, facebookUrl, instagramUrl, role } =
      req.body;
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found." });
    }
    if (name) artist.name = capitalizeName(name);
    if (appleId !== undefined) artist.appleId = appleId;
    if (spotifyId !== undefined) artist.spotifyId = spotifyId;
    if (facebookUrl !== undefined) artist.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) artist.instagramUrl = instagramUrl;

    if (role !== undefined) artist.role = role;
    await artist.save();
    return res
      .status(200)
      .json({ message: "Artist updated successfully.", artist });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update artist." });
  }
};

// Delete an artist by ID
const deleteArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findByIdAndDelete(id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found." });
    }
    return res.status(200).json({ message: "Artist deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete artist." });
  }
};
exports.sentOtpForDelete = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let info;
  try {
    info = await transporter.sendMail({
      from: '"Rivaaz Films" <info@rivaazfilms.com>', // sender address
      to: `rivaazfilm@gmail.com`, // list of receivers
      // to: `sarthakbhatt1407@gmail.com`, // list of receivers
      subject: "Account Deletion Verification", // Subject line
      text: `Your OTP is ${otp}`, // plain text body
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <p style="font-size: 16px;">Dear Admin,</p>
        <p style="font-size: 16px;">You have requested to delete a account with Rivaaz Films. Please use the following OTP to verify your request:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0;">${otp}</div>
        <p style="font-size: 16px;">If you did not request this account deletion, please ignore this email.</p>
        <p style="font-size: 16px;">Best regards,</p>
        <p style="font-size: 16px;">Rivaaz Films Team</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://www.rivaazfilms.com" style="color: #4CAF50; text-decoration: none; font-size: 16px;">Visit our website</a>
        </div>
      </div>
    `, // html body
    });
  } catch (error) {
    return res.json({ info, message: "Unable to send", sent: false });
  }
  return res.json({ otp, message: "Sent", sent: true });
};
exports.exportOrderDetailsToExcel = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prepare data for Excel
    const wsData = [
      [
        "CRBT CUTS",
        "SONG",
        "FILM/ALBUM",
        "ALBUM CATEGORY",
        "LANGUAGE",
        "GENRE/ Category",
        "Sub Category",
        "Description",
        "Physical File name",
        "Physical artwork name",
        "Track Duration",
        "Track no.",
        "UPC ID",
        "DATE OF MOVIE RELEASE",
        "DATE OF MUSIC RELEASE",
        "GO LIVE DATE",
        "DATE OF EXPIRY",
        "Film Banner",
        "Director",
        "Producer",
        "Star cast",
        "ISRC",
        "LABEL",
        "IPRS Ownership (Yes/No) (Label)",
        "IPI (Label)",
        "Publisher",
        "IPRS Ownership (Yes/No)",
        "LYRICIST",
        "IPI (LYRICIST)",
        "IPRS member (Yes/No) (LYRICIST)",
        "COMPOSER",
        "IPRS member (Yes/No) (COMPOSER)",
        "IPI (COMPOSR)",
        "ARTIST1/ Singer",
        "SOUND RECORDING RIGHTS",
        "MUSICAL & LITERARY WORKS",
        "PAY To Rights",
        "Mood",
        "Time",
      ],
      [
        order.crbt || "",
        order.title || "",
        order.albumType || "",
        order.albumType || "",
        order.language || "",
        order.genre || "",
        order.subgenre || "",
        order.description || "",
        order.title || "",
        order.title || "",
        "", // Track Duration
        "", // Track no.
        order.upc || "",
        "",
        order.dateOfRelease || "",
        order.dateOfRelease || "",
        "", // DATE OF EXPIRY
        "",
        order.director || "",
        order.producer || "",
        order.starCast || "",
        order.isrc || "",
        order.labelName || "",
        "", // IPRS Ownership (Yes/No) (Label)
        "", // IPI (Label)
        order.labelName || "", // Publisher
        "", // IPRS Ownership (Yes/No)
        order.lyricist || "",
        "", // IPI (LYRICIST)
        "", // IPRS member (Yes/No) (LYRICIST)
        order.composer || "",
        "", // IPRS member (Yes/No) (COMPOSER)
        "", // IPI (COMPOSR)
        order.singer || "",
        "", // SOUND RECORDING RIGHTS
        "", // MUSICAL & LITERARY WORKS
        "", // PAY To Rights
        order.mood || "",
        "", // Time
      ],
    ];

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(wsData);
    xlsx.utils.book_append_sheet(wb, ws, "Order Details");

    // Save file to temp location
    const dirPath = path.join(__dirname, "..", "uploads", "reports");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filename = `${order.title}.xlsx`;
    const filePath = path.join(dirPath, filename);
    xlsx.writeFile(wb, filePath);

    // Send file for download
    res.download(filePath, filename, (err) => {
      setTimeout(() => {
        fs.unlink(filePath, () => {});
      }, 1000);
    });
  } catch (error) {
    console.error("Error exporting order details:", error);
    return res.status(500).json({ message: "Failed to export order details" });
  }
};
exports.exportAllCompletedOrdersToExcel = async (req, res) => {
  const { action } = req.params;
  try {
    // Fetch all completed orders
    const orders = await Order.find({ status: action, deleted: false });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No completed orders found" });
    }

    // Prepare data for Excel
    const headers = [
      "CRBT CUTS",
      "SONG",
      "FILM/ALBUM",
      "ALBUM CATEGORY",
      "LANGUAGE",
      "GENRE/ Category",
      "Sub Category",
      "Description",
      "Physical File name",
      "Physical artwork name",
      "Track Duration",
      "Track no.",
      "UPC ID",
      "DATE OF MOVIE RELEASE",
      "DATE OF MUSIC RELEASE",
      "GO LIVE DATE",
      "DATE OF EXPIRY",
      "Film Banner",
      "Director",
      "Producer",
      "Star cast",
      "ISRC",
      "LABEL",
      "IPRS Ownership (Yes/No) (Label)",
      "IPI (Label)",
      "Publisher",
      "IPRS Ownership (Yes/No)",
      "LYRICIST",
      "IPI (LYRICIST)",
      "IPRS member (Yes/No) (LYRICIST)",
      "COMPOSER",
      "IPRS member (Yes/No) (COMPOSER)",
      "IPI (COMPOSR)",
      "ARTIST1/ Singer",
      "SOUND RECORDING RIGHTS",
      "MUSICAL & LITERARY WORKS",
      "PAY To Rights",
      "Mood",
      "Time",
    ];

    const wsData = [headers];

    orders.forEach((order) => {
      wsData.push([
        order.crbt || "",
        order.title || "",
        order.albumType || "",
        order.albumType || "",
        order.language || "",
        order.genre || "",
        order.subgenre || "",
        order.description || "",
        order.title || "",
        order.title || "",
        "", // Track Duration
        "", // Track no.
        order.upc || "",
        "",
        order.dateOfRelease || "",
        order.dateOfRelease || "",
        "", // DATE OF EXPIRY
        "",
        order.director || "",
        order.producer || "",
        order.starCast || "",
        order.isrc || "",
        order.labelName || "",
        "", // IPRS Ownership (Yes/No) (Label)
        "", // IPI (Label)
        order.labelName || "", // Publisher
        "", // IPRS Ownership (Yes/No)
        order.lyricist || "",
        "", // IPI (LYRICIST)
        "", // IPRS member (Yes/No) (LYRICIST)
        order.composer || "",
        "", // IPRS member (Yes/No) (COMPOSER)
        "", // IPI (COMPOSR)
        order.singer || "",
        "", // SOUND RECORDING RIGHTS
        "", // MUSICAL & LITERARY WORKS
        "", // PAY To Rights
        order.mood || "",
        "", // Time
      ]);
    });

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(wsData);
    xlsx.utils.book_append_sheet(wb, ws, "Completed Songs");

    // Save file to temp location
    const dirPath = path.join(__dirname, "..", "uploads", "reports");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filename = `all_${action}_songs_${Date.now()}.xlsx`;
    const filePath = path.join(dirPath, filename);
    xlsx.writeFile(wb, filePath);

    // Send file for download
    res.download(filePath, filename, (err) => {
      setTimeout(() => {
        fs.unlink(filePath, () => {});
      }, 1000);
    });
  } catch (error) {
    console.error("Error exporting completed orders:", error);
    return res
      .status(500)
      .json({ message: "Failed to export completed orders" });
  }
};

exports.addArtist = addArtist;
exports.editArtistById = editArtistById;
exports.deleteArtistById = deleteArtistById;
exports.orderCreator = orderCreator;
exports.getOrderByOrderId = getOrderByOrderId;
exports.getOrderByUser = getOrderByUser;
exports.editOrderById = editOrderById;
exports.getAllOrders = getAllOrders;
exports.addImage = addImage;
exports.addUPCISRT = addUPCISRT;
exports.getAllArtists = getAllArtists;
