const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/signup", authController.userRegistration);
router.post("/login", authController.userLogin);
router.get("/logout", authController.destroySession);
router.post("/session-checker", authController.userIsLoggedIn);

module.exports = router;
