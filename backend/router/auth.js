const express = require('express');
const router = express.Router();
const { validate } = require('../validators');
const { rules: registrationRules } = require('../validators/auth/register');
const { rules: loginRules } = require('../validators/auth/login');
const { login, register } = require('../controllers/authController');

router.post('/login', loginRules, validate, login);
router.post('/register', registrationRules, validate, register);

module.exports = router;
