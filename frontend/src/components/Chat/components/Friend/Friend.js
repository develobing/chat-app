import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userStatus } from '../../../../utils/helpers';
import './Friend.scss';

const Friend = ({ chat, click }) => {
  const currentChat = useSelector((state) => state.chat.currentChat);
  const listClassName = currentChat.id === chat.id ? 'opened' : '';

  const getLastMessage = () => {
    if (chat?.Messages?.lengt === 0) return '';

    const message = chat?.Messages[chat?.Messages?.length - 1] || {};
    return message.type === 'image' ? 'image uploaded' : message.message;
  };

  return (
    <div className={`friend-list ${listClassName}`} onClick={click}>
      <div>
        <img src={chat?.Users?.[0]?.avatar} alt="" width="40" height="40" />

        <div className="friend-info">
          <h4 className="m-0">
            {chat?.Users?.[0].firstName} {chat.Users?.[0].lastName}
          </h4>
          <h5 className="m-0">{getLastMessage()}</h5>
        </div>
      </div>

      <div className="friend-status">
        <span className={`online-status ${userStatus(chat.Users?.[0])}`}></span>
      </div>
    </div>
  );
};

export default Friend;
