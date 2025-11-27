const Rental = require("../models/rental");
const RentalOrder = require("../models/rentalOrder");
const Gallery = require("../models/gallery");

exports.addGalleryItem = async (req, res) => {
  const { type } = req.body;
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }

  let file;
  if (type === "image") {
    file = req.files.image[0];
  } else if (type === "video") {
    file = req.files.video[0];
  } else {
    return res.status(400).json({ message: "Invalid type specified!" });
  }

  try {
    const newItem = new Gallery({ type, link: file.path });
    await newItem.save();
    res
      .status(201)
      .json({ message: "Gallery item added successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding gallery item", error });
  }
};

exports.getGalleryItems = async (req, res) => {
  const { type } = req.params;
  try {
    const items = await Gallery.find({ type });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gallery items", error });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Gallery.findByIdAndDelete(id);
    res.status(200).json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting gallery item", error });
  }
};
exports.addNewRental = async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: "Please upload files!" });
  }
  let file = req.files.image[0];

  try {
    const {
      type,
      name,
      link,
      price,
      available,
      description,
      period,
      specification,
      included,
    } = req.body;
    const newRental = new Rental({
      type,
      name,
      link: file.path,
      price,
      available,
      description,
      period,
      specification,
      included,
    });
    await newRental.save();
    res.status(201).json({
      message: "Rental accessory added successfully",
      rental: newRental,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding rental accessory", error });
  }
};

exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rentals", error });
  }
};

exports.deleteRental = async (req, res) => {
  try {
    const { id } = req.params;
    await Rental.findByIdAndDelete(id);
    res.status(200).json({ message: "Rental accessory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rental accessory", error });
  }
};
exports.editRental = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = req.body;
    console.log(req.body);

    const updatedRental = await Rental.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.status(200).json({
      message: "Rental accessory updated successfully",
      rental: updatedRental,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating rental accessory", error });
  }
};

exports.createRentalOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      bookingDateFrom,
      bookingDateTo,
      notes,
      amount,
      rentalItem,
    } = req.body;

    const newOrder = new RentalOrder({
      name,
      phone,
      bookingDateFrom,
      bookingDateTo,
      notes,
      amount,
      rentalItem,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Rental order created successfully", order: newOrder });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error creating rental order", error });
  }
};

exports.getAllRentalOrders = async (req, res) => {
  try {
    const orders = await RentalOrder.find();

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rental orders", error });
  }
};

exports.updateRentalOrderStatus = async (req, res) => {
  console.log("Update Rental Order Status called");
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log("Order ID:", id, "Status:", status);

    // Find the order first to get rental items
    const order = await RentalOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order rental items:", order.rentalItem);

    // Update the order status
    const updatedOrder = await RentalOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    // If status is confirmed, make all rental items unavailable
    if (status === "Confirmed") {
      if (order.rentalItem && order.rentalItem.length > 0) {
        for (const item of order.rentalItem) {
          // Try different possible ID fields
          const itemId = item._id || item.id || item;
          console.log("Updating rental item ID:", itemId);

          if (itemId) {
            await Rental.findByIdAndUpdate(itemId, { available: false });
            console.log("Updated rental item:", itemId, "to unavailable");
          }
        }
      }
    }

    // If status is rejected, make all rental items available again and delete the order
    if (status === "Rejected") {
      if (order.rentalItem && order.rentalItem.length > 0) {
        for (const item of order.rentalItem) {
          // Try different possible ID fields
          const itemId = item._id || item.id || item;
          console.log("Updating rental item ID:", itemId);

          if (itemId) {
            await Rental.findByIdAndUpdate(itemId, { available: true });
            console.log("Updated rental item:", itemId, "to available");
          }
        }
      }

      // Delete the rejected order
      await RentalOrder.findByIdAndDelete(id);
      console.log("Deleted rejected order:", id);

      return res.status(200).json({
        message: "Rental order rejected and deleted successfully",
        deletedOrderId: id,
      });
    }

    res.status(200).json({
      message: "Rental order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating rental order status:", error);
    res
      .status(500)
      .json({ message: "Error updating rental order status", error });
  }
};

exports.toggleRentalAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the current rental item
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    // Toggle the availability status
    const newAvailability = !rental.available;

    const updatedRental = await Rental.findByIdAndUpdate(
      id,
      { available: newAvailability },
      { new: true }
    );

    const statusMessage = newAvailability
      ? "Rental item is now available"
      : "Rental item is now unavailable";

    res.status(200).json({
      message: statusMessage,
      rental: updatedRental,
      previousStatus: rental.available,
      currentStatus: newAvailability,
    });
  } catch (error) {
    console.error("Error toggling rental availability:", error);
    res.status(500).json({
      message: "Error toggling rental availability",
      error,
    });
  }
};
