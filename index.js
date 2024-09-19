// modules
const session = require("express-session");
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3000;

// imports
const corsPolicy = require("./middleware/CORS");
const authenticationRoute = require("./routes/authentication");
const orders = require("./routes/orders");
const fileRoute = require("./routes/file");
const copyrightRoute = require("./routes/copyright");
const querytRoute = require("./routes/query");

//  CORS
app.use(corsPolicy);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// file serving
// Absolute paths for the directories
const imageUploadDirectory = path.join("uploads/images");
const audioUploadDirectory = path.join("uploads/audios");
const documentUploadDirectory = path.join("uploads/documents");
const reportUploadDirectory = path.join("uploads/reports");

// Serve static files
app.use("/uploads/images", express.static(imageUploadDirectory));
app.use("/uploads/audios", express.static(audioUploadDirectory));
app.use("/uploads/documents", express.static(documentUploadDirectory));
app.use("/uploads/reports", express.static(reportUploadDirectory));

// Routes
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 30 }, // session timeout of 60 seconds
  })
);
app.use("/user", authenticationRoute);
app.use("/order", orders);
app.use("/file", fileRoute);
app.use("/copyright", copyrightRoute);
app.use("/query", querytRoute);

app.use("/", (req, res) => {
  res.send("<h1>App is succesfully live on server.</h1>");
});

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
