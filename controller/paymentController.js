const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const BrandOrder = require("../models/brandOrder");
const InfOrder = require("../models/infOrder");
const brandUser = require("../models/prouser");
const infUser = require("../models/infuser");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

function sendOrderEmailToInfluencers(idArr, brandOrder) {
  console.log("Sending order email to influencers:", idArr, brandOrder);

  idArr.forEach(async (id) => {
    try {
      const influencer = await infUser.findById(id);
      if (influencer && influencer.email) {
        const mailOptions = {
          from: process.env.SMPT_EMAIL,
          to: influencer.email,
          subject: `🌟 New Order: ${brandOrder.campaignName}`,
          html: `
            <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
              <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
                <div style="text-align:center;">
                  <img src="https://i.ibb.co/1ttPGZbp/ready.png" alt="Order" width="50" style="margin-bottom: 16px;" />
                  <h2 style="color: #222;">You Have a New Order!</h2>
                </div>
                <p style="font-size: 16px; color: #444;">
                  Hello <b>${influencer.name || "Influencer"}</b>,
                </p>
                <p style="font-size: 16px; color: #444;">
                  Congratulations! You have received a new order for the campaign:
                </p>
                <div style="background: #f1f5fb; border-radius: 6px; padding: 16px; margin: 16px 0;">
                  <b>Brand:</b> ${brandOrder.brandName}<br/>
                  <b>Campaign:</b> ${brandOrder.campaignName}<br/>
                  <b>Description:</b> ${brandOrder.campaignDescription}
                </div>
                <p style="font-size: 16px; color: #444;">
                  Please log in to your dashboard to view more details and start working on your order.
                </p>
                <div style="text-align:center; margin: 24px 0;">
                  <a href="https://rivaazfilms.com/" style="background: #007bff; color: #fff; padding: 12px 28px; border-radius: 5px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
                </div>
                <p style="font-size: 14px; color: #888; text-align:center;">
                  Thank you for collaborating with us!<br/>Rivaaz Films Team
                </p>
              </div>
            </div>
          `,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(`Failed to send email to influencer ${id}:`, err);
          }
        });
      }
    } catch (err) {
      console.error(`Failed to process influencer ${id}:`, err);
    }
  });
}

const paymentVerifier = async (req, res) => {
  const orderId = req.params.id; // Razorpay Order ID

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
    if (brandOrder.paymentStatus === "completed") {
      return res.status(200).json({
        message: `Payment verification completed. Status: ${updatedPaymentStatus}`,
        paymentStatus: updatedPaymentStatus,
        brandOrder,
      });
    }

    if (updatedPaymentStatus === "completed") {
      let idArr = brandOrder.selectedInfluencers.map(
        (influencer) => influencer.id
      );

      for (const id of idArr) {
        let alreadyOrder = await InfOrder.findOne({
          infId: id,
          brandOrderId: brandOrder._id,
        });
        if (alreadyOrder) {
          continue;
        }
        try {
          const createdNewInfOrder = new InfOrder({
            brandName: brandOrder.brandName,
            campaignName: brandOrder.campaignName,
            campaignDescription: brandOrder.campaignDescription,
            infId: id,
            images: brandOrder.images,
            brandOrderId: brandOrder._id,
            status: "pending",
            workLink: "",
            remark: "",
            orderAmount: brandOrder.selectedInfluencers.find((user) => {
              return user.id === id;
            }).price,
            remark: " ",
            screenshot: " ",
          });
          await createdNewInfOrder.save();
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .json({ message: "Failed to create new influencer order" });
        }
      }
      sendOrderEmailToInfluencers(idArr, brandOrder);
    }

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
const paymentVerifierInf = async (req, res) => {
  const orderId = req.params.id; // Razorpay Order ID

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
    const user = await infUser.findOne({ paymentOrderId: orderId });

    // Update the paymentStatus in the database
    user.paymentStatus = updatedPaymentStatus;
    user.status = "for admin approval";

    await user.save();

    return res.status(200).json({
      message: `Payment verification completed. Status: ${updatedPaymentStatus}`,
      paymentStatus: updatedPaymentStatus,
      user,
    });
  } catch (error) {
    console.error("Error verifying or capturing payment:", error);
    return res.status(400).json({ message: "Error verifying payment", error });
  }
};

module.exports = {
  createOrder,
  paymentVerifier,
  paymentVerifierInf,
};
