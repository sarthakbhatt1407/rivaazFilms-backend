const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/signup",
  fileUpload.fields([
    { name: "userPic", maxCount: 1 },
    { name: "sign", maxCount: 1 },
  ]),
  authController.userRegistration
);
router.post("/login", authController.userLogin);
router.post("/check-user", authController.userExists);
router.get("/get-user", authController.getUserDetailsWithUserId);
router.post("/session-checker", authController.userIsLoggedIn);
router.post("/add-report", authController.userAnalyticsReportAdder);
router.post("/add-financial-report", authController.userFinancialReportAdder);
router.post("/user-bank-detail", authController.userBankDetails);
router.get("/get-all-user", authController.getAllUsersDetails);
router.get("/get-pending-user", authController.getAllPendingProfile);
router.post("/forgot-verify-otp", authController.verifyForgotPassOtp);
router.post("/forgot-send-email", authController.forgotPassOtpSender);
router.post("/reset-password", authController.passwordReseter);
router.post("/verify-otp", authController.verifyOtp);
router.post("/paid-earning", authController.addPaidEarning);
router.post("/edit-paid", authController.editPaid);
router.post("/send-email", authController.sendEmailForOtp);
router.post("/delete-user", authController.deleteUser);
router.post("/excel-delete", authController.deleteExcelFile);
router.post(
  "/legal-doc",
  fileUpload.fields([{ name: "doc", maxCount: 1 }]),
  authController.addLegalDoc
);
router.post(
  "/add-excel",
  fileUpload.fields([{ name: "excel", maxCount: 1 }]),
  authController.addExcelSheet
);
router.post(
  "/cal-excel",
  fileUpload.fields([{ name: "excel", maxCount: 1 }]),
  authController.uploadExcelAndCalculate
);

router.post(
  "/edit-profile",
  fileUpload.fields([{ name: "userPic", maxCount: 1 }]),
  authController.editProfile
);

module.exports = router;
