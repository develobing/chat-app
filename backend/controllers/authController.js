const User = require('../models').User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/app.js');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user with email
    const user = await User.findOne({
      where: { email },
    });

    // Check if user found
    if (!user) return res.status(404).json({ message: 'User not found!' });

    // Check if password matches
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Incorrect Password' });

    // Generate auth token
    const userWithToken = generateToken(user.get({ raw: true }));
    return res.json(userWithToken);
  } catch (err) {
    console.log('login() - err', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    // Create a new user
    const user = await User.create(req.body);

    // Generate auth token
    const userWithToken = generateToken(user.get({ raw: true }));
    return res.json(userWithToken);
  } catch (err) {
    console.log('register() - err', err);
    return res.status(500).json({ message: err.message });
  }
};

const generateToken = (user) => {
  delete user.password;

  const token = jwt.sign(user, config.appKey, {
    expiresIn: 86400,
  });

  return {
    token,
    ...user,
  };
};
