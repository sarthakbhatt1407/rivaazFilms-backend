const RentalCategory = require("../models/rentalCategory");
const RentalItems = require("../models/rivaazRentalItems");
const rivaazRentalOrders = require("../models/rivaazRentalOrders");
const rentalPortfolio = require("../models/rentalPortfolio");
const fs = require("fs");
const path = require("path");
// Category Controllers
exports.addRentalCategory = async (req, res) => {
  const { name } = req.body;

  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const imageUrl = req.files.image[0].path;

    const newCategory = new RentalCategory({
      name,
      image: imageUrl,
    });
    await newCategory.save();
    res.status(201).json({
      message: "Rental category added successfully",
      category: newCategory,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllRentalCategories = async (req, res) => {
  try {
    const categories = await RentalCategory.find();
    res.status(200).json({
      categories: categories.map((cat) => {
        return cat.toObject({ getters: true });
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteRentalCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    await RentalCategory.findByIdAndDelete(categoryId);

    res.status(200).json({ message: "Rental category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Rental Items Controllers

exports.addRentalItem = async (req, res) => {
  try {
    const { name, category, dailyRate, description, specifications, quantity } =
      req.body;
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const imageUrl = req.files.image[0].path;

    const newItem = new RentalItems({
      name,
      category,
      dailyRate,
      image: imageUrl,
      description,
      specifications,
      quantity,
      remaining: quantity,
    });
    await newItem.save();
    res.status(201).json({
      message: "Rental item added successfully",
      item: newItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllRentalItems = async (req, res) => {
  try {
    const items = await RentalItems.find();
    res.status(200).json({
      items: items.map((item) => {
        return item.toObject({ getters: true });
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteRentalItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    await RentalItems.findByIdAndDelete(itemId);
    res.status(200).json({ message: "Rental item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editrentalItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, category, dailyRate, description, specifications, quantity } =
      req.body;
    const updatedData = {
      name,
      category,
      dailyRate,
      description,
      specifications,
      quantity,
    };
    if (req.files && req.files.image) {
      updatedData.image = req.files.image[0].path;
    }
    const updatedItem = await RentalItems.findByIdAndUpdate(
      itemId,
      updatedData,
      { new: true },
    );
    res.status(200).json({
      message: "Rental item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updaterentalItemQuantity = async (req, res) => {
  const { count, id, action } = req.body;

  try {
    // Validate inputs
    if (!id || !action || !count) {
      return res
        .status(400)
        .json({ message: "Missing required fields: id, action, or count" });
    }

    if (isNaN(count) || count <= 0) {
      return res
        .status(400)
        .json({ message: "Count must be a positive number" });
    }

    const item = await RentalItems.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    if (action === "rent") {
      // Decrease quantity when renting
      if (item.quantity < count) {
        return res.status(400).json({
          message: `Insufficient quantity. Available: ${item.quantity}, Requested: ${count}`,
        });
      }
      item.remaining -= count;
    } else if (action === "receive") {
      // Increase quantity when receiving back
      item.remaining += count;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'rent' or 'receive'" });
    }

    const updatedItem = await item.save();
    res.status(200).json({
      message: `Rental item quantity ${action === "rent" ? "decreased" : "increased"} successfully`,
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getrentalItemById = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await RentalItems.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    res.status(200).json({
      item: item.toObject({ getters: true }),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Rental Orders Controllers

exports.createRentalOrder = async (req, res) => {
  try {
    const { name, email, phone, fromDate, toDate, notes, items } = req.body;
    const newOrder = new rivaazRentalOrders({
      name,
      email,
      phone,
      fromDate,
      toDate,
      notes,
      items,
      status: "Pending",
    });
    await newOrder.save();
    res.status(201).json({
      message: "Rental order created successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllRentalOrders = async (req, res) => {
  try {
    const orders = await rivaazRentalOrders.find();
    res.status(200).json({
      orders: orders.map((order) => {
        return order.toObject({ getters: true });
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateRentalOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const updatedOrder = await rivaazRentalOrders.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );
    res.status(200).json({
      message: "Rental order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteRentalOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    await rivaazRentalOrders.findByIdAndDelete(orderId);
    res.status(200).json({ message: "Rental order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Rental Portfolio Controllers

exports.creataPortfolioItem = async (req, res) => {
  try {
    const { title, url } = req.body;
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const imageUrl = req.files.image[0].path;

    const newPortfolioItem = new rentalPortfolio({
      title,
      url,
      image: imageUrl,
    });
    await newPortfolioItem.save();
    res.status(201).json({
      message: "Portfolio item created successfully",
      item: newPortfolioItem,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getAllPortfolioItems = async (req, res) => {
  try {
    const items = await rentalPortfolio.find();
    res.status(200).json({
      items: items.map((item) => {
        return item.toObject({ getters: true });
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.deletePortfolioItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await rentalPortfolio.findById(itemId);
    if (item && item.image) {
      const imagePath = item.image;
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Failed to delete image file:", err);
        }
      });
    }
    await rentalPortfolio.findByIdAndDelete(itemId);

    res.status(200).json({ message: "Portfolio item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editPortfolioItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { title, url } = req.body;
    const updatedData = {
      title,
      url,
    };
    if (req.files && req.files.image) {
      updatedData.image = req.files.image[0].path;
    }
    const updatedItem = await rentalPortfolio.findByIdAndUpdate(
      itemId,
      updatedData,
      { new: true },
    );
    res.status(200).json({
      message: "Portfolio item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
