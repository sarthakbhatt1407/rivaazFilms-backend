const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/new-order",
  fileUpload.fields([
    {
      name: "file",
    },
    {
      name: "image",
    },
  ]),
  orderController.orderCreator
);

router.get("/get-order", orderController.getOrderByOrderId);

router.get("/user-all-orders", orderController.getOrderByUser);

router.patch(
  "/update-order",
  fileUpload.fields([
    {
      name: "file",
    },
    {
      name: "image",
    },
  ]),
  orderController.editOrderById
);

module.exports = router;
