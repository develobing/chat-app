import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar/Navbar';
import './Chat.scss';

const Chat = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <Navbar />

      <div id="chat-wrap">Data</div>
    </div>
  );
};

export default Chat;
