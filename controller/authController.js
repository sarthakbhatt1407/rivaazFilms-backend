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
  const { name, email, password, phone, city, state, country } = req.body;

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
      phone,
      finacialReport: [],
      analytics: [],
      city,
      state,
      country,
      bankDetails: [
        {
          accountNo: "",
          ifsc: "",
          bankName: "",
          upi: "",
        },
      ],
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

const userAnalyticsReportAdder = async (req, res) => {
  const { userId, adminId, year, report } = req.body;
  let user, admin;
  try {
    user = await User.findById(userId);
    admin = await User.findById(adminId);
    if (!user || !admin) {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Something went wrong!" });
  }
  if (!admin.isAdmin) {
    return res.status(400).json({ message: "you are not allowed." });
  }
  if (!report || !year) {
    return res.status(400).json({ message: "plaese add report" });
  }
  let userAnalyticsReport = user.analytics;
  if (userAnalyticsReport.length === 0) {
    userAnalyticsReport = [
      {
        [year]: { ...report },
      },
    ];
  } else {
    userAnalyticsReport[0][year] = { ...report };
  }

  user.analytics = userAnalyticsReport;
  try {
    user.markModified("analytics");
    await user.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "Report Added" });
};
const userFinancialReportAdder = async (req, res) => {
  const { userId, adminId, year, report } = req.body;
  let user, admin;
  try {
    user = await User.findById(userId);
    admin = await User.findById(adminId);
    if (!user || !admin) {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Something went wrong!" });
  }
  if (!admin.isAdmin) {
    return res.status(400).json({ message: "you are not allowed." });
  }
  if (!report || !year) {
    return res.status(400).json({ message: "plaese add report" });
  }
  let userFinanceReport = user.finacialReport;
  if (userFinanceReport.length === 0) {
    userFinanceReport = [
      {
        [year]: { ...report },
      },
    ];
  } else {
    userFinanceReport[0][year] = { ...report };
  }

  user.finacialReport = userFinanceReport;
  try {
    user.markModified("finacialReport");
    await user.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "Report Added" });
};

const getUserDetailsWithUserId = async (req, res) => {
  const { id } = req.query;
  let user;
  try {
    user = await User.findById(id);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Something went wrong!" });
  }

  return res.status(200).json({ user });
};

const userBankDetails = async (req, res) => {
  const { accountNo, ifsc, bankName, upi, userId } = req.body;
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error("No user found!");
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
  let obj = {
    accountNo,
    ifsc,
    bankName,
    upi,
  };
  user.bankDetails = [{ ...obj }];

  try {
    await user.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "Bank details added.", user });
};

exports.userRegistration = userRegistration;
exports.userLogin = userLogin;
exports.userIsLoggedIn = userIsLoggedIn;
exports.userAnalyticsReportAdder = userAnalyticsReportAdder;
exports.userFinancialReportAdder = userFinancialReportAdder;
exports.getUserDetailsWithUserId = getUserDetailsWithUserId;
exports.userBankDetails = userBankDetails;
