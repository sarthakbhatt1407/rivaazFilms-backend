const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/signup", authController.userRegistration);
router.post("/login", authController.userLogin);
router.get("/get-user", authController.getUserDetailsWithUserId);
router.post("/session-checker", authController.userIsLoggedIn);
router.post("/add-report", authController.userAnalyticsReportAdder);
router.post("/add-financial-report", authController.userFinancialReportAdder);

module.exports = router;
