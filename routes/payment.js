const express = require("express");
const payment_route = express();
const paymentController = require("../controller/paymentController");

payment_route.post("/create-order", paymentController.createOrder);
payment_route.get("/payment-verifier/:id", paymentController.paymentVerifier);
payment_route.get(
  "/payment-verifier-inf/:id",
  paymentController.paymentVerifierInf
);

module.exports = payment_route;
