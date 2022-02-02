const express = require('express');
const router = express.Router();
const { update } = require('../controllers/userController');
const { rules: updateRules } = require('../validators/user/update');
const { validate } = require('../validators');
const { auth } = require('../middlewares/auth');
const { userFile } = require('../middlewares/fileUpload');

router.post('/update', auth, userFile, updateRules, validate, update);

module.exports = router;
