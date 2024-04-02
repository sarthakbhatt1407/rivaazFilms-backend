const express = require("express");
const router = express.Router();
const fileController = require("../controller/fileController");

router.get("/download", fileController.downloadFile);

module.exports = router;
