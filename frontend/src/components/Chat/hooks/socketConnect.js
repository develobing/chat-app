import React, { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import {
  fetchChats,
  offlineFriend,
  onlineFriend,
  onlineFriends,
} from '../../../store/actions/chat';

function useSocket(user, dispatch) {
  useEffect(() => {
    dispatch(fetchChats())
      .then((res) => {
        const socket = socketIOClient.connect('http://localhost:3005');

        socket.emit('join', user);
        socket.on('typing', (user) => {
          console.log('User typing...', user);
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

        console.log('res', res);
      })
      .catch((err) => console.log('err', err));
  });
}

export default useSocket;
