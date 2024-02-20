const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { feedNofications, fetchNotification } = require("../controller/notificationController");

router.route("/").post(protect, feedNofications)
.get(protect, fetchNotification);

module.exports = router;