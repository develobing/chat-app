const socketIO = require('socket.io');
const { sequelize } = require('../models');

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
