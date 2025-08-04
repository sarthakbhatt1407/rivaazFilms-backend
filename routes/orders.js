const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/new-order",
  fileUpload.fields([
    {
      name: "file", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
    {
      name: "thumbnail", // This should match the field name for the image file
      maxCount: 1, // Adjust the count if you expect multiple images
    },
  ]),
  orderController.orderCreator
);

router.get("/get-order", orderController.getOrderByOrderId);
router.get("/get-all-artists", orderController.getAllArtists);
router.post("/add-upc-isrc", orderController.addUPCISRT);
router.get("/get-all-orders", orderController.getAllOrders);

router.get("/user-all-orders", orderController.getOrderByUser);

router.patch(
  "/update-order",
  fileUpload.fields([
    {
      name: "file", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
    {
      name: "thumbnail", // This should match the field name for the image file
      maxCount: 1, // Adjust the count if you expect multiple images
    },
  ]),
  orderController.editOrderById
);
router.post("/artist", orderController.addArtist);
router.post("/send-otp", orderController.sentOtpForDelete);
router.put("/artist/:id", orderController.editArtistById);
router.delete("/artist/:id", orderController.deleteArtistById);

module.exports = router;
