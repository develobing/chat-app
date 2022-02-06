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
  createChat,
  addUserToGroup,
  leaveCurrentChat,
  deleteChat,
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

        socket.on('new-chat', (chat) => {
          console.log('new-chat', chat);
          dispatch(createChat(chat));
        });

        socket.on('added-user-to-group', (group) => {
          console.log('group', group);
          dispatch(addUserToGroup(group));
        });

        socket.on('remove-user-from-chat', (data) => {
          console.log('remove-user-from-chat - data', data);
          data.currentUserId = user.id;
          dispatch(leaveCurrentChat(data));
        });

        socket.on('delete-chat', (chatId) => {
          console.log('delete-chat', chatId);
          dispatch(deleteChat(chatId));
        });

        console.log('res', res);
      })
      .catch((err) => console.log('err', err));
  });
}

export default useSocket;
