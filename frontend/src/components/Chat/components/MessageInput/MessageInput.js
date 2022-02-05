import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './MessageInput.scss';
import { useSelector } from 'react-redux';
import chatReducer from '../../../../store/reducers/chat';

const MessageInput = ({ chat }) => {
  const user = useSelector((state) => state.auth.user);

  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');

  const handleMessage = (e) => {
    setMessage(e.target.value);

    // !TODO: notify other users that this user is typing something
  };

  const handleKeyDown = (e, isImgUpload) => {
    if (e.key === 'Enter') {
      sendMessage(isImgUpload);
    }
  };

  const sendMessage = (isImgUpload) => {
    if (message.length < 1 && !isImgUpload) return;

    const msg = {
      type: isImgUpload ? 'image' : 'text',
      fromUserId: user._id,
      toUserId: chat.Users.map((user) => user.id),
      chatId: chat.id,
      message: isImgUpload ? image : message,
    };

    setMessage('');
    setImage('');

    // !TODO: send message with socket
  };

  return (
    <div id="input-container">
      <div id="message-input">
        <input
          type="text"
          placeholder="message..."
          onChange={(e) => handleMessage(e)}
          onKeyDown={(e) => handleKeyDown(e, false)}
        />

        <FontAwesomeIcon icon={['far', 'smile']} className="fa-icon" />
      </div>
    </div>
  );
};

export default MessageInput;
