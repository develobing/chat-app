const express = require('express');
const router = express.Router();
const { update, search } = require('../controllers/userController');
const { rules: updateRules } = require('../validators/user/update');
const { validate } = require('../validators');
const { auth } = require('../middlewares/auth');
const { userFile } = require('../middlewares/fileUpload');

router.get('/search-users', auth, search);
router.post('/update', auth, userFile, updateRules, validate, update);

module.exports = router;
