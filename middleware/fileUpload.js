const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, cb) {
    if (file.fieldname === "file") {
      cb(null, "audio" + uuidv4() + "-" + file.originalname);
    }
    if (file.fieldname === "thumbnail") {
      cb(null, "image_" + uuidv4() + "-" + file.originalname);
    }
  },
});

function checkFileType(file, cb) {
  const filetypes =
    /wav|mp3|mpeg|ogg|aac|flac|alac|wma|aiff|mp4|webm|x-msvideo|x-ms-wmv|x-flv|quicktime|png|jpeg|jpg/;
  // const filetypes = //;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb("Error: Audio or Video Files Only!");
  }
}

const fileUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
module.exports = fileUpload;
