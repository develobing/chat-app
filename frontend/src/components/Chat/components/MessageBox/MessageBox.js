import React from 'react';
import { useSelector } from 'react-redux';
import Message from '../Message/Message.js';
import './MessageBox.scss';

const MessageBox = ({ chat }) => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div id="msg-box">
      {chat.Messages.map((message, index) => (
        <Message
          user={user}
          chat={chat}
          message={message}
          index={index}
          key={message.id}
        />
      ))}
    </div>
  );
};

export default MessageBox;
