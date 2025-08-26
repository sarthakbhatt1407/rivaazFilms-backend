const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Order = require("../models/orderModel");
const Copyright = require("../models/copyright");
const { v4: uuidv4 } = require("uuid");
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

let emailsOtp = [];
let forgotPassOtp = [];

exports.getAdminDashboardStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments({});
    const pendingUsers = await User.countDocuments({ status: "pending" });
    const activeUsers = await User.countDocuments({ status: "approved" });
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const newUsersThisMonth = await User.countDocuments({
      userSince: { $regex: `${months[month]} ${year}` },
    });

    // Work stats
    const totalWork = await Order.countDocuments({});
    const pendingWork = await Order.countDocuments({
      status: "waiting",
      deleted: false,
    });
    const processingWork = await Order.countDocuments({ status: "processing" });
    const completedWork = await Order.countDocuments({ status: "completed" });
    const workThisMonth = await Order.countDocuments({
      orderDateAndTime: {
        $regex: `${year}-${String(month + 1).padStart(2, "0")}`,
      },
    });

    // Copyright stats
    const totalCopyright = await Copyright.countDocuments({});
    const pendingCopyright = await Copyright.countDocuments({
      status: "pending",
      deleted: false,
    });
    const resolvedCopyright = await Copyright.countDocuments({
      status: "resolved",
      deleted: false,
    });
    const rejectedCopyright = await Copyright.countDocuments({
      status: "rejected",
      deleted: false,
    });

    res.status(200).json({
      userStats: {
        totalUsers,
        pendingUsers,
        activeUsers,
        newUsersThisMonth,
      },
      workStats: {
        totalWork,
        pendingWork,
        processingWork,
        completedWork,
        workThisMonth,
      },
      copyrightStats: {
        totalCopyright,
        pendingCopyright,
        resolvedCopyright,
        rejectedCopyright,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
};

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
exports.userExists = async (req, res) => {
  const { contactNum } = req.body;

  if (!contactNum || contactNum.length === 0) {
    return res.status(400).json({ message: "Kindly fill contact number" });
  }

  let user = await User.findOne({ phone: contactNum });

  if (user) {
    return res
      .status(201)
      .json({ message: "User already exists.", exists: true });
  }

  return res.status(404).json({ message: "User not exists.", exists: false });
};

const userRegistration = async (req, res, next) => {
  const {
    name,
    email,

    phone,
    city,
    state,
    country,
    channelUrl,
    address,
    pincode,
  } = req.body;

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
    if (!req.files) {
      return res.status(400).json({ message: "Please upload files!" });
    }
    let signImg, userPicImg;
    signImg = req.files["sign"][0];
    userPicImg = req.files["userPic"][0];

    const date = new Date();
    const year = date.getFullYear();
    const createdUser = new User({
      name,
      email,
      password: "***************",
      userSince: months[month] + " " + year,
      isAdmin: false,
      phone,
      finacialReport: [
        {
          [year]: {
            Jan: 0,
            Feb: 0,
            Mar: 0,
            Apr: 0,
            May: 0,
            Jun: 0,
            Jul: 0,
            Aug: 0,
            Sep: 0,
            Oct: 0,
            Nov: 0,
            Dec: 0,
          },
        },
      ],
      analytics: [
        {
          [year]: {
            Jan: {
              Spotify: 0,
              "Apple Music": 0,
              Wynk: 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Feb: {
              Spotify: 0,
              Wynk: 0,
              "Apple Music": 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Mar: {
              Spotify: 0,
              Wynk: 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              "Apple Music": 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Apr: {
              Spotify: 0,
              Wynk: 0,
              JioSaavn: 0,
              "Apple Music": 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            May: {
              Spotify: 0,
              "Apple Music": 0,
              Wynk: 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Jun: {
              Spotify: 0,
              Wynk: 0,
              "Apple Music": 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Jul: {
              "Apple Music": 0,
              Spotify: 0,
              Wynk: 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Aug: {
              Spotify: 0,
              "Apple Music": 0,
              Wynk: 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Sep: {
              Spotify: 0,
              "Apple Music": 0,
              Wynk: 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Oct: {
              Spotify: 0,
              Wynk: 0,
              "Apple Music": 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Nov: {
              Spotify: 0,
              Wynk: 0,
              JioSaavn: 0,
              "Apple Music": 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
            Dec: {
              Spotify: 0,
              Wynk: 0,
              "Apple Music": 0,
              JioSaavn: 0,
              Amazon: 0,
              Gaana: 0,
              YouTube: 0,
              SoundCloud: 0,
              Tiktok: 0,
              "FB/Insta": 0,
              Hungama: 0,
              Other: 0,
            },
          },
        },
      ],
      city,
      state,
      country,
      channelUrl,
      sign: signImg.path,
      paidEarning: 0,
      userPic: userPicImg.path,
      bankDetails: [
        {
          accountNo: "",
          ifsc: "",
          bankName: "",
          upi: "",
        },
      ],
      status: "pending",
      address,
      pincode,
      docs: "",
      excelRep: "",
      wallet: [],
      bonus: [],
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

const sendEmailForOtp = async (req, res) => {
  const date = new Date();

  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });

    if (user) {
      return res.status(400).json({ message: "Email already exists." });
    }
  } catch (error) {
    return res.json({ info, message: "Something went wrong" });
  }
  if (!email) {
    return res.status(400).json({ message: "email is invalid" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const obj = {
    email,
    otp,
    verified: false,
    validity: date.setTime(date.getTime() + 1000 * 60),
  };
  const alreadyFound = emailsOtp.find((usr) => {
    return usr.email === email;
  });
  if (alreadyFound && alreadyFound.verified === true && user) {
    return res.json({ message: "Email already verfied" });
  }
  const alreadyFoundIndex = emailsOtp.findIndex((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    emailsOtp[alreadyFoundIndex] = obj;
  }

  if (!alreadyFound) {
    emailsOtp.push(obj);
  }

  // send mail with defined transport object
  let info;
  try {
    info = await transporter.sendMail({
      from: '"Rivaaz Films" inforivaazfilms@gmail.com', // sender address
      to: `${email}`, // list of receivers
      subject: "Verification", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>Your otp is ${otp} </b>`, // html body
    });
  } catch (error) {
    return res.json({ info, message: "Unable to send", sent: false });
  }

  // console.log("Message sent: %s", info);
  return res.json({ info, message: "Otp sent to email", sent: true });
};
const verifyOtp = async (req, res) => {
  const { otpInp, email } = req.body;
  const date = new Date();
  const time = date.getTime();
  const alreadyFound = emailsOtp.find((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    const alreadyFoundIndex = emailsOtp.findIndex((usr) => {
      return usr.email === email;
    });
    if (alreadyFound.otp === otpInp && time <= alreadyFound.validity) {
      const obj = {
        ...alreadyFound,
        verified: true,
      };
      emailsOtp[alreadyFoundIndex] = obj;
      return res.status(400).json({ message: "Otp is Valid", valid: true });
    } else {
      return res
        .status(200)
        .json({ message: "Otp is invalid or expired", valid: false });
    }
  }
  if (!alreadyFound) {
    return res.status(200).json({ message: "Email not found" });
  }
};

const passwordReseter = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "User Not Found" });
  }
  user.password = password;
  try {
    await user.save();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to change password ! Please try again later." });
  }
  res.status(201).json({ message: "Password Changed" });
};

const userLogin = async (req, res, next) => {
  const { phone } = req.body;
  console.log(phone);

  let user;

  try {
    user = await User.findOne({ phone: phone });
  } catch (err) {
    return res.status(404).json({
      message: "User Not Found, Please Signup first",
      success: false,
    });
  }

  if (user && phone == user.phone) {
    token = jwt.sign({ userId: user.id, userEmail: user.email }, "secret_key");
    req.session.token = token;
    req.session.userId = user.id;
    user.password = "Keep Guessing";
    return res.status(201).json({
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
        name: user.name,
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
// const userLogin = async (req, res, next) => {
//   const { email, password } = req.body;
//   let user;
//   let passIsValid = false;

//   if (!validateEmail(email)) {
//     return res.status(404).json({ message: "Invalid Email" });
//   }
//   try {
//     user = await User.findOne({ email: email });
//     if (!user) {
//       throw new Error();
//     }
//   } catch (err) {
//     return res.status(404).json({
//       message: "Email not found, Please Signup first",
//       success: false,
//     });
//   }

//   if (user && email === user.email && password === user.password) {
//     token = jwt.sign({ userId: user.id, userEmail: email }, "secret_key");
//     req.session.token = token;
//     req.session.userId = user.id;
//     user.password = "Keep Guessing";
//     return res.status(201).json({
//       user: {
//         id: user.id,
//         isAdmin: user.isAdmin,
//         name: user.name,
//       },
//       message: "Logged In",
//       isloggedIn: true,
//       token: user.isAdmin === true ? token : "",
//       success: true,
//     });
//   } else {
//     return res
//       .status(404)
//       .json({ message: "Invalid Credentials", success: false });
//   }
// };

const userIsLoggedIn = async (req, res) => {
  const { userId, token } = req.body;
  if (req.session.userId || req.session.token) {
    return res.json({ session: req.session });
  } else {
    return res.json({ message: "logged out" });
  }
};

const userAnalyticsReportAdder = async (req, res) => {
  const { userId, adminId, year, report, month } = req.body;
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
  if (!userAnalyticsReport[0][year]) {
    userAnalyticsReport[0][year] = {
      Jan: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Feb: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Mar: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Apr: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      May: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Jun: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Jul: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Aug: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Sep: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Oct: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Nov: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
      Dec: {
        Spotify: 0,
        "Apple Music": 0,
        Wynk: 0,
        JioSaavn: 0,
        Amazon: 0,
        Gaana: 0,
        YouTube: 0,
        SoundCloud: 0,
        Tiktok: 0,
        "FB/Insta": 0,
        Hungama: 0,
        Other: 0,
      },
    };
  }

  userAnalyticsReport[0][year][month] = { ...report };

  user.analytics = userAnalyticsReport;
  try {
    user.markModified("analytics");
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

exports.getAllPendingProfile = async (req, res) => {
  const { id } = req.query;
  let admin, users;
  try {
    admin = await User.findById(id);
    if (!admin) {
      throw new Error("No user found!");
    }
    if (!admin.isAdmin) {
      throw new Error("You are not allowed!");
    }
  } catch (error) {
    return res.status(404).json({ message: "You are not allowed!" });
  }
  try {
    users = await User.find({ status: "pending" });
    if (!users) {
      throw new Error("No users found!");
    }
  } catch (error) {
    return res.status(404).json({ message: "No users found!" });
  }

  return res.status(200).json({
    users: users.map((usr) => {
      return usr.toObject({ getters: true });
    }),
  });
};
const getAllUsersDetails = async (req, res) => {
  const { id } = req.query;
  let admin, users;
  try {
    admin = await User.findById(id);
    if (!admin) {
      throw new Error("No user found!");
    }
    if (!admin.isAdmin) {
      throw new Error("You are not allowed!");
    }
  } catch (error) {
    return res.status(404).json({ message: "You are not allowed!" });
  }
  try {
    users = await User.find({});
    if (!users) {
      throw new Error("No users found!");
    }
  } catch (error) {
    return res.status(404).json({ message: "No users found!" });
  }

  return res.status(200).json({
    users: users.map((usr) => {
      return usr.toObject({ getters: true });
    }),
  });
};

const forgotPassOtpSender = async (req, res) => {
  const date = new Date();

  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email not found. Please sign up first" });
    }
  } catch (error) {
    return res.json({ info, message: "Something went wrong" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "email is invalid" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const obj = {
    email,
    otp,
    verified: false,
    validity: date.setTime(date.getTime() + 1000 * 60),
  };
  const alreadyFound = forgotPassOtp.find((usr) => {
    return usr.email === email;
  });

  const alreadyFoundIndex = forgotPassOtp.findIndex((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    forgotPassOtp[alreadyFoundIndex] = obj;
  }

  if (!alreadyFound) {
    forgotPassOtp.push(obj);
  }

  // send mail with defined transport object
  let info;
  try {
    info = await transporter.sendMail({
      from: '"Rivaaz Films" work.fusionavinya@gmail.com', // sender address
      to: `${email}`, // list of receivers
      subject: "Password reset", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>your otp for resetting password is ${otp}. Otp is valid for only 15 minutes.</b>`, // html body
    });
  } catch (error) {
    return res.json({ info, message: "Unable to send", sent: false });
  }

  // console.log("Message sent: %s", info);
  return res.json({ info, message: "Otp sent to email", sent: true });
};

const verifyForgotPassOtp = async (req, res) => {
  const { otpInp, email } = req.body;
  const date = new Date();
  const time = date.getTime();
  const alreadyFound = forgotPassOtp.find((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    if (alreadyFound.otp === otpInp && time <= alreadyFound.validity) {
      const arr = forgotPassOtp.filter((item) => {
        return item.email != email;
      });
      forgotPassOtp = arr;
      return res.status(400).json({ message: "Otp is Valid", valid: true });
    } else {
      return res
        .status(200)
        .json({ message: "Otp is invalid or expired", valid: false });
    }
  }
  if (!alreadyFound) {
    return res.status(200).json({ message: "Email not found. Please Retry." });
  }
};

const editProfile = async (req, res) => {
  const { userId, name, phone, channelUrl, email } = req.body;

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }

  // Only update userPic if a new file is uploaded
  if (req.files && req.files.userPic && req.files.userPic[0]) {
    fs.unlink(user.userPic, (err) => {});
    const img = req.files.userPic[0];
    user.userPic = img.path;
  }

  user.name = name;
  user.phone = phone;
  user.channelUrl = channelUrl;
  user.email = email;

  try {
    await user.save();
  } catch (error) {
    if (req.files && req.files.userPic && req.files.userPic[0]) {
      fs.unlink(req.files.userPic[0].path, (err) => {});
    }
    return res.status(400).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "Profile Updated." });
};
const addPaidEarning = async (req, res) => {
  const { userId, paid, adminId } = req.body;
  let user, admin;
  try {
    admin = await User.findById(adminId);
    if (!admin.isAdmin) {
      return res.status(400).json({ message: "You are not allowed!" });
    }
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
  const updatedPaid = user.paidEarning + paid;
  user.paidEarning = updatedPaid;

  try {
    user.markModified("paidEarning");
    await user.save();
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "Earnings Updated." });
};
const editPaid = async (req, res) => {
  const { userId, paid, adminId } = req.body;
  let user, admin;
  try {
    admin = await User.findById(adminId);
    if (!admin.isAdmin) {
      return res.status(400).json({ message: "You are not allowed!" });
    }
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
  user.paidEarning = paid;

  try {
    user.markModified("paidEarning");
    await user.save();
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "Earnings Updated." });
};

exports.addLegalDoc = async (req, res) => {
  const { userId, adminId } = req.body;

  let user, admin;

  try {
    admin = await User.findById(adminId);
    if (!admin.isAdmin) {
      return res.status(400).json({ message: "You are not allowed!" });
    }
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  if (user.docs.length > 0) {
    fs.unlink(user.docs, (err) => {});
  }

  user.docs = req.files.doc[0].path;

  user.status = "approved";
  try {
    await user.save();
  } catch (error) {
    console.log(error);

    fs.unlink(req.files.doc[0].path, (err) => {});
    return res.status(400).json({ message: "Something went wrong !" });
  }
  return res
    .status(200)
    .json({ message: "Document uploaded successfully.", success: true });
};
exports.addExcelSheet = async (req, res) => {
  const { userId, adminId } = req.body;

  let user, admin;

  try {
    admin = await User.findById(adminId);
    if (!admin.isAdmin) {
      return res.status(400).json({ message: "You are not allowed!" });
    }
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  let resStr = user.excelRep;
  if (resStr.length === 0) {
    resStr = req.files.excel[0].path;
  } else if (resStr.includes(req.files.excel[0].path)) {
    resStr = resStr;
  } else {
    resStr = resStr + "&=&" + req.files.excel[0].path;
  }

  user.excelRep = resStr;
  try {
    await user.save();
  } catch (error) {
    console.log(error);

    fs.unlink(req.files.doc[0].path, (err) => {});
    return res.status(400).json({ message: "Something went wrong !" });
  }
  return res
    .status(200)
    .json({ message: "Document uploaded successfully.", success: true });
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.body;
  let user;

  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }

  try {
    await user.deleteOne();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "User deleted.", success: true });
};

exports.deleteExcelFile = async (req, res) => {
  const { userId, filePath } = req.body;

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!", error });
  }
  fs.unlink(filePath, (err) => {});
  const arr = user.excelRep.split("&=&");
  const resArr = arr.filter((f) => {
    return f != filePath;
  });
  const resStr = resArr.join("&=&");
  user.excelRep = resStr;
  try {
    await user.save();
    fs.unlink(filePath, (err) => {});
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({ message: "File deleted.", success: true });
};

const uploadExcelAndCalculate = async (req, res) => {
  try {
    if (!req.files || !req.files["excel"] || !req.files["excel"][0]) {
      return res.status(400).json({ message: "Please upload an Excel file." });
    }

    const { month, year } = req.body;
    console.log(month, year);

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Please provide month and year." });
    }

    const filePath = req.files["excel"][0].path;

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const monthAbbrMap = {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    };

    const targetMonth = monthAbbrMap[month.toLowerCase()];
    if (!targetMonth) {
      return res.status(400).json({ message: "Invalid month provided." });
    }

    const labelWiseNetPayable = {};

    data.forEach((row) => {
      const label = (
        row["label"] ||
        row["Label"] ||
        row["Label Name"] ||
        ""
      ).trim();
      const dateStr = (
        row["dataset_date"] ||
        row["Date"] ||
        row["date"] ||
        ""
      ).trim();
      const netPayableRaw =
        row["Net Payable"] || row["netPayable"] || row["NetPayable"];

      if (!label || !dateStr) return;

      const netPayable = parseFloat(netPayableRaw) || 0;

      const [monthPart, yearPart] = dateStr.split("-");
      const monthKey =
        monthAbbrMap[monthPart.trim().slice(0, 3).toLowerCase()] ||
        monthPart.trim().slice(0, 3);
      let parsedYear = parseInt(yearPart);

      if (yearPart.length === 2) {
        parsedYear += parsedYear >= 50 ? 1900 : 2000;
      }

      if (
        isNaN(parsedYear) ||
        monthKey !== targetMonth ||
        parsedYear !== parseInt(year)
      ) {
        return;
      }

      if (!labelWiseNetPayable[label]) {
        labelWiseNetPayable[label] = 0;
      }

      labelWiseNetPayable[label] += netPayable;
    });

    // Round amounts to two decimal places
    Object.keys(labelWiseNetPayable).forEach((label) => {
      labelWiseNetPayable[label] = parseFloat(
        labelWiseNetPayable[label].toFixed(2)
      );
    });
    res.status(200).json({
      message: `Net Payable grouped by labels for ${targetMonth}-${year} calculated successfully.`,
      data: labelWiseNetPayable,
    });
    console.log(labelWiseNetPayable);

    for (const key in labelWiseNetPayable) {
      let user = await User.findOne({ name: key });

      if (!user) {
        continue;
      }
      let userFinanceReport = user.finacialReport;
      if (userFinanceReport.length === 0) {
        userFinanceReport = [
          {
            [year]: {
              Jan: 0,
              Feb: 0,
              Mar: 0,
              Apr: 0,
              May: 0,
              Jun: 0,
              Jul: 0,
              Aug: 0,
              Sep: 0,
              Oct: 0,
              Nov: 0,
              Dec: 0,
              [month]: labelWiseNetPayable[key],
            },
          },
        ];
      } else {
        if (!userFinanceReport[0][year]) {
          userFinanceReport[0][year] = {
            Jan: 0,
            Feb: 0,
            Mar: 0,
            Apr: 0,
            May: 0,
            Jun: 0,
            Jul: 0,
            Aug: 0,
            Sep: 0,
            Oct: 0,
            Nov: 0,
            Dec: 0,
            [month]: labelWiseNetPayable[key],
          };
        } else {
          userFinanceReport[0][year] = {
            ...userFinanceReport[0][year],
            [month]: labelWiseNetPayable[key],
          };
        }
      }

      user.finacialReport = userFinanceReport;
      try {
        user.markModified("finacialReport");
        await user.save();
      } catch (error) {
        console.error(`Error saving financial report for ${key}:`, error);
      }
      if (key == "Gusain Raj Studio") {
        console.log(labelWiseNetPayable[key]);
      }
      console.log("1 saved", key);
    }
    return;
    // return res.status(200).json({
    //   message: `Net Payable grouped by labels for ${targetMonth}-${year} calculated successfully.`,
    //   data: labelWiseNetPayable,
    // });
  } catch (err) {
    console.error("Error parsing Excel:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong while processing Excel." });
  }
};

const userFinancialReportAdder = async (req, res) => {
  const { userId, adminId, year, report } = req.body;
  console.log(year);

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
    return res.status(400).json({ message: "please add report" });
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

exports.getUserWalletdata = async (req, res) => {
  const { id } = req.body;

  let user;

  try {
    user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }

  // Calculate total earnings from financial report
  let totalEarnings = 0;
  const financialReport = user.finacialReport;

  if (financialReport && financialReport.length > 0) {
    financialReport.forEach((yearData) => {
      Object.values(yearData).forEach((months) => {
        Object.values(months).forEach((amount) => {
          totalEarnings += amount;
        });
      });
    });
  }

  return res.status(200).json({
    wallet: user.wallet,
    bonusWallet: user.bonus,
    totalEarnings: parseFloat(totalEarnings), // Ensure two decimal places
  });
};
exports.getInfWalletdata = async (req, res) => {
  const { id } = req.body;
  let user;

  try {
    user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }

  // Total Earn from finacialReport
  let totalEarn = 0;
  if (user.finacialReport && user.finacialReport.length > 0) {
    totalEarn = user.finacialReport.reduce((sum, yearObj) => {
      return (
        sum +
        Object.values(yearObj).reduce((yearSum, monthsObj) => {
          return (
            yearSum +
            Object.values(monthsObj)
              .filter((v) => typeof v === "number")
              .reduce((monthSum, val) => monthSum + val, 0)
          );
        }, 0)
      );
    }, 0);
  }

  // Total Paid from wallet
  let totalPaid = 0;
  if (Array.isArray(user.wallet)) {
    totalPaid = user.wallet.reduce(
      (sum, entry) => sum + Number(entry.amount || 0),
      0
    );
  }

  return res.status(200).json({
    wallet: user.wallet,
    bonusWallet: user.bonus,
    totalEarn: parseFloat(totalEarn.toFixed(2)),
    totalPaid: parseFloat(totalPaid.toFixed(2)),
    name: user.name,
    img: user.userPic,
  });
};
exports.addwalletTransaction = async (req, res) => {
  const { remark, infId, amount, action } = req.body; // Get orderId from request parameters
  console.log(remark, infId, amount, action, "hit");

  let user;
  try {
    user = await User.findById(infId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (action == "wallet") {
      const now = new Date();
      const date = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const formatTime = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        const strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
      };

      const time = formatTime(now);

      const obj = {
        id: uuidv4(),
        date: date,
        time: time,
        description: remark,
        amount: Number(amount),
      };

      let arr = [];

      if (user.wallet == "" || user.wallet == undefined) {
        arr = [obj];
      } else {
        arr = [obj, ...user.wallet];
      }

      user.wallet = [...arr];
    }
    if (action == "bonus") {
      const now = new Date();
      const date = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const formatTime = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        const strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
      };

      const time = formatTime(now);

      const obj = {
        id: uuidv4(),
        date: date,
        time: time,
        description: "Bonus",
        amount: Number(amount),
      };
      let arr = [];
      if (user.bonus == "" || user.bonus == undefined) {
        arr = [obj];
      } else {
        arr = [obj, ...user.bonus];
      }
      user.bonus = arr;
    }
    try {
      user.markModified("wallet");
      user.markModified("bonus");
      await user.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update wallet" });
    }

    return res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteWallletEntry = async (req, res) => {
  const { id, action, infId } = req.body;
  console.log(id, action, infId);

  let user;
  try {
    user = await User.findById(infId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (action.toLowerCase() == "bonus") {
      const obj = user.bonus.find((entry) => entry.id == id);
      if (!obj) {
        return res.status(404).json({ message: "Entry not found." });
      }
      let arr = user.bonus.filter((entry) => entry.id != id);
      user.bonus = arr;
    } else {
      const obj = user.wallet.find((entry) => entry.id == id);
      if (!obj) {
        return res.status(404).json({ message: "Entry not found." });
      }
      let arr = user.wallet.filter((entry) => entry.id != id);
      user.wallet = arr;
    }
    try {
      await user.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update wallet" });
    }
    return res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong." });
  }
};

const sendPaymentRequestToAdmin = async (req, res) => {
  const { userId, amount, remark } = req.body;

  if (!userId || !amount) {
    return res
      .status(400)
      .json({ message: "User ID and amount are required." });
  }

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }

  let info;
  try {
    info = await transporter.sendMail({
      from: '"Rivaaz Films" <inforivaazfilms@gmail.com>',
      // to: "sarthakbhatt1407@gmail.com",
      to: `rivaazfilm@gmail.com`,
      subject: "Payment Request from User",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px;">
          <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
            <h2 style="color: #222;">Payment Request</h2>
            <p style="font-size: 16px; color: #444;">
              <b>User:</b> ${user.name} (${user.email})
            </p>
            <p style="font-size: 16px; color: #444;">
              <b>Amount:</b> ₹${amount}
            </p>
            <p style="font-size: 16px; color: #444;">
              <b>Remark:</b> ${remark || "No remark provided."}
            </p>
            <p style="font-size: 14px; color: #888;">
              <b>User ID:</b> ${userId}
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    return res.json({ info, message: "Unable to send", sent: false });
  }

  return res.json({
    info,
    message: "Payment request sent to admin.",
    sent: true,
  });
};

const downloadLabelReport = async (req, res) => {
  const { labelName, month, year } = req.params;
  console.log(labelName, month, year);

  if (!labelName || !month || !year) {
    return res
      .status(400)
      .json({ message: "Please provide labelName, month, and year." });
  }

  // Normalize month for folder and Excel parsing
  const monthAbbrMap = {
    january: "Jan",
    jan: "Jan",
    february: "Feb",
    feb: "Feb",
    march: "Mar",
    mar: "Mar",
    april: "Apr",
    apr: "Apr",
    may: "May",
    june: "Jun",
    jun: "Jun",
    july: "Jul",
    jul: "Jul",
    august: "Aug",
    aug: "Aug",
    september: "Sep",
    sep: "Sep",
    october: "Oct",
    oct: "Oct",
    november: "Nov",
    nov: "Nov",
    december: "Dec",
    dec: "Dec",
  };

  function normalizeMonth(month) {
    if (!month) return "";
    return (
      monthAbbrMap[month.trim().toLowerCase()] ||
      month.trim().slice(0, 3).charAt(0).toUpperCase() +
        month.trim().slice(1, 3).toLowerCase()
    );
  }

  function normalizeLabel(label) {
    if (!label) return "";
    return label.trim().toLowerCase().replace(/\s+/g, " ");
  }

  const targetMonth = normalizeMonth(month);

  // Find the report file
  const reportsFolder = path.join(__dirname, "../uploads/reports");
  let reportFile;
  try {
    const files = fs.readdirSync(reportsFolder);
    reportFile = files.find(
      (f) =>
        (f.endsWith(".xlsx") || f.endsWith(".xls") || f.endsWith(".csv")) &&
        f.toLowerCase().includes(`${month.toLowerCase()}-${year}`)
    );
    if (!reportFile) throw new Error("No report found.");
  } catch (err) {
    return res
      .status(404)
      .json({ message: "Report file not found for given month/year." });
  }
  const filePath = path.join(reportsFolder, reportFile);
  let workbook, sheet, data;
  try {
    workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    sheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(sheet);
  } catch (err) {
    return res.status(500).json({ message: "Error reading Excel file." });
  }

  // Filter rows for label, month, year (robust label matching)
  const filteredRows = data.filter((row) => {
    const label = row["label"] || row["Label"] || row["Label Name"] || "";
    const dateStr = row["dataset_date"] || row["Date"] || row["date"] || "";
    if (!label || !dateStr) return false;
    const [monthPart, yearPart] = dateStr.split("-");
    const monthKey =
      monthAbbrMap[monthPart.trim().toLowerCase()] ||
      monthAbbrMap[monthPart.trim().slice(0, 3).toLowerCase()] ||
      monthPart.trim().slice(0, 3);
    let parsedYear = parseInt(yearPart);
    if (yearPart && yearPart.length === 2) {
      parsedYear += parsedYear >= 50 ? 1900 : 2000;
    }
    return (
      normalizeLabel(label) === normalizeLabel(labelName) &&
      monthKey === targetMonth &&
      parsedYear === parseInt(year)
    );
  });
  console.log(filteredRows);

  if (filteredRows.length === 0) {
    return res
      .status(404)
      .json({ message: "No data found for given label/month/year." });
  }

  // Create CSV from filtered data
  const csvData = xlsx.utils.sheet_to_csv(
    xlsx.utils.json_to_sheet(filteredRows)
  );
  const tempFileName = `${labelName.replace(
    /\s+/g,
    "_"
  )}_${targetMonth}_${year}_report.csv`;
  const tempFilePath = path.join(__dirname, "../uploads/reports", tempFileName);

  fs.writeFileSync(tempFilePath, csvData);

  res.download(tempFilePath, tempFileName, (err) => {
    fs.unlink(tempFilePath, () => {});
  });
};
exports.downloadLabelReport = downloadLabelReport;

exports.sendPaymentRequestToAdmin = sendPaymentRequestToAdmin;

exports.userRegistration = userRegistration;
exports.userLogin = userLogin;
exports.userIsLoggedIn = userIsLoggedIn;
exports.userAnalyticsReportAdder = userAnalyticsReportAdder;
exports.userFinancialReportAdder = userFinancialReportAdder;
exports.getUserDetailsWithUserId = getUserDetailsWithUserId;
exports.userBankDetails = userBankDetails;
exports.getAllUsersDetails = getAllUsersDetails;
exports.forgotPassOtpSender = forgotPassOtpSender;
exports.verifyForgotPassOtp = verifyForgotPassOtp;
exports.passwordReseter = passwordReseter;
exports.verifyOtp = verifyOtp;
exports.sendEmailForOtp = sendEmailForOtp;
exports.editProfile = editProfile;
exports.addPaidEarning = addPaidEarning;
exports.editPaid = editPaid;
exports.uploadExcelAndCalculate = uploadExcelAndCalculate;
