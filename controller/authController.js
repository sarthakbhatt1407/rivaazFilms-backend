const User = require("../models/user");
const bcrypt = require("bcryptjs");
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

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const userRegistration = async (req, res, next) => {
  const { name, email, password } = req.body;

  //
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  //   const hashedPass = await bcrypt.hash(password, 12);
  let user = await User.findOne({ email: email });
  if (user && user.email === email) {
    return res.status(400).json({ message: "Email already exists." });
  } else {
    const createdUser = new User({
      name,
      email,
      password: password,
      userSince: months[month] + " " + year,
      isAdmin: false,
    });
    if (!validateEmail(email)) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    try {
      await createdUser.save();
    } catch (err) {
      console.log(err);
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

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  let passIsValid = false;

  if (!validateEmail(email)) {
    return res.status(404).json({ message: "Invalid Email" });
  }
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({
      message: "Email not found, Please Signup first",
      success: false,
    });
  }

  //   passIsValid = await bcrypt.compare(password, user.password);
  if (user && email === user.email && password === user.password) {
    token = jwt.sign({ userId: user.id, userEmail: email }, "secret_key");
    req.session.token = token;
    req.session.userId = user.id;
    user.password = "Keep Guessing";
    return res.status(201).json({
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      message: "Logged In",
      isloggedIn: true,
      token: user.isAdmin === true ? token : "",
      success: true,
    });
  } else {
    return res
      .status(404)
      .json({ message: "Invalid Credentials", success: false });
  }
};

const userIsLoggedIn = async (req, res) => {
  const { userId, token } = req.body;
  if (req.session.userId || req.session.token) {
    return res.json({ session: req.session });
  } else {
    return res.json({ message: "logged out" });
  }
};

const destroySession = async (req, res) => {
  req.session.destroy(function (err) {
    console.log("Destroyed session");
  });
  return res
    .status(200)
    .json({ message: "logout successfully", isLoggedIn: false });
};

exports.userRegistration = userRegistration;
exports.userLogin = userLogin;
exports.userIsLoggedIn = userIsLoggedIn;
exports.destroySession = destroySession;
