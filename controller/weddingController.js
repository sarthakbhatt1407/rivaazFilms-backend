const Rental = require("../models/rental");
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
