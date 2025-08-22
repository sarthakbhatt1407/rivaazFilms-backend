const Copyright = require("../models/copyright");
const User = require("../models/user");

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

const createNewCopyRight = async (req, res) => {
  const { userId, link, platform } = req.body;
  let user, createdQuery;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }
  } catch (error) {
    return res.status(400).json({ message: "User not found!" });
  }
  createdQuery = new Copyright({
    userId,
    link,
    platform,
    created: dateFetcher(),
    userName: user.name,
    phone: user.phone,
    deleted: false,
    status: "pending",
  });

  try {
    await createdQuery.save();
  } catch (error) {
    return res.status(400).json({ message: "Something went worng!" });
  }
  return res.status(200).json({ message: "Query created.", createdQuery });
};

const updateCopyrightQuery = async (req, res) => {
  const { id, action } = req.query;
  let cQuery;
  try {
    cQuery = await Copyright.findById(id);
    if (!cQuery) {
      throw new Error("No Query found!");
    }
  } catch (error) {
    return res.status(400).json({ message: "No query found!" });
  }
  if (action === "delete") {
    cQuery.deleted = true;
  }
  if (action === "rejected") {
    cQuery.status = "rejected";
  }
  if (action === "resolved") {
    cQuery.status = "resolved";
  }

  try {
    await cQuery.save();
  } catch (error) {
    return res.status(400).json({ message: "Something went worng!" });
  }
  return res.status(200).json({ message: "Query updated.", cQuery });
};

const getAllQueryByUserId = async (req, res) => {
  const { userId } = req.query;

  let cQueries;
  try {
    cQueries = await Copyright.find({ userId: userId });
    if (!cQueries) {
      throw new Error("No queries found!");
    }
  } catch (error) {
    return res.status(400).json({ message: "No queries found!" });
  }
  return res.status(200).json({
    cQueries: cQueries.map((q) => {
      return q.toObject({ getters: true });
    }),
  });
};
const getAllQueries = async (req, res) => {
  let cQueries;
  try {
    cQueries = await Copyright.find();
    if (!cQueries) {
      throw new Error("No queries found!");
    }
  } catch (error) {
    return res.status(400).json({ message: "No queries found!" });
  }
  return res.status(200).json({
    cQueries: cQueries.map((q) => {
      return q.toObject({ getters: true });
    }),
  });
};

exports.createNewCopyRight = createNewCopyRight;
exports.updateCopyrightQuery = updateCopyrightQuery;
exports.getAllQueryByUserId = getAllQueryByUserId;
exports.getAllQueries = getAllQueries;
