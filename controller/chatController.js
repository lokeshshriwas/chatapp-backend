const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId params not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "-password", // Only fetch sender data without password
      },
    });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );
      console.log(FullChat);
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    const populatedChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate([
        { path: "users", select: "-password" },
        { path: "groupAdmin", select: "-password" },
        {
          path: "latestMessage",
          populate: { path: "sender", select: "-password" },
        },
      ])
      .sort({ updatedAt: -1 }); // Efficiently sort after population

    res.status(200).json(populatedChats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.users) {
    return res.status(400).send("Please fill all the field");
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users required to make a group chat");
  }
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById(groupChat._id).populate([
      { path: "users", select: "-password" },
      { path: "groupAdmin", select: "-password" },
    ]);

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).send("Required Field Missing");
  }

  // only admin can rename the groupname

  const updatedByAdmin = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  ).where({ groupAdmin: { $eq: req.user } });

  if (!updatedByAdmin) {
    return res.status(400).send("Only admin can change");
  }

  const updatedGroup = await Chat.findById(chatId).populate([
    { path: "users", select: "-password" },
    { path: "groupAdmin", select: "-password" },
  ]);

  if (!updatedGroup) {
    res.status(400);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedGroup);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).send("Field missing to add user");
  }

  // only admin can rename the groupname

  const userAddedByAdmin = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  ).where({ groupAdmin: { $eq: req.user } });

  if (!userAddedByAdmin) {
    return res.status(400).send("Only admin can change");
  }

  const updateData = await Chat.findById(chatId).populate([
    { path: "users", select: "-password" },
    { path: "groupAdmin", select: "-password" },
  ]);

  if (!updateData) {
    res.status(400);
    throw new Error("Chat Not Found");
  } else {
    res.json(updateData);
  }
});
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).send("Field missing to remove user");
  }

  // only admin can rename the groupname

  const userRemovedByAdmin = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  ).where({ groupAdmin: { $eq: req.user } });

  if (!userRemovedByAdmin) {
    return res.status(400).send("Only admin can change");
  }

  const updateData = await Chat.findById(chatId).populate([
    { path: "users", select: "-password" },
    { path: "groupAdmin", select: "-password" },
  ]);

  if (!updateData) {
    res.status(400);
    throw new Error("Chat Not Found");
  } else {
    res.json(updateData);
  }
});




module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup
};
