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
      name: "thumbnail",
    },
  ]),
  orderController.orderCreator
);

router.get("/get-order", orderController.getOrderByOrderId);
router.get("/get-all-orders", orderController.getAllOrders);

router.get("/user-all-orders", orderController.getOrderByUser);

router.patch(
  "/update-order",
  fileUpload.fields([
    {
      name: "file",
    },
    {
      name: "thumbnail",
    },
  ]),
  orderController.editOrderById
);

module.exports = router;
