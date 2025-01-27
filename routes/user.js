const express = require("express");
const router = express.Router();
const brandAndInfUserController = require("../controller/brandAndInfUserController");

router.post("/check-user", brandAndInfUserController.userExists);
router.post("/register", brandAndInfUserController.userRegistration);
router.post("/login", brandAndInfUserController.userLogin);


module.exports = router;