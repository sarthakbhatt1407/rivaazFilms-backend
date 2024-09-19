const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Define paths for image and audio uploads
const imageUploadDirectory = path.join("uploads/images");
const audioUploadDirectory = path.join("uploads/audios");
const documentsUploadDirectory = path.join("uploads/documents");
const reportsUploadDirectory = path.join("uploads/reports");

// Create directories if they don't exist
if (!fs.existsSync(imageUploadDirectory)) {
  fs.mkdirSync(imageUploadDirectory, { recursive: true });
}
if (!fs.existsSync(documentsUploadDirectory)) {
  fs.mkdirSync(documentsUploadDirectory, { recursive: true });
}
if (!fs.existsSync(reportsUploadDirectory)) {
  fs.mkdirSync(reportsUploadDirectory, { recursive: true });
}

if (!fs.existsSync(audioUploadDirectory)) {
  fs.mkdirSync(audioUploadDirectory, { recursive: true });
}

// Log the directories to verify paths

// Multer storage configuration for both images and audios
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "file") {
      // Save audio files in "uploads/audios" directory
      cb(null, audioUploadDirectory);
    } else if (
      file.fieldname === "thumbnail" ||
      file.fieldname === "userPic" ||
      file.fieldname === "sign"
    ) {
      // Save image files in "uploads/images" directory
      cb(null, imageUploadDirectory);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4() + "-" + Date.now();
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === "file") {
      cb(null, "audio_" + uniqueSuffix + extension);
    } else if (
      file.fieldname === "thumbnail" ||
      file.fieldname === "userPic" ||
      file.fieldname === "sign"
    ) {
      cb(null, "image_" + uniqueSuffix + extension);
    }
  },
});

// Check for valid file types (audio and image)
function checkFileType(file, cb) {
  const filetypes =
    /wav|mp3|mpeg|ogg|aac|flac|alac|wma|aiff|mp4|webm|x-msvideo|x-ms-wmv|x-flv|quicktime|png|jpeg|jpg/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(
      "Error: Invalid file type! Only audio and image files are allowed."
    );
  }
}

// Multer upload setup
const fileUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = fileUpload;
