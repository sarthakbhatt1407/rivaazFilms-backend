// modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;

// imports
const corsPolicy = require("./middleware/CORS");

const imageUpload = require("./middleware/imageUpload");
const audioUpload = require("./middleware/audioUpload");

//  CORS
app.use(corsPolicy);

// file serving
app.use("/images", express.static("images"));

// Routes

app.post("/upload", audioUpload.single("audio"), (req, res) => {
  // req.file contains the uploaded audio file
  // Do something with the audio file, such as save it to a database or storage service
  res.send(req.file.path);
});
// Routes Middleware

// Database
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Connection successful");
    });
  })
  .catch((err) => {
    console.log("Connection Failed!");
  });
