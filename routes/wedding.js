const express = require("express");
const router = express.Router();
const weddingController = require("../controller/weddingController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/add-gallery",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
    {
      name: "video", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  weddingController.addGalleryItem
);
router.get("/gallery/:type", weddingController.getGalleryItems);
router.delete("/delete-gallery/:id", weddingController.deleteGalleryItem);
router.post(
  "/add-rental",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
    {
      name: "video", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  weddingController.addNewRental
);
router.get("/get-rental", weddingController.getAllRentals);
router.delete("/delete-rental/:id", weddingController.deleteRental);
router.post(
  "/edit-rental/:id",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
    {
      name: "video", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  weddingController.editRental
);
router.post("/add-rental-order", weddingController.createRentalOrder);
router.get("/get-all-rental-orders", weddingController.getAllRentalOrders);
router.post(
  "/update-rental-order/:id",
  weddingController.updateRentalOrderStatus
);

router.post(
  "/toggle-rental-availability/:id",
  weddingController.toggleRentalAvailability
);

module.exports = router;
