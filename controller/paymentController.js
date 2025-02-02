const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const BrandOrder = require("../models/brandOrder");

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

// const paymentVerifier = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const pay = await razorpayInstance.payments.all({ count: 100 });
//     const orderPaymentInfo = pay.items.find((item) => {
//       return item.order_id === id;
//     });
//     if (orderPaymentInfo) {
//       return res.status(200).json(orderPaymentInfo);
//     } else {
//       return res.status(200).json({ captured: false, id });
//     }
//   } catch (error) {
//     // return res.status(400).json({ message: "No payment found", error });
//   }
// };
const paymentVerifier = async (req, res) => {
  const orderId = req.params.id; // Razorpay Order ID
  console.log(orderId);

  try {
    // Fetch all payments related to this order ID
    const payments = await razorpayInstance.payments.all({ count: 100 });

    // Find the payment matching the order ID
    const orderPayment = payments.items.find(
      (payment) => payment.order_id === orderId
    );

    if (!orderPayment) {
      return res
        .status(404)
        .json({ message: "No payment found for this order", orderId });
    }

    let updatedPaymentStatus = "failed";

    // If payment is authorized, capture it
    if (orderPayment.status === "authorized") {
      const captureResponse = await razorpayInstance.payments.capture(
        orderPayment.id, // Payment ID
        orderPayment.amount, // Capture full amount
        orderPayment.currency
      );

      updatedPaymentStatus = "completed";
    }
    if (orderPayment.status === "captured") {
      updatedPaymentStatus = "completed";
    }

    // Find the BrandOrder using paymentOrderId
    const brandOrder = await BrandOrder.findOne({ paymentOrderId: orderId });

    if (!brandOrder) {
      return res.status(404).json({ message: "Brand order not found." });
    }

    // Update the paymentStatus in the database
    brandOrder.paymentStatus = updatedPaymentStatus;
    brandOrder.status = "in process";
    await brandOrder.save();

    return res.status(200).json({
      message: `Payment verification completed. Status: ${updatedPaymentStatus}`,
      paymentStatus: updatedPaymentStatus,
      brandOrder,
    });
  } catch (error) {
    console.error("Error verifying or capturing payment:", error);
    return res.status(400).json({ message: "Error verifying payment", error });
  }
};
const createOrder = async (req, res) => {
  try {
    const amount = req.body.amount * 100;
    const options = {
      amount: amount,
      currency: "INR",
      receipt: "razorUser@gmail.com",
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          contact: req.body.userContact,
          name: req.body.userName,
          email: req.body.userEmail,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createOrder,
  paymentVerifier,
};
