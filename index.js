// modules
const session = require("express-session");
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 3000;

// imports
//const corsPolicy = require("./middleware/CORS");
const authenticationRoute = require("./routes/authentication");
const userRoute = require("./routes/user");
const brandroute = require("./routes/brand");
const infroute = require("./routes/influencer");
const orders = require("./routes/orders");
const fileRoute = require("./routes/file");
const copyrightRoute = require("./routes/copyright");
const querytRoute = require("./routes/query");
const notificationRoute = require("./routes/notification");
const paymentRoute = require("./routes/payment");
const weddingRoute = require("./routes/wedding");
const rivaazRental = require("./routes/rivaazRental");
//  CORS
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
//app.use(corsPolicy);
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ limit: "1000mb", extended: false }));

// file serving
// Absolute paths for the directories
const imageUploadDirectory = path.join("uploads/images");
const audioUploadDirectory = path.join("uploads/audios");
const documentUploadDirectory = path.join("uploads/documents");
const reportUploadDirectory = path.join("uploads/reports");
const videoUploadDirectory = path.join("uploads/videos");

// Serve static files
app.use("/uploads/images", express.static(imageUploadDirectory));
app.use("/uploads/audios", express.static(audioUploadDirectory));
app.use("/uploads/documents", express.static(documentUploadDirectory));
app.use("/uploads/reports", express.static(reportUploadDirectory));
app.use("/uploads/videos", express.static(videoUploadDirectory));

// Routes
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 30 },
  }),
);
app.use("/user", authenticationRoute);
app.use("/brand", brandroute);
app.use("/inf/user", userRoute);
app.use("/inf", infroute);

app.use("/order", orders);
app.use("/file", fileRoute);
app.use("/copyright", copyrightRoute);
app.use("/query", querytRoute);
app.use("/notification", notificationRoute);
app.use("/payment", paymentRoute);
app.use("/wedding", weddingRoute);
app.use("/rivaaz-rental", rivaazRental);

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
