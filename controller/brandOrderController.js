const BrandOrder = require("../models/brandOrder");
const InfOrder = require("../models/infOrder");
const brandUser = require("../models/prouser");
const infUser = require("../models/infuser");
exports.createNewOrder = async (req, res) => {
  const {
    brandName,
    campaignName,
    collaborationId,
    campaignDescription,
    selectedInfluencers,
    infIdArr,
    campaignUrl,
    userId,
    influencersAmount,
  } = req.body;
  const InfIdArrParsed = JSON.parse(infIdArr);
  let createdOrder;

  try {
    // Initialize variables for file paths
    let imagePaths = "";
    let videoPath = "";
    let audioPath = "";

    // Check if files are uploaded
    if (req.files) {
      // Handle images - assuming `image` field can have multiple files
      if (req.files.image) {
        imagePaths = req.files.image.map((file) => file.path).join(", "); // Join image paths as a single string
      }

      // Handle video - assuming `video` field has one file
      if (req.files.video) {
        videoPath = req.files.video[0].path; // Only one video, so just take the first one
      }

      // Handle audio - assuming `audio` field has one file
      if (req.files.file) {
        audioPath = req.files.file[0].path; // Only one audio, so just take the first one
      }
    }
    createdOrder = new BrandOrder({
      brandName,
      campaignName,
      collaborationId,
      campaignDescription,
      video: videoPath,
      images: imagePaths,
      campaignUrl,
      userId,
      paymentStatus: "pending",
      paymentOrderId: "",
      selectedInfluencers: JSON.parse(selectedInfluencers),
      audio: audioPath,
      status: "pending",
      paymentAmount: 0,
      influencersAmount,
    });

    // InfIdArrParsed.forEach(async (id) => {
    //   try {
    //     const cretedNewInfOrder = await new InfOrder({
    //       brandName,
    //       campaignName,
    //       campaignDescription,
    //       infId: id,
    //       images: imagePaths,
    //       brandOrderId: createdOrder._id,
    //       status: "pending",
    //       workLink: "",
    //       remark: "",
    //     });
    //     await cretedNewInfOrder.save();
    //   } catch (error) {
    //     console.log(error);
    //     return res
    //       .status(500)
    //       .json({ message: "Failed to create new influencer order" });
    //   }
    // });
    await createdOrder.save();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to create new order" });
  }

  return res
    .status(201)
    .json({ message: "New order created successfully", createdOrder });
};

exports.getOrdersByUserID = async (req, res) => {
  const id = req.body.id;
  console.log(id);

  let orders = [];

  try {
    orders = await BrandOrder.find({ userId: id });

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
    const order = await BrandOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    infOrders = await InfOrder.find({ brandOrderId: orderId });
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

exports.updatePaymentOrderId = async (req, res) => {
  const { orderId, paymentOrderId } = req.body; // Get orderId and paymentOrderId from request body

  if (!orderId || !paymentOrderId) {
    return res
      .status(400)
      .json({ message: "Order ID and Payment Order ID are required." });
  }

  try {
    const order = await BrandOrder.findById(orderId);

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

exports.getAllOrders = async (req, res) => {
  const id = req.body.id;
  let user;
  try {
    user = await brandUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.userType !== "admin") {
      return res.status(401).json({ message: "Unauthorized." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  const orders = await BrandOrder.find({});
  return res.status(200).json({
    orders: orders.map((ord) => {
      return ord.toObject({ getters: true });
    }),
  });
};

exports.updateOrderPaymentAmount = async (req, res) => {
  const { orderId, paymentAmount } = req.body; // Get orderId from request parameters
  let infOrders = [];
  try {
    const order = await BrandOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    order.paymentAmount = paymentAmount;
    try {
      await order.save();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to update payment amount" });
    }
    return res.status(200).json({
      order: order.toObject({ getters: true }),
      message: "Payment amount updated successfully.",
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteInfFromOrder = async (req, res) => {
  const { orderId, infId } = req.body;

  let orderBrand, infOrder;
  try {
    orderBrand = await BrandOrder.findById(orderId);
    if (!orderBrand) {
      return res.status(404).json({ message: "Order not found." });
    }
    infOrder = await InfOrder.findOne({ infId: infId, brandOrderId: orderId });

    if (!infOrder) {
      return res.status(404).json({ message: "Influencer order not found." });
    }
    try {
      await infOrder.deleteOne();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to delete influencer order" });
    }
    const selectedInfluencers = orderBrand.selectedInfluencers;
    const upadtedInf = selectedInfluencers.filter((inf) => inf.id !== infId);
    orderBrand.selectedInfluencers = upadtedInf;
    try {
      await orderBrand.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update order" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    message: "Influencer deleted from order successfully.",
  });
};
exports.addInfFromOrder = async (req, res) => {
  const { orderId, selectedInfluencers } = req.body;

  let brandOrder;
  try {
    brandOrder = await BrandOrder.findById(orderId);
    if (!brandOrder) {
      return res.status(404).json({ message: "Order not found." });
    }
    let idArr = selectedInfluencers.map((influencer) => influencer.id);

    idArr.forEach(async (id) => {
      try {
        const cretedNewInfOrder = await new InfOrder({
          brandName: brandOrder.brandName,
          campaignName: brandOrder.campaignName,
          campaignDescription: brandOrder.campaignDescription,
          infId: id,
          images: brandOrder.images,
          brandOrderId: brandOrder._id,
          status: "pending",
          workLink: "",
          remark: "",
        });
        await cretedNewInfOrder.save();
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .json({ message: "Failed to create new influencer order" });
      }
    });
    let brandSelectedInfluencers = brandOrder.selectedInfluencers;
    let arr = [...brandSelectedInfluencers, ...selectedInfluencers];

    brandOrder.selectedInfluencers = arr;

    try {
      await brandOrder.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update order" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    message: "Influencer added from order successfully.",
  });
};
