const brandUser = require("../models/prouser");
const infUser = require("../models/infuser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
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

exports.userExists = async (req, res) => {
  const { contactNum } = req.body;

  if (!contactNum || contactNum.length === 0) {
    return res.status(400).json({ message: "Kindly fill contact number" });
  }

  let user = await brandUser.findOne({ contactNum: contactNum });
  if (!user) {
    user = await infUser.findOne({ contactNum: contactNum });
  }
  console.log(user);

  if (user) {
    return res
      .status(201)
      .json({ message: "User already exists.", exists: true });
  }

  return res.status(404).json({ message: "User not exists.", exists: false });
};
exports.userLogin = async (req, res) => {
  const { contactNum } = req.body;
  console.log(contactNum);

  let user, token;
  try {
    user = await brandUser.findOne({ contactNum: contactNum });
    console.log(user);

    if (!user) {
      user = await infUser.findOne({ contactNum: contactNum });

      if (!user) {
        throw new Error();
      }
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

exports.userRegistrationPro = async (req, res, next) => {
  const { name, contactNum, email, fullAddress, pinCode, role, city, state } =
    req.body;

  const date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();

  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  let userPicImg = req.files["userPic"][0];
  let user = await brandUser.findOne({ contactNum: contactNum });
  if (!user) {
    user = await infUser.findOne({ contactNum: contactNum });
  }
  if (user) {
    fs.unlink(userPicImg.path, (err) => {
      if (err) {
        console.error("Failed to delete image:", err);
      }
    });
    return res
      .status(400)
      .json({ message: "User already exists.", exists: true });
  } else {
    const createdUser = new brandUser({
      name,
      contactNum,
      email,
      userSince: months[month] + " " + year,
      userType: role,
      fullAddress,
      pinCode,
      profileImage: userPicImg.path,
      city,
      state,
    });

    try {
      await createdUser.save();
    } catch (err) {
      console.log(err);

      return res
        .status(403)
        .json({ message: "Unable to register user.", success: false });
    }

    res.status(200).json({
      message: "Sign up successful.",
      success: true,
    });
  }
};

exports.userRegistrationInf = async (req, res, next) => {
  const {
    name,
    contactNum,
    email,
    fullAddress,
    pinCode,
    socialMediaUrl,
    accountNumber,
    ifscCode,
    bankName,
    profession,
    role,
    price,
    city,
    state
  } = req.body;

  console.log(contactNum);

  const date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();

  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  let userPicImg = req.files["userPic"][0];
  let user = await infUser.findOne({ contactNum: contactNum });
  if (!user) {
    user = await brandUser.findOne({ contactNum: contactNum });
  }
  if (user) {
    fs.unlink(userPicImg.path, (err) => {
      if (err) {
        console.error("Failed to delete image:", err);
      }
    });
    return res
      .status(400)
      .json({ message: "User already exists.", exists: true });
  } else {
    const createdUser = new infUser({
      name,
      contactNum,
      email,
      userSince: months[month] + " " + year,
      userType: role,
      fullAddress,
      pinCode,
      socialMediaUrl,
      accountNumber,
      ifscCode,
      bankName,
      profession,
      bankAccountHolderName: '',
      profileImage: userPicImg.path,
      status: "for admin approval",
      paymentStatus: "completed",
      paymentOrdrId: "demo",
      price,
      city,
      state,
      legalDoc: " ",
      wallet: [],
      bonus: [],
      facebookUrl: " ",
      youtubeUrl: " ",
      tikTokUrl: " ",
      spotifyUrl:" ",
      jioSaavnUrl: " ",
    });

    try {
      await createdUser.save();
    } catch (err) {
      console.log(err);

      return res
        .status(403)
        .json({ message: "Unable to register user.", success: false });
    }

    res.status(200).json({
      message: "Sign up successful.",
      success: true,
    });
  }
};

exports.getAllInfUsers = async (req, res) => {
  let users;
  try {
    users = await infUser.find({ status: "active" });
  } catch (error) {}
  return res.status(200).json({
    users: users.map((u) => {
      return u.toObject({ getters: true });
    }),
    status: true,
  });
};

exports.userLogin = async (req, res) => {
  const { contactNum } = req.body;
  console.log(contactNum);

  let user, token;
  try {
    users = await infUser.find({ });
  } catch (error) {}
  users = users.filter(u=>{
    return u.status =='active' || u.status =='closed'
  })
  return res.status(200).json({
    users: users.map((u) => {
      return u.toObject({ getters: true });
    }),
    status: true,
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

exports.getProfilePro = async (req, res) => {
  const { id } = req.body;
  console.log(id);

  let user;
  try {
    user = await brandUser.findById(id);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!", success: false });
  }
  return res
    .status(200)
    .json({ user: user.toObject({ getters: true }), status: true });
};
exports.getProfileInf = async (req, res) => {
  const { id } = req.body;
  console.log(id);

  let user;
  try {
    user = await infUser.findById(id);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!", success: false });
  }
  return res
    .status(200)
    .json({ user: user.toObject({ getters: true }), status: true });
};

exports.editBrandUser = async (req, res) => {
  const { id, name, email, fullAddress, pinCode, city, state } = req.body;
  console.log(id, name);

  let user;
  try {
    user = await brandUser.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!", success: false });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.fullAddress = fullAddress || user.fullAddress;
    user.pinCode = pinCode || user.pinCode;
    user.city = city || user.city;
    user.state = state || user.state;

    // Handle profile image upload
    if (req.files && req.files["userPic"]) {
      let userPicImg = req.files["userPic"][0];
      user.profileImage = userPicImg.path;
    }

    await user.save();
  } catch (error) {
    fs.unlink(userPicImg.path, (err) => {
      if (err) {
        console.error("Failed to delete image:", err);
      }
    });
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error updating user", success: false });
  }

  return res.status(200).json({
    message: "User updated successfully",
    success: true,
    user: user.toObject({ getters: true }),
  });
};

exports.editInfUser = async (req, res) => {
  const {
    id,
    name,
    email,
    fullAddress,
    pinCode,
    city,
    state,

    socialMediaUrl,
    accountNumber,
    ifscCode,
    bankName,
    profession,
    price,facebookUrl,youtubeUrl,tikTokUrl,spotifyUrl,jioSaavnUrl,bankAccountHolderName
  } = req.body;
 
  console.log(id, name);

  let user;
  try {
    user = await infUser.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!", success: false });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.fullAddress = fullAddress || user.fullAddress;
    user.pinCode = pinCode || user.pinCode;
    user.city = city || user.city;
    user.state = state || user.state;
    user.socialMediaUrl = socialMediaUrl || user.socialMediaUrl;
    user.accountNumber = accountNumber || user.accountNumber;
    user.ifscCode = ifscCode || user.ifscCode;
    user.bankName = bankName || user.bankName;
    user.profession = profession || user.profession;
    user.price = price || user.price;
    user.facebookUrl = facebookUrl.trim() || user.facebookUrl;
    user.youtubeUrl = youtubeUrl.trim() || user.youtubeUrl;
    user.tikTokUrl = tikTokUrl.trim() || user.tikTokUrl;
    user.spotifyUrl = spotifyUrl.trim() || user.spotifyUrl;
    user.jioSaavnUrl = jioSaavnUrl.trim() || user.jioSaavnUrl;
    user.bankAccountHolderName = bankAccountHolderName.trim() || user.bankAccountHolderName;

    // Handle profile image upload
    if (req.files && req.files["userPic"]) {
      let userPicImg = req.files["userPic"][0];
      user.profileImage = userPicImg.path;
    }

    await user.save();
  } catch (error) {
    if (req.files && req.files["userPic"]) {
      let userPicImg = req.files["userPic"][0];
      fs.unlink(userPicImg.path, (err) => {
        if (err) {
          console.error("Failed to delete image:", err);
        }
      });
    }
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error updating user", success: false });
  }

  return res.status(200).json({
    message: "User updated successfully",
    success: true,
    user: user.toObject({ getters: true }),
  });
};

exports.getAllUsers = async (req, res) => {
  let users, brandUsers, infUsers;
  try {
    brandUsers = await brandUser.find({});
    console.log(brandUsers);

    if (!brandUsers) {
      brandUsers = [];
    }
    infUsers = await infUser.find({});
    if (!infUsers) {
      infUsers = [];
    }
    users = brandUsers.concat(infUsers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching users", success: false });
  }
  return res.status(200).json({
    users: users.map((u) => {
      if (u.userType == "admin") {
        return;
      }

      return u.toObject({ getters: true });
    }),
    status: true,
  });
};

exports.editInfUserProfileStatus = async (req, res) => {
  const { id, status } = req.body;

  let user;
  try {
    user = await infUser.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!", success: false });
    }

    user.status = status;

    await user.save();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating user", success: false });
  }

  return res.status(200).json({
    message: "User updated successfully",
    success: true,
    user: user.toObject({ getters: true }),
  });
};
exports.deleteUserBrandAndUser = async (req, res) => {
  const { id } = req.body;

  let user;
  try {
    user = await infUser.findById(id);

    if (!user) {
      user = await brandUser.findById(id);
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!", success: false });
    }
    await user.deleteOne();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting user", success: false });
  }
  return res.status(200).json({ message: "User Deleted", success: true });
};

exports.sentOtpForDelete = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let info;
  try {
    info = await transporter.sendMail({
      from: '"Rivaaz Films" inforivaazfilms@gmail.com', // sender address
      to: `rivaazfilm@gmail.com`, // list of receivers
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

exports.addLegalDoc = async (req, res) => {
  const { userId } = req.body;
  console.log(userId);

  let user;

  try {
    user = await infUser.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User not found!" });
  }
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  if (user.legalDoc.length > 2) {
    fs.unlink(user.legalDoc, (err) => {});
  }

  user.legalDoc = req.files.doc[0].path;

  user.status = "active";
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
