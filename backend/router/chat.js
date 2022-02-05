const express = require('express');
const router = express.Router();
const {
  index,
  create,
  messages,
  deleteChat,
  imageUpload,
} = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');
const { chatFile } = require('../middlewares/fileUpload');

router.get('/', auth, index);
router.get('/messages', auth, messages);
router.post('/create', auth, create);
router.post('/upload-image', auth, chatFile, imageUpload);
router.delete('/:id', auth, deleteChat);

module.exports = router;
