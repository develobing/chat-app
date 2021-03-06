const express = require('express');
const router = express.Router();

router.get('/home', (req, res) => {
  return res.send('Home Screen');
});

router.use('/', require('./auth.js'));
router.use('/users', require('./user.js'));
router.use('/chats', require('./chat.js'));

module.exports = router;
