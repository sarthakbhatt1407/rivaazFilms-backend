const BrandOrder = require("../models/brandOrder");
const InfOrder = require("../models/infOrder");
const infuser = require("../models/infuser");

exports.getOrdersByUserID = async (req, res) => {
  const id = req.body.id;

  let orders = [];

  try {
    orders = await InfOrder.find({ infId: id });

    if (orders.length == 0) {
      return res.status(404).json({ message: "No orders found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    orders: orders.map((ord) => {
      return ord.toObject({ getters: true });
    }),
  });
};

exports.getOrderById = async (req, res) => {
  const { orderId } = req.body; // Get orderId from request parameters
  let infOrders = [];
  try {
    const order = await InfOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({
      order: order.toObject({ getters: true }),
      infOrders: infOrders.map((ord) => {
        return ord.toObject({ getters: true });
      }),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
exports.editOrder = async (req, res) => {
  const { orderId, action, remark, link } = req.body; // Get orderId from request parameters
  console.log(orderId, action, remark);

  try {
    const order = await InfOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (action == "accept") {
      order.status = "in process";
      try {
        await order.save();
      } catch (error) {
        return res.status(500).json({ message: "Something went wrong." });
      }
    } else if (action == "completed") {
      order.status = "completed";
      order.workLink = link;
      order.remark = " ";
      try {
        await order.save();
      } catch (error) {
        return res.status(500).json({ message: "Something went wrong." });
      }
    } else {
      order.status = "rejected";
      order.remark = remark;
      try {
        await order.save();
      } catch (error) {
        return res.status(500).json({ message: "Something went wrong." });
      }
    }

    return res.status(200).json({
      order: order.toObject({ getters: true }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.updatePaymentOrderId = async (req, res) => {
  const { id, paymentOrderId } = req.body; // Get orderId and paymentOrderId from request body

  if (!id || !paymentOrderId) {
    return res
      .status(400)
      .json({ message: "Order ID and Payment Order ID are required." });
  }

  try {
    const order = await infuser.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Update the paymentOrderId
    order.paymentOrderId = paymentOrderId;

    await order.save();

    return res.status(200).json({
      message: "Payment Order ID updated successfully.",
      updatedOrder: order.toObject({ getters: true }),
    });
  } catch (error) {
    console.error("Error updating paymentOrderId:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
