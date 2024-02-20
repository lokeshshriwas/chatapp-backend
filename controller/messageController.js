const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    console.log("Invalid data passed into request");
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    const messageData = await Message.create(newMessage);
    const fromMessageId = await Message.findById(messageData._id).populate([
      { path: "sender", select: "-password" },
      { path: "chat", populate: { path: "users", select: "-password" } },
    ]);

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: fromMessageId,
    });

    res.json(fromMessageId);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400);
    return console.log("chatId is required");
  }

  try {
    const message = await Message.find({ chat: chatId }).populate([
      { path: "sender", select: "-password" },
      { path: "chat" },
    ]);
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
