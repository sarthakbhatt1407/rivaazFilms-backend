const express = require("express");
const router = express.Router();
const rivaazRentalController = require("../controller/rivaazRentalController");
const fileUpload = require("../middleware/fileUpload");

// Rental Category Routes
router.post(
  "/add-category",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  rivaazRentalController.addRentalCategory,
);
router.get(
  "/all-rental-categories",
  rivaazRentalController.getAllRentalCategories,
);
router.delete(
  "/delete-rental-category/:id",
  rivaazRentalController.deleteRentalCategory,
);

// Rental Items Routes
router.post(
  "/add-rental-item",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  rivaazRentalController.addRentalItem,
);
router.get("/all-rental-items", rivaazRentalController.getAllRentalItems);

router.delete(
  "/delete-rental-item/:id",
  rivaazRentalController.deleteRentalItem,
);

router.put(
  "/update-rental-item/:id",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  rivaazRentalController.editrentalItem,
);
router.post(
  "/update-quantity",
  rivaazRentalController.updaterentalItemQuantity,
);

router.get("/rental-item/:id", rivaazRentalController.getrentalItemById);

// Rental Orders Routes
router.post("/create-rental-order", rivaazRentalController.createRentalOrder);
router.get("/all-rental-orders", rivaazRentalController.getAllRentalOrders);
router.put(
  "/update-rental-order-status/:id",
  rivaazRentalController.updateRentalOrderStatus,
);

router.delete(
  "/delete-rental-order/:id",
  rivaazRentalController.deleteRentalOrder,
);

// Rental Portfolio Routes
router.post(
  "/add-rental-portfolio",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  rivaazRentalController.creataPortfolioItem,
);

router.get(
  "/all-rental-portfolio",
  rivaazRentalController.getAllPortfolioItems,
);

router.delete(
  "/delete-rental-portfolio/:id",
  rivaazRentalController.deletePortfolioItem,
);

router.put(
  "/update-rental-portfolio/:id",
  fileUpload.fields([
    {
      name: "image", // This should match the field name for the audio file
      maxCount: 1, // You can specify the max number of files to upload
    },
  ]),
  rivaazRentalController.editPortfolioItem,
);

// Login
router.post("/admin-login", rivaazRentalController.adminLogin);

module.exports = router;
