const express = require("express");
const router = express.Router();
const brandAndInfUserController = require("../controller/brandAndInfUserController");
const fileUpload = require("../middleware/fileUpload");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

router.get("/send-test", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"Rivaaz Films" <info@rivaazfilms.com>`,
      to: "sarthakbhatt1407@gmail.com",
      subject: "✅ Test Email from Rivaaz Films",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#695AE0;">Hello Sarthak 👋</h2>
          <p>This is a <b>test email</b> sent using <u>Hostinger SMTP</u>!</p>
          <p>If you see this in your inbox, SMTP is working correctly 🚀</p>
          <br/>
          <p style="font-size: 12px; color: gray;">— Rivaaz Films Team</p>
        </div>
      `,
    });

    console.log("Message sent:", info.messageId);
    res.json({
      success: true,
      message: "Test email sent!",
      id: info.messageId,
    });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/check-user", brandAndInfUserController.userExists);
router.post(
  "/register-pro",
  fileUpload.fields([{ name: "userPic", maxCount: 1 }]),
  brandAndInfUserController.userRegistrationPro
);
router.post(
  "/register-inf",
  fileUpload.fields([{ name: "userPic", maxCount: 1 }]),
  brandAndInfUserController.userRegistrationInf
);
router.post("/login", brandAndInfUserController.userLogin);
router.post("/chat", brandAndInfUserController.brandAndAdminChat);
router.get("/get-all-inf", brandAndInfUserController.getAllInfUsers);
router.get(
  "/get-all-inf-inc",
  brandAndInfUserController.getAllInfUsersWithInactive
);
router.post("/get-chats", brandAndInfUserController.getBrandAndAdminChat);
router.post("/get-user-pro", brandAndInfUserController.getProfilePro);
router.post("/get-user-inf", brandAndInfUserController.getProfileInf);
router.post(
  "/editBrandUser",
  fileUpload.fields([{ name: "userPic", maxCount: 1 }]),
  brandAndInfUserController.editBrandUser
);
router.post(
  "/editInfUser",
  fileUpload.fields([{ name: "userPic", maxCount: 1 }]),
  brandAndInfUserController.editInfUser
);
router.post(
  "/update-status",
  brandAndInfUserController.editInfUserProfileStatus
);
router.get("/send-otp-for-delete", brandAndInfUserController.sentOtpForDelete);
router.post("/delete-user", brandAndInfUserController.deleteUserBrandAndUser);
router.get("/get-all-users", brandAndInfUserController.getAllUsers);

router.post(
  "/legal-doc",
  fileUpload.fields([{ name: "doc", maxCount: 1 }]),
  brandAndInfUserController.addLegalDoc
);

module.exports = router;
