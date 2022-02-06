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
            include: [{ model: User }],
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

    // const newChat = await Chat.findOne({
    //   where: {
    //     id: chat.id,
    //   },

    //   include: [
    //     {
    //       model: User,
    //       where: {
    //         [Op.not]: {
    //           id: req.user.id,
    //         },
    //       },
    //     },

    //     {
    //       model: Message,
    //       // limit: 20,
    //       // order: [['id', 'DESC']],
    //     },
    //   ],
    // });

    const creator = await User.findOne({
      where: {
        id: req.user.id,
      },
    });

    const partner = await User.findOne({
      where: {
        id: partnerId,
      },
    });

    const forCreator = {
      id: chat.id,
      type: 'dual',
      Users: [partner],
      Messages: [],
    };

    const forReceiver = {
      id: chat.id,
      type: 'dual',
      Users: [creator],
      Messages: [],
    };

    return res.json([forCreator, forReceiver]);
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
      include: [{ model: User }],
      limit,
      offset,
      order: [['id', 'DESC']],
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

exports.imageUpload = async (req, res) => {
  if (req.file) {
    return res.json({ url: req.file.filename });
  }

  return res
    .status(500)
    .json({ status: 'Error', error: 'Something went wrong' });
};

exports.addUserToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await Chat.findOne({
      where: {
        id: chatId,
      },
      include: [
        {
          model: User,
        },
        {
          model: Message,
          include: [
            {
              model: User,
            },
          ],
          limit: 20,
          order: [['id', 'DESC']],
        },
      ],
    });

    chat.Messages.reverse();

    // check if the user already in the group
    let isAlreadyJoined = false;
    chat.Users.forEach((user) => {
      isAlreadyJoined = user.id === userId;
    });
    if (isAlreadyJoined)
      return res.status(403).json({
        message: 'User already in the group',
      });

    await ChatUser.create({ chatId, userId });
    const newChatter = await User.findOne({
      where: {
        id: userId,
      },
    });

    // Change the chat type to group
    if (chat.type === 'dual') {
      chat.type = 'group';
      chat.save();
    }

    // return the chat with the new user
    return res.json({ chat, newChatter });
  } catch (err) {
    console.log('addUserToGroup() - err', err);
    return res.status(500).json({ status: 'Error', error: err.message });
  }
};

exports.leaveCurrentChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const chat = await Chat.findOne({
      where: {
        id: chatId,
      },
      include: [
        {
          model: User,
        },
      ],
    });

    if (chat.Users.length === 2) {
      return res.status(403).json({
        status: 'Error',
        message: "You cannot leave this chat when it's a 1 on 1 chat",
      });
    }

    if (chat.Users.length === 3) {
      chat.type = 'dual';
      chat.save();
    }

    await ChatUser.destroy({
      where: {
        chatId,
        userId: req.user.id,
      },
    });

    await Message.destroy({
      where: {
        chatId,
        fromUserId: req.user.id,
      },
    });

    const notifyUsers = chat.Users.map((user) => user.id);

    return res.json({
      chatId: chat.id,
      userId: req.user.id,
      currentUserId: req.user.id,
      notifyUsers,
    });
  } catch (err) {
    console.log('leaveCurrentChat() - err', err);
    return res.status(500).json({ status: 'Error', error: err.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      where: {
        id: chatId,
      },
      include: [{ model: User }],
    });

    const notifyUsers = chat.Users.map((user) => user.id);

    await chat.destroy();

    return res.json({ chatId, notifyUsers });
  } catch (err) {
    console.log('deleteChat() - err', err);
    return res.status(500).json({ status: 'Error', error: err.message });
  }
};
