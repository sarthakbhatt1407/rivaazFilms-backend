const BrandOrder = require("../models/brandOrder");
const InfOrder = require("../models/infOrder");
const brandUser = require("../models/prouser");
const infUser = require("../models/infuser");
const infOrder = require("../models/infOrder");
const pronoti = require("../models/pronoti");
const Package = require("../models/package");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
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
    paymentAmount,
    noOfNonCre,
    requirements,
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
      paymentAmount: paymentAmount ? paymentAmount : 0,
      influencersAmount,
      remark: "",
      noOfNonCre,
      requirements,
    });

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
          orderAmount: selectedInfluencers.find((user) => {
            return user.id === id;
          }).price,
          remark: " ",
          screenshot: " ",
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
    sendOrderEmailToInfluencers(idArr, brandOrder);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    message: "Influencer added from order successfully.",
  });
};

exports.getBrandHomeData = async (req, res) => {
  const { id } = req.body;
  let totalOrders,
    completedOrders,
    pendingOrders,
    inProcess,
    paidOrders,
    rejectOrder;
  try {
    totalOrders = await BrandOrder.find({ userId: id });
    completedOrders = await BrandOrder.find({
      userId: id,
      status: "completed",
    });
    pendingOrders = await BrandOrder.find({ userId: id, status: "pending" });
    paidOrders = await BrandOrder.find({
      userId: id,
      paymentStatus: "completed",
    });
    inProcess = await BrandOrder.find({ userId: id, status: "in process" });
    rejectOrder = await BrandOrder.find({ userId: id, status: "rejected" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    totalOrders: totalOrders.length,
    rejectOrder: rejectOrder.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    paidOrders: paidOrders.reduce((acc, curr) => acc + curr.paymentAmount, 0),
    inProcess: inProcess.length,
  });
};
exports.getInfHomeData = async (req, res) => {
  const { id } = req.body;
  console.log(id);

  let totalOrders,
    completedOrders,
    pendingOrders,
    inProcess,
    paidOrders,
    user,
    price,
    rejectOrder;
  try {
    totalOrders = await infOrder.find({ infId: id });
    completedOrders = await infOrder.find({
      infId: id,
      status: "completed",
    });

    pendingOrders = await infOrder.find({ infId: id, status: "pending" });
    paidOrders = await infOrder.find({
      infId: id,
      status: "completed",
    });
    inProcess = await infOrder.find({ infId: id, status: "in process" });
    rejectOrder = await infOrder.find({ infId: id, status: "rejected" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    totalOrders: totalOrders.length,
    rejectOrder: rejectOrder.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    paidOrders: paidOrders.reduce((acc, curr) => acc + curr.orderAmount, 0),
    inProcess: inProcess.length,
  });
};
exports.getAdminHomeData = async (req, res) => {
  const { id } = req.body;
  let totalOrders,
    completedOrders,
    pendingOrders,
    inProcess,
    paidOrders,
    totalUsers,
    activeUsers,
    inactiveUsers,
    initialUsers,
    totalInfUsers,
    totalBrandUsers,
    adminApprovalUsers;

  try {
    totalOrders = await BrandOrder.find({});
    completedOrders = await BrandOrder.find({
      status: "completed",
    });
    totalOrders = totalOrders.filter((order) => order.status !== "rejected");
    pendingOrders = await BrandOrder.find({ status: "pending" });
    paidOrders = await BrandOrder.find({
      status: "completed",
    });
    console.log(paidOrders);

    inProcess = await BrandOrder.find({ status: "in process" });
    totalInfUsers = await infUser.find({});
    totalBrandUsers = await brandUser.find({ userType: "promoter" });
    activeUsers = await infUser.find({ status: "active" });
    inactiveUsers = await infUser.find({ status: "closed" });
    initialUsers = await infUser.find({ status: "initial" });
    adminApprovalUsers = await infUser.find({ status: "for admin approval" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    totalOrders: totalOrders.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    paidOrders: paidOrders.reduce(
      (acc, curr) => Number(acc) + Number(curr.paymentAmount),
      0
    ),
    inProcess: inProcess.length,
    totalUsers: totalInfUsers.length + totalBrandUsers.length,
    totalBrandUsers: totalBrandUsers.length,
    initialUsers: initialUsers.length,
    inactiveUsers: inactiveUsers.length,
    activeUsers: activeUsers.length,
    totalInfUsers: totalInfUsers.length,
    adminApprovalUsers: adminApprovalUsers.length,
  });
};

exports.rejectOrderFromAdmin = async (req, res) => {
  const { orderId, remark } = req.body; // Get orderId from request parameters
  console.log(orderId);

  try {
    const order = await BrandOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    order.status = "rejected";
    order.remark = remark;
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

exports.deleteBrandOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await BrandOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    const imagesArr = order.images.split(", ");

    imagesArr.forEach((image) => {
      fs.unlink(image, (err) => {
        if (err) {
          console.error(`Failed to delete image`, err);
        }
      });
    });

    fs.unlink(order.video, (err) => {
      if (err) {
        console.error(`Failed to delete video`, err);
      }
    });
    fs.unlink(order.audio, (err) => {
      if (err) {
        console.error(`Failed to delete audio`, err);
      }
    });
    await order.deleteOne();
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    message: "Order deleted successfully.",
  });
};

exports.orderCompleted = async (req, res) => {
  const { orderId, action } = req.body; // Get orderId from request parameters

  try {
    const order = await BrandOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (action == "completed") {
      order.status = "completed";
    } else {
      order.status = "in process";
    }

    try {
      await order.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update order " });
    }
    return res.status(200).json({
      order: order.toObject({ getters: true }),
      message: "Order updated successfully.",
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.rejectInfOrderFromAdmin = async (req, res) => {
  const { orderId, remark, infId } = req.body; // Get orderId from request parameters
  console.log(orderId, remark);

  try {
    const order = await InfOrder.findOne({
      brandOrderId: orderId,
      infId: infId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    order.status = "rejected";
    order.remark = remark;
    try {
      await order.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update order" });
    }
    return res.status(200).json({
      order: order.toObject({ getters: true }),
      message: "Order updated successfully.",
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getInfWalletdata = async (req, res) => {
  const { id } = req.body;
  let totalOrders,
    completedOrders,
    pendingOrders,
    inProcess,
    paidOrders,
    user,
    price;

  try {
    user = await infUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    paidOrders = await infOrder.find({
      infId: id,
      status: "completed",
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    paidOrders: Number(
      paidOrders.reduce(
        (acc, curr) => Number(acc) + Number(curr.orderAmount),
        0
      )
    ),
    wallet: user.wallet,
    bonusWallet: user.bonus,
    bonus: Number(
      user.bonus.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0)
    ),
    balancePaid: Number(
      user.wallet.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0)
    ),
    currentBalance: Number(
      paidOrders.reduce(
        (acc, curr) => Number(acc) + Number(curr.orderAmount),
        0
      ) -
        user.wallet.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0)
    ),
  });
};

exports.addwalletTransaction = async (req, res) => {
  const { remark, infId, amount, action } = req.body; // Get orderId from request parameters
  console.log(remark, infId, amount, action);

  let user;
  try {
    user = await infUser.findById(infId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (action == "wallet") {
      const now = new Date();
      const date = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const formatTime = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        const strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
      };

      const time = formatTime(now);

      const obj = {
        id: uuidv4(),
        date: date,
        time: time,
        description: remark,
        amount: Number(amount),
      };
      let arr = [obj, ...user.wallet];
      user.wallet = arr;
    }
    if (action == "bonus") {
      const now = new Date();
      const date = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const formatTime = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        const strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
      };

      const time = formatTime(now);

      const obj = {
        id: uuidv4(),
        date: date,
        time: time,
        description: "Bonus",
        amount: Number(amount),
      };
      let arr = [obj, ...user.bonus];
      user.bonus = arr;
    }
    try {
      await user.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update wallet" });
    }
    return res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteWallletEntry = async (req, res) => {
  const { id, action, infId } = req.body;
  console.log(id, action, infId);

  let user;
  try {
    user = await infUser.findById(infId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (action.toLowerCase() == "bonus") {
      const obj = user.bonus.find((entry) => entry.id == id);
      if (!obj) {
        return res.status(404).json({ message: "Entry not found." });
      }
      let arr = user.bonus.filter((entry) => entry.id != id);
      user.bonus = arr;
    } else {
      const obj = user.wallet.find((entry) => entry.id == id);
      if (!obj) {
        return res.status(404).json({ message: "Entry not found." });
      }
      let arr = user.wallet.filter((entry) => entry.id != id);
      user.wallet = arr;
    }
    try {
      await user.save();
    } catch (error) {
      return res.status(500).json({ message: "Failed to update wallet" });
    }
    return res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.addNewPackage = async (req, res) => {
  const {
    name,
    description,
    discountedPrice,
    originalPrice,
    type,
    selectedInf,
  } = req.body;

  let alreadyExist;
  try {
    alreadyExist = await Package.findOne({ type: type });
    if (alreadyExist) {
      alreadyExist.name = name;
      alreadyExist.description = description;
      alreadyExist.discountedPrice = discountedPrice;
      alreadyExist.originalPrice = originalPrice;
      alreadyExist.selectedInf = selectedInf;
      try {
        await alreadyExist.save();
      } catch (error) {
        return res.status(500).json({ message: "Failed to update package" });
      }
      return res.status(200).json({ message: "Package updated successfully." });
    } else {
      const newPackage = new Package({
        name,
        description,
        discountedPrice: Number(discountedPrice),
        originalPrice: Number(originalPrice),
        selectedInf,
        type,
      });

      try {
        await newPackage.save();
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Failed to create new package" });
      }
      return res.status(201).json({ message: "Package created successfully." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getAllPackages = async (req, res) => {
  let packages;
  try {
    packages = await Package.find({});
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    packages: packages.map((pkg) => {
      return pkg.toObject({ getters: true });
    }),
  });
};

exports.addNewNotification = async (req, res) => {
  const { des, type } = req.body;
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  const time = formatTime(now);
  let alreadyExist;
  try {
    alreadyExist = await pronoti.findOne({ type: type });
    if (alreadyExist) {
      alreadyExist.des = des;
      alreadyExist.date = date;
      alreadyExist.time = time;

      try {
        await alreadyExist.save();
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Failed to update notification" });
      }
      return res
        .status(200)
        .json({ message: "Notification updated successfully." });
    } else {
      const newPackage = new pronoti({
        des,
        type,
        date,
        time,
      });

      try {
        await newPackage.save();
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Failed to create new notification" });
      }
      return res
        .status(201)
        .json({ message: "Notification created successfully." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteNotification = async (req, res) => {
  const { id } = req.body;

  try {
    const noti = await pronoti.findById(id);
    if (!noti) {
      return res.status(404).json({ message: "Notification not found." });
    }
    try {
      await noti.deleteOne();
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    message: "Notification deleted successfully.",
  });
};

exports.getNotifications = async (req, res) => {
  let notifications;
  try {
    notifications = await pronoti.find({});
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
  return res.status(200).json({
    notifications: notifications.map((noti) => {
      return noti.toObject({ getters: true });
    }),
  });
};
