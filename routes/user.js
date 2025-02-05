const express = require("express");
const router = express.Router();
const brandAndInfUserController = require("../controller/brandAndInfUserController");

router.post("/check-user", brandAndInfUserController.userExists);
router.post("/register", brandAndInfUserController.userRegistration);
router.post("/login", brandAndInfUserController.userLogin);
router.post("/chat", brandAndInfUserController.brandAndAdminChat);
router.post("/get-chats", brandAndInfUserController.getBrandAndAdminChat);

module.exports = router;
