const User = require('../models').User;
const sequelize = require('sequelize');

exports.update = async (req, res) => {
  if (req.file) {
    req.body.avatar = req.file.filename;
  }

  if (typeof req.body.avatar !== 'undefined' && req.body.avatar.length === 0) {
    delete req.body.avatar;
  }

  try {
    const [rows, result] = await User.update(req.body, {
      where: {
        id: req.user.id,
      },
      returning: true,
      individualHooks: true,
    });

    const user = result[0].get({ raw: true });
    user.avatar = result[0].avatar;
    delete user.password;

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
