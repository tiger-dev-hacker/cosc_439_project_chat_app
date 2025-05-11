const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
/*File sharing*/
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
/*File sharing*/

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    filename: req.body.filename || undefined,
  };

  try {
    var message = await Message.create(newMessage);
    console.log("Message created:", message);

    message = await message.populate("sender", "name pic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage:message._id,  });
    const updatedChat = await Chat.findById(chatId).populate("latestMessage");
    console.log("Updated Chat:", updatedChat);

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/*File sharing WORKING*/
const uploadDocument = asyncHandler(async (req, res) => {
  console.log("upload document called");
  try {
    const file = req.file;

    if (!file || !file.path) {
      console.log("No file received:", file);
      return res.status(400).json({ error: "Upload failed" });
    }

    console.log("Cloudinary Upload Success:", file);

    const cloudinaryDownloadUrl = `https://res.cloudinary.com/${cloudinary.config().cloud_name}/raw/upload/fl_attachment/${file.filename}`;

    res.status(200).json({
      message: "File uploaded to Cloudinary",
      fileUrl: cloudinaryDownloadUrl,
      originalname: file.originalname,
    });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});
/*File sharing WORKING*/

const downloadDocument = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "uploads", filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");
  res.download(filePath, filename);
});

module.exports = {
  sendMessage,
  allMessages,
  /*file sharing*/
  uploadDocument,
  downloadDocument,
  /*file sharing*/
};