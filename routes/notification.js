const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");

router.post("/add-notification", notificationController.addNotification);
router.get("/get-all", notificationController.getAllNoti);
router.post("/delete-notification", notificationController.deleteNotifiction);

module.exports = router;
