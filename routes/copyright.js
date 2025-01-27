const express = require("express");
const router = express.Router();
const copyrightController = require("../controller/copyrightController");

router.post("/create-new-query", copyrightController.createNewCopyRight);
router.patch("/update-query", copyrightController.updateCopyrightQuery);
router.get("/get-all-user-query", copyrightController.getAllQueryByUserId);
router.get("/get-all-query", copyrightController.getAllQueries);

module.exports = router;
