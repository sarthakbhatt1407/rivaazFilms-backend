const express = require("express");
const router = express.Router();
const queryController = require("../controller/queryController");

router.post("/new-query", queryController.addQuery);
router.delete("/delete-query", queryController.deleteQuery);
router.get("/all-queries", queryController.getAllqueries);

module.exports = router;
