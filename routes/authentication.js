const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const ImgUpload = require("../middleware/ImgUpload");

router.post(
  "/signup",
  ImgUpload.fields([
    {
      name: "sign",
    },
    {
      name: "userPic",
    },
  ]),
  authController.userRegistration
);
router.post("/login", authController.userLogin);
router.get("/get-user", authController.getUserDetailsWithUserId);
router.post("/session-checker", authController.userIsLoggedIn);
router.post("/add-report", authController.userAnalyticsReportAdder);
router.post("/add-financial-report", authController.userFinancialReportAdder);
router.post("/user-bank-detail", authController.userBankDetails);
router.get("/get-all-user", authController.getAllUsersDetails);

module.exports = router;
