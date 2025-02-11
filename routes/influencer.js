const express = require("express");
const router = express.Router();
const infController = require("../controller/infController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/get-order-by-user-id",
  infController.getOrdersByUserID // The controller to handle the request
);

router.post(
  "/get-order-by-id",
  infController.getOrderById // The controller to handle the request
);
router.post(
  "/edit-order",
  infController.editOrder // The controller to handle the request
);
router.post(
  "/update-payment-id",
  infController.updatePaymentOrderId // The controller to handle the request
);

module.exports = router;
