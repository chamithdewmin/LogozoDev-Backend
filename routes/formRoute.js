const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
  sendSms,
  getAllMessages,
  deleteMessage
} = require('../controllers/smsController');

router.post('/send-sms', upload.none(), sendSms);
router.get('/messages', getAllMessages);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
