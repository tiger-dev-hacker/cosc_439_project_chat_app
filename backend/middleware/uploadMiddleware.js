/*File sharing WORKING*/
require("dotenv").config(); 
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

console.log(".env check:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "yes" : "nope",
});
//test

cloudinary.config({
  cloud_name: "de9fgwot4",
  api_key: "844159415199493",
  api_secret: "TJmL9T8iMcAwuXxyOZDQ5xg5RVk",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-files",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

module.exports = { upload };
