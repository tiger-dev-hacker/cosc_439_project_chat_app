const express = require('express'); 
const { sendMessage, allMessages, /*file sharing*/ uploadDocument, downloadDocument /*file sharing*/ } = require('../controllers/messageControllers');
const { protect } = require('../middleware/authMiddleware');
/*file sharing*/
const { upload } = require('../middleware/uploadMiddleware');
/*file sharing*/

const router = express.Router();

router.route('/').post(protect, sendMessage)
router.route("/:chatId").get(protect, allMessages);

/*file sharing*/
router.post(
  "/upload-doc",
  protect,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer or Cloudinary error:", err);
        return res.status(500).json({ error: "Upload middleware failed", details: err.message });
      }
      next();
    });
  },
  uploadDocument
);
router.get('/download-doc/:filename', protect, downloadDocument);
/*file sharing*/

module.exports = router; 