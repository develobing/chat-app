import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './components/Navbar/Navbar';
import FriendList from './components/FriendList/FriendList';
import Messenger from './components/Messenger/Messenger';
import './Chat.scss';
import useSocket from './hooks/socketConnect';

const Chat = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useSocket(user, dispatch);

  return (
    <div id="chat-container">
      <Navbar />

      <div id="chat-wrap">
        <FriendList />
        <Messenger />
      </div>
    </div>
  );
};

export default Chat;
