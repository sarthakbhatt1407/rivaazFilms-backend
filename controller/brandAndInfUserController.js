const brandUser = require("../models/prouser");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
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

exports.userExists = async (req, res) => {
  const { contactNum } = req.body;

  if (!contactNum || contactNum.length === 0) {
    return res.status(400).json({ message: "Kindly fill contact number" });
  }

  let user = await brandUser.findOne({ contactNum: contactNum });
  if (user) {
    return res
      .status(201)
      .json({ message: "User already exists.", exists: true });
  }
  return res.status(404).json({ message: "User not exists.", exists: false });
};

exports.userRegistration = async (req, res, next) => {
  const { name, contactNum, email } = req.body;

  //
  const date = new Date();

  let month = date.getMonth();
  let year = date.getFullYear();

  let user = await brandUser.findOne({ contactNum: contactNum });
  if (user) {
    return res
      .status(400)
      .json({ message: "User already exists.", exists: true });
  } else {
    const createdUser = new brandUser({
      name,
      contactNum,
      email,
      userSince: months[month] + " " + year,
      userType: "promoter",
      isAdmin: false,
    });

    try {
      await createdUser.save();
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Unable to register user.", success: false });
    }
    res.status(200).json({
      message: "Sign up successful..",
      success: true,
    });
  }
};

exports.userLogin = async (req, res) => {
  const { contactNum } = req.body;
  let user, token;
  try {
    user = await brandUser.findOne({ contactNum: contactNum });
    if (!user) {
      throw new Error();
    }
  } catch {
    return res.status(404).json({ message: "User not found", success: false });
  }
  token = jwt.sign(
    { userId: user.id, contactNum: user.contactNum },
    "secret_key"
  );
  return res.status(404).json({
    user: {
      name: user.name,
      id: user.id,
      contact: user.contactNum,

      userSince: user.userSince,
      token: token,
      userType: user.userType,
    },
    message: "Logged In",
    isloggedIn: true,
  });
};

exports.getUserByUserID = async (req, res) => {
  const { id } = req.body;
  let user;
  try {
    user = await brandUser.findById(id);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!", status: true });
  }
  return res
    .status(200)
    .json({ user: user.toObject({ getters: true }), status: true });
};
exports.getAllUsers = async (req, res) => {
  let users;
  try {
    users = await brandUser.find({});
  } catch (error) {}
  return res.status(200).json({
    users: users.map((u) => {
      return u.toObject({ getters: true });
    }),
    status: true,
  });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.body;
  let user;
  try {
    user = await brandUser.findById(id);

    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!", success: false });
  }
  try {
    await user.deleteOne();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting user", success: false });
  }
  return res.status(200).json({ message: "User Deleted", success: true });
};

exports.brandAndAdminChat = async (req, res) => {
  const { brandId, adminId, message, from } = req.body;
  let user;
  let sender = from == brandId ? "self" : "other";
  try {
    user = await brandUser.findById(brandId);

    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!", success: false });
  }
  let chats = user.chats;
  chats.push({
    text: message,
    sender: sender,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    id: uuidv4(),
  });
  try {
    await user.save();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Unable to send message.", success: false });
  }
  res.status(200).json({
    message: "Message sent.",
    success: true,
  });
};
exports.getBrandAndAdminChat = async (req, res) => {
  const { brandId } = req.body;

  try {
    const user = await brandUser.findById(brandId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!", success: false });
    }

    res.status(200).json({
      chats: user.chats,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat.", success: false });
  }
};
