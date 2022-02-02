const express = require('express');
const router = express.Router();
const {
  index,
  create,
  messages,
  deleteChat,
} = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, index);
router.get('/messages', auth, messages);
router.post('/create', auth, create);
router.delete('/:id', auth, deleteChat);

module.exports = router;
