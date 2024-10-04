const Notification = require("../models/notification");

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

exports.addNotification = async (req, res) => {
  const { des, id } = req.body;

  const dateAndTime = dateFetcher();

  const createdNot = new Notification({
    des,
    date: dateAndTime.split("/")[0],
    time: dateAndTime.split("/")[1],
  });
  try {
    await createdNot.save();
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "Notification added", success: true });
};

exports.getAllNoti = async (req, res) => {
  let notifications;
  try {
    notifications = await Notification.find({});
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({
    notifications: notifications.map((n) => {
      return n.toObject({ getters: true });
    }),
    success: true,
  });
};

exports.deleteNotifiction = async (req, res) => {
  const id = req.body.id;
  let noti;
  try {
    noti = await Notification.findById(id);
    if (!noti) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({ message: "Not found!" });
  }
  try {
    await noti.deleteOne();
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
  return res
    .status(400)
    .json({ message: "Notification deleted.", success: true });
};
