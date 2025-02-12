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
router.post(
  "/get-order-by-user-id",
  brandOrderController.getOrdersByUserID // The controller to handle the request
);
router.post(
  "/get-order-by-id",
  brandOrderController.getOrderById // The controller to handle the request
);
router.post(
  "/update-payment-id",
  brandOrderController.updatePaymentOrderId // The controller to handle the request
);
router.post(
  "/get-all-orders",
  brandOrderController.getAllOrders // The controller to handle the request
);
router.post(
  "/update-payment-amount",
  brandOrderController.updateOrderPaymentAmount // The controller to handle the request
);
router.post(
  "/delete-inf-order",
  brandOrderController.deleteInfFromOrder // The controller to handle the request
);
router.post(
  "/add-inf-order",
  brandOrderController.addInfFromOrder // The controller to handle the request
);
router.post(
  "/get-brand-home-data",
  brandOrderController.getBrandHomeData // The controller to handle the request
);
router.post(
  "/get-inf-home-data",
  brandOrderController.getInfHomeData // The controller to handle the request
);
router.post(
  "/get-admin-home-data",
  brandOrderController.getAdminHomeData // The controller to handle the request
);
router.post(
  "/reject-order",
  brandOrderController.rejectOrderFromAdmin // The controller to handle the request
);
router.post(
  "/delete-order",
  brandOrderController.deleteBrandOrder // The controller to handle the request
);

module.exports = router;
