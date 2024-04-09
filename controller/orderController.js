const Order = require("../models/orderModel");
const { v4: uuidv4 } = require("uuid");

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
  } = req.body;
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }
  if (!req.files.file || !req.files.thumbnail) {
    if (req.files.file) {
      fs.unlink(req.files.file[0].path, (err) => {});
    }
    if (req.files.thumbnail) {
      fs.unlink(req.files.thumbnail[0].path, (err) => {});
    }
    return res.status(400).json({ message: "Please upload files!" });
  }
  const img = req.files.thumbnail[0];
  const file = req.files.file[0];

  const dateAndTime = dateFetcher();
  const createdOrder = new Order({
    labelName,
    title,
    dateOfRelease,
    albumType,
    language,
    userId,
    thumbnail: img.path,
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
  });

  try {
    await createdOrder.save();
  } catch (error) {
    console.log(error);
    fs.unlink(file.path, (err) => {});
    fs.unlink(img.path, (err) => {});
    return res.status(400).json({ message: "Unable to create order" });
  }
  return res.status(200).json({ message: "Order created", createdOrder });
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
  const { id, action } = req.query;

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
  } = req.body;

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

  if (action === "delete") {
    order.deleted = true;
  }
  if (action === "restore") {
    order.deleted = false;
  }
  if (action === "statusAccepted") {
    order.status = "processing";
  }
  if (action === "statusRejected") {
    order.status = "rejected";
    order.remark = remark;
  }
  if (action === "completed") {
    order.status = "completed";
    order.remark = "";
  }
  let img, file;
  if (action === "edit") {
    if (!req.files) {
      return res.status(400).json({ message: "Please upload files!" });
    }
    if (!req.files.file || !req.files.thumbnail) {
      if (req.files.file) {
        fs.unlink(req.files.file[0].path, (err) => {});
      }
      if (req.files.thumbnail) {
        fs.unlink(req.files.thumbnail[0].path, (err) => {});
      }
      return res.status(400).json({ message: "Please upload files!" });
    }
    const img = req.files.thumbnail[0];
    const file = req.files.file[0];

    fs.unlink(order.thumbnail, (err) => {});
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
    order.thumbnail = img.path;
    order.file = file.path;
  }

  try {
    await order.save();
  } catch (error) {
    console.log(error);
    fs.unlink(file.path, (err) => {});
    fs.unlink(img.path, (err) => {});
    return res.status(404).json({ message: "unable to update order" });
  }
  return res.status(200).json({ message: "order updated successfully", order });
};

exports.orderCreator = orderCreator;
exports.getOrderByOrderId = getOrderByOrderId;
exports.getOrderByUser = getOrderByUser;
exports.editOrderById = editOrderById;
