const socketIO = require('socket.io');
const { sequelize } = require('../models');
const Message = require('../models').Message;

const users = new Map(); // Socket Info for a particular user
const userSockets = new Map(); // User Id in each socket

const SocketServer = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionSuccessStatus: 204,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', async (user) => {
      let sockets = [];

      if (users.has(user.id)) {
        const existingUser = users.get(user.id);
        existingUser.sockets = [...existingUser.sockets, ...[socket.id]];
        users.set(user.id, existingUser);
        sockets = [...existingUser.sockets, ...[socket.id]];
        userSockets.set(socket.id, user.id);
      } else {
        users.set(user.id, { id: user.id, sockets: [socket.id] });
        sockets.push(socket.id);
        userSockets.set(socket.id, user.id);
      }

      const onlineFriends = []; // ids
      const chatters = await getChatters(user.id); // query

      // Notify his friends that user is now online
      for (let i = 0; i < chatters.length; i++) {
        if (users.has(chatters[i])) {
          const chatter = users.get(chatters[i]);
          chatter.sockets.forEach((socket) => {
            try {
              io.to(socket).emit('online', user);
            } catch (err) {
              console.log('err', err);
            }
          });

          onlineFriends.push(chatter.id);
        }
      }

      // Send to user sockets which of friends are online
      sockets.forEach((socket) => {
        try {
          io.to(socket).emit('friends', onlineFriends);
        } catch (err) {
          console.log('err', err);
        }
      });
    });

    socket.on('message', async (message) => {
      let sockets = [];

      if (users.has(message.fromUser.id)) {
        sockets = users.get(message.fromUser.id).sockets;
      }

      message.toUserId.forEach((id) => {
        if (users.has(id)) {
          sockets = [...sockets, ...users.get(id).sockets];
        }
      });

      try {
        const msg = {
          type: message.type,
          fromUserId: message.fromUser.id,
          chatId: message.chatId,
          message: message.message,
        };

        const savedMessage = await Message.create(msg);

        message.id = savedMessage.id;
        message.message = savedMessage.message;
        message.User = message.fromUser;
        message.fromUserId = message.fromUser.id;
        delete message.fromUser;

        sockets.forEach((socket) => {
          io.to(socket).emit('received', message);
        });
      } catch (err) {
        console.log('err', err);
      }
    });

    socket.on('typing', (message) => {
      const toUsers = message.toUser || [];

      toUsers.forEach((id) => {
        if (users.has(id)) {
          const sockets = users.get(id).sockets;
          sockets.forEach((socket) => {
            io.to(socket).emit('typing', message);
          });
        }
      });
    });

    socket.on('add-friend', (chats) => {
      try {
        let status = 'offline';
        if (users.has(chats[1].Users[0].id)) {
          status = 'online';
          chats[0].Users[0].status = status;
          users.get(chats[1].Users[0].id).sockets.forEach((socket) => {
            io.to(socket).emit('new-chat', chats[0]);
          });
        }

        if (users.has(chats[0].Users[0].id)) {
          chats[1].Users[0].status = status;
          users.get(chats[0].Users[0].id).sockets.forEach((socket) => {
            io.to(socket).emit('new-chat', chats[1]);
          });
        }
      } catch (err) {
        console.log('add-freind - err', err);
      }
    });

    socket.on('add-user-to-group', ({ chat, newChatter }) => {
      try {
        if (users.has(newChatter.id)) {
          newChatter.status = 'online';
        }

        // To old users
        chat.Users.forEach((user, index) => {
          if (users.has(user.id)) {
            chat.Users[index].status = 'online';

            users.get(user.id).sockets.forEach((socket) => {
              try {
                io.to(socket).emit('added-user-to-group', {
                  chat,
                  chatters: [newChatter],
                });
              } catch (err) {
                console.log('err', err);
              }
            });
          }
        });

        // To new chatter
        if (users.has(newChatter.id)) {
          users.get(newChatter.id).sockets.forEach((socket) => {
            try {
              io.to(socket).emit('added-user-to-group', {
                chat,
                chatters: chat.Users,
              });
            } catch (err) {
              console.log('err', err);
            }
          });
        }
      } catch (err) {
        console.log('add-user-to-group - err', err);
      }
    });

    socket.on('leave-current-chat', (data) => {
      const { chatId, userId, currentUserId, notifyUsers } = data;
      console.log('data', data);

      notifyUsers.forEach((id) => {
        if (users.has(id)) {
          users.get(id).sockets.forEach((socket) => {
            try {
              io.to(socket).emit('remove-user-from-chat', {
                chatId,
                userId,
                currentUserId,
              });
            } catch (err) {
              console.log('leave-current-chat - err', err);
            }
          });
        }
      });
    });

    socket.on('delete-chat', (data) => {
      const { chatId, notifyUsers } = data;
      notifyUsers.forEach((id) => {
        if (users.has(id)) {
          users.get(id).sockets.forEach((socket) => {
            try {
              io.to(socket).emit('delete-chat', parseInt(chatId));
            } catch (err) {
              console.log('delete-chat - err', err);
            }
          });
        }
      });
    });

    socket.on('disconnect', async () => {
      if (userSockets.has(socket.id)) {
        const user = users.get(userSockets.get(socket.id));

        if (user && user.sockets.length > 1) {
          user.sockets = user.sockets.filter((sock) => {
            if (sock != socket.id) return true;

            userSockets.delete(sock);
            return false;
          });

          users.set(user.id, user);
        } else {
          const chatters = await getChatters(user.id);

          // Notify his friends that user is now offline
          for (let i = 0; i < chatters.length; i++) {
            if (users.has(chatters[i])) {
              // const chatter = users.get(chatters[i]);
              users.get(chatters[i]).sockets.forEach((socket) => {
                try {
                  io.to(socket).emit('offline', user);
                } catch (err) {
                  console.log('err', err);
                }
              });
            }
          }

          userSockets.delete(socket.id);
          users.delete(user.id);
        }
      }
    });
  });
};

// Find friends who is chatting with the user
const getChatters = async (userId) => {
  try {
    const [results, metadata] = await sequelize.query(`
      SELECT "cu"."userId" FROM "ChatUsers" AS "cu"
        INNER JOIN (
          SELECT "c"."id" FROM "Chats" AS "c"
          WHERE EXISTS (
            SELECT "u"."id" FROM "Users" AS "u"
              INNER JOIN "ChatUsers" ON "u"."id" = "ChatUsers"."userId"
            WHERE "u"."id" = ${parseInt(
              userId
            )} AND "c"."id" = "ChatUsers"."chatId"
          )
        ) AS cjoin ON cjoin.id = "cu"."chatId"
      WHERE "cu"."userId" != ${parseInt(userId)}
    `);

    return results.length > 0 ? results.map((el) => el.userId) : [];
  } catch (err) {
    console.log('getChatters() -  err', err);
    return [];
  }
};

module.exports = SocketServer;
