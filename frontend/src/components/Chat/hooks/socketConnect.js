import React, { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import {
  fetchChats,
  offlineFriend,
  onlineFriend,
  onlineFriends,
  setSocket,
  receivedMessage,
  senderTyping,
} from '../../../store/actions/chat';

function useSocket(user, dispatch) {
  useEffect(() => {
    dispatch(fetchChats())
      .then((res) => {
        const socket = socketIOClient.connect('http://localhost:3005');

        dispatch(setSocket(socket));

        socket.emit('join', user);

        socket.on('typing', (sender) => {
          console.log('sender', sender);
          dispatch(senderTyping(sender));
        });

        socket.on('friends', (friends) => {
          console.log('Friends', friends);
          dispatch(onlineFriends(friends));
        });

        socket.on('online', (user) => {
          console.log('Online', user);
          dispatch(onlineFriend(user));
        });

        socket.on('offline', (user) => {
          console.log('Offline', user);
          dispatch(offlineFriend(user));
        });

        socket.on('received', (message) => {
          console.log('received', message);
          dispatch(receivedMessage(message, user.id));
        });

        console.log('res', res);
      })
      .catch((err) => console.log('err', err));
  });
}

export default useSocket;
