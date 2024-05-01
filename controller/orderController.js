const Order = require("../models/orderModel");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");

const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dt0jiqrmv",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const fs = require("fs");

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
  } = req.body;
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  const file = req.files.file[0];

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
    crbt,
  });

  try {
    await createdOrder.save();
  } catch (error) {
    console.log(error);
    fs.unlink(file.path, (err) => {});

    return res.status(400).json({ message: "Unable to create order" });
  }
  return res.status(200).json({ message: "Order created", createdOrder });
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
  if (order.thumbnail.trim().length > 0) {
    const imgPathArr = order.thumbnail.split("/");
    const targetImg = "rivaaz-films" + "/" + imgPathArr[imgPathArr.length - 1];

    cloudinary.v2.api
      .delete_resources([targetImg.split(".")[0]], {
        type: "upload",
        resource_type: "image",
      })
      .then(console.log);
  }

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
    remark,
    subLabel1,
    subLabel2,
    subLabel3,
    upc,
    isrc,
    lyricist,
    crbt,
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
    const imgPathArr = order.thumbnail.split("/");
    const targetImg = "rivaaz-films" + "/" + imgPathArr[imgPathArr.length - 1];

    cloudinary.v2.api
      .delete_resources([targetImg.split(".")[0]], {
        type: "upload",
        resource_type: "image",
      })
      .then(console.log);
    fs.unlink(order.file, (err) => {});
  }
  if (action === "restore") {
    order.deleted = false;
  }
  if (
    action === "statusAccepted" ||
    action === "statusRejected" ||
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
  }

  let file;
  if (action === "edit") {
    if (!req.files) {
      return res.status(400).json({ message: "Please upload files!" });
    }

    const file = req.files.file[0];

    fs.unlink(order.file, (err) => {});

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
    order.isrc = isrc;
    order.lyricist = lyricist;
    order.crbt = crbt;

    order.file = file.path;
    order.remark = "";
    order.status = "waiting";
  }

  try {
    await order.save();
  } catch (error) {
    console.log(error);
    fs.unlink(file.path, (err) => {});
    return res.status(404).json({ message: "unable to update order" });
  }
  return res.status(200).json({ message: "order updated successfully", order });
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

exports.orderCreator = orderCreator;
exports.getOrderByOrderId = getOrderByOrderId;
exports.getOrderByUser = getOrderByUser;
exports.editOrderById = editOrderById;
exports.getAllOrders = getAllOrders;
exports.addImage = addImage;
