const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const xlsx = require("xlsx");
const fs = require("fs");
// const fs = require("fs");

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
      password: '***************',
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
  const { userId, name, phone, channelUrl, userPic } = req.body;

  let user;
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }
  try {
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
  if (!req.files.userPic[0]) {
    return res.status(400).json({ message: "Please upload files!" });
  }
  fs.unlink(user.userPic, (err) => {});
  const img = req.files.userPic[0];

  user.name = name;
  user.phone = phone;
  user.channelUrl = channelUrl;
  user.userPic = img.path;
  try {
    await user.save();
  } catch (error) {
    fs.unlink(img, (err) => {});
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
    // Check file presence
    if (!req.files || !req.files['excel'] || !req.files['excel'][0]) {
      return res.status(400).json({ message: "Please upload an Excel file." });
    }
    const filePath = req.files['excel'][0].path;
    console.log("File path to read:", filePath);
    console.log("File  to read:", req.files['excel'][0]);

    // Read workbook
    const workbook = xlsx.readFile(filePath);
    console.log("Workbook read successfully:", workbook);
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log("Sheet data sample:", data[0]); // Log first row to see actual keys

    // Month mapping
    const monthAbbrMap = {
      Jan: "Jan", January: "Jan",
      Feb: "Feb", February: "Feb",
      Mar: "Mar", March: "Mar",
      Apr: "Apr", April: "Apr",
      May: "May",
      Jun: "Jun", June: "Jun",
      Jul: "Jul", July: "Jul",
      Aug: "Aug", August: "Aug",
      Sep: "Sep", September: "Sep",
      Oct: "Oct", October: "Oct",
      Nov: "Nov", November: "Nov",
      Dec: "Dec", December: "Dec"
    };

    const result = {};

    data.forEach((row) => {
      // Try all possible header names
      const label = row["label"] || row["Label"] || row["Label Name"];
      const netPayableRaw = row["Net Payable"] || row["netPayable"] || row["NetPayable"];
      const dateStr = row["dataset_date"] || row["Date"] || row["date"];

      if (!label || !dateStr) return;

      const netPayable = Number.isFinite(parseFloat(netPayableRaw)) ? parseFloat(netPayableRaw) : 0;

      // Parse date string
      const [monthPart, yearPart] = dateStr.split("-");
      const monthKey = monthAbbrMap[monthPart.trim()] || monthPart.trim().slice(0, 3);

      let year = parseInt(yearPart);
      if (yearPart && yearPart.length === 2) {
        year += year >= 50 ? 1900 : 2000;
      }

      if (!result[label]) {
        result[label] = {};
      }

      if (!result[label][year]) {
        result[label][year] = {
          Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
          Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
        };
      }

      if (result[label][year][monthKey] !== undefined) {
        result[label][year][monthKey] += netPayable;
      } else {
        console.warn(`Unknown month key: ${monthKey}, skipping.`);
      }
    });

    console.log("Parsed result:", result);

    return res.status(200).json({
      message: "Excel parsed and calculated successfully.",
      data: result
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong while processing Excel." });
  }
};


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
