import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Message from '../Message/Message.js';
import './MessageBox.scss';

const MessageBox = ({ chat }) => {
  const user = useSelector((state) => state.auth.user);
  const scrollBottom = useSelector((state) => state.chat.scrollBottom);
  const senderTyping = useSelector((state) => state.chat.senderTyping);
  const msgBox = useRef();

  useEffect(() => {
    setTimeout(() => {
      scrollManual(msgBox.current.scrollHeight);
    }, 1);
  }, [scrollBottom]);

  const scrollManual = (value) => {
    msgBox.current.scrollTop = value;
  };

  return (
    <div id="msg-box" ref={msgBox}>
      {chat.Messages.map((message, index) => (
        <Message
          user={user}
          chat={chat}
          message={message}
          index={index}
          key={message.id}
        />
      ))}

      {senderTyping.typing && senderTyping.chatId === chat.id && (
        <div className="message">
          <div className="other-person">
            <p className="m-0">
              {senderTyping.fromUser.firstName} {senderTyping.fromUser.lastName}
              ...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBox;
