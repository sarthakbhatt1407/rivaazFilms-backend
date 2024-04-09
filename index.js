// modules
const session = require("express-session");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;

// imports
const corsPolicy = require("./middleware/CORS");
const authenticationRoute = require("./routes/authentication");
const orders = require("./routes/orders");
const fileRoute = require("./routes/file");

//  CORS
app.use(corsPolicy);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// file serving
app.use("/uploads", express.static("uploads"));

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
// app.use("/", (req, res) => {
//   res.send(
//     "<a target='_blank' href='http://localhost:5000/file/download/?filePath=uploads\\audiof09f558d-814e-47ec-a3ff-e379f858dc98-sample.mp3'>Click</a>"
//   );
// });
app.use(
  "/upload",

  (req, res) => {
    return res.status(200).json({ message: "done" });
  }
);

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
