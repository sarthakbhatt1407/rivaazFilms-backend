const express = require("express");
const router = express.Router();
const brandOrderController = require("../controller/brandOrderController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/new-order",
  fileUpload.fields([
    // Use fields for handling multiple files with different field names
    {
      name: "file", // Matches the field name for the audio file
      maxCount: 1, // Allow 1 file upload for audio
    },
    {
      name: "video", // Matches the field name for the video file
      maxCount: 1, // Allow 1 file upload for video
    },
    {
      name: "image", // Matches the field name for image files
      maxCount: 5, // Allow up to 5 image files
    },
  ]),
  brandOrderController.createNewOrder // The controller to handle the request
);

module.exports = router;
