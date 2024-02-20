const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/chatModel");
const Notification = require("../models/notification");

const feedNofications = asyncHandler(async (req, res) => {
  try {
    const messageId = JSON.parse(req.body.messageId);

    // Query for notifications for user or create new one atomically
    const notification = await Notification.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { messageId } },
      { new: true, upsert: true } // Return updated or newly created document
    ).populate([{ path: "messageId", populate: { path: "chat", populate: {path: "users"} } }]);

    res.status(200).json(notification);
  } catch (error) {
    console.error(error); // Log for debugging
    res.status(500).json({ message: "Internal server error" }); // Generic error message
  }
});

const fetchNotification = asyncHandler(async (req, res) => {
  if (!req.user) return;

  try {
    const userNotificationData = await Notification.findOne({
      userId: req.user._id,
    }).populate([{ path: "messageId", populate: { path: "chat", populate: {path: "users"} } }]);
    res.status(200).json(userNotificationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { feedNofications, fetchNotification };
