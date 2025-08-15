const express = require("express");
const router = express.Router();
const brandAndInfUserController = require("../controller/brandAndInfUserController");
const fileUpload = require("../middleware/fileUpload");
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
