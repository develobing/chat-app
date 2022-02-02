const models = require('../models');
const User = models.User;
const Chat = models.Chat;
const ChatUser = models.ChatUser;
const Message = models.Message;
const { Op } = require('sequelize');
const { sequelize } = require('../models');

exports.index = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.user.id,
    },
    include: [
      {
        model: Chat,
        include: [
          {
            model: User,
            where: {
              [Op.not]: {
                id: req.user.id,
              },
            },
          },

          {
            model: Message,
            limit: 20,
            order: [['id', 'DESC']],
          },
        ],
      },
    ],
  });

  return res.json(user.Chats);
};

exports.create = async (req, res) => {
  const { partnerId } = req.body;

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      include: [
        {
          model: Chat,
          where: {
            type: 'dual',
          },
          include: {
            model: ChatUser,
            where: {
              userId: partnerId,
            },
          },
        },
      ],
    });

    if (user && user.Chats.length > 0) {
      return res.status(403).json({
        status: 'Error',
        message: 'Chat with this user already exists',
      });
    }

    const chat = await Chat.create(
      {
        type: 'dual',
      },
      {
        transaction: t,
      }
    );

    await ChatUser.bulkCreate(
      [
        {
          chatId: chat.id,
          userId: req.user.id,
        },
        {
          chatId: chat.id,
          userId: partnerId,
        },
      ],
      { transaction: t }
    );

    await t.commit();

    const newChat = await Chat.findOne({
      where: {
        id: chat.id,
      },

      include: [
        {
          model: User,
          where: {
            [Op.not]: {
              id: req.user.id,
            },
          },
        },

        {
          model: Message,
          // limit: 20,
          // order: [['id', 'DESC']],
        },
      ],
    });

    return res.json(newChat);
  } catch (err) {
    console.log('err', err);
    await t.rollback();
    return res.status(500).json({ status: 'Error', error: err.message });
  }
};

exports.messages = async (req, res) => {
  try {
    const limit = 10;
    const page = req.query.page || 1;
    const offset = page > 1 ? page * limit : 0;

    const messages = await Message.findAndCountAll({
      where: {
        chatId: req.query.id,
      },
      limit,
      offset,
    });

    const totalPages = Math.ceil(messages.count / limit);

    if (page > totalPages) return res.json({ data: { messages: [] } });

    const result = {
      messages: messages.rows,
      pagination: {
        page,
        totalPages,
      },
    };

    return res.json(result);
  } catch (err) {
    console.log('err');
    return res.json({ status: 'Error', error: err.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    await Chat.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.json({
      status: 'Success',
      message: 'Chat deleted successfully',
    });
  } catch (err) {
    console.log('err');
    return res.json({ status: 'Error', error: err.message });
  }
};
