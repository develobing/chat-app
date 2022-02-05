import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './MessageInput.scss';
import ChatService from '../../../../services/chatService';
import { Picker } from 'emoji-mart';
import { incrementScroll } from '../../../../store/actions/chat';
import 'emoji-mart/css/emoji-mart.css';

const MessageInput = ({ chat }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const socket = useSelector((state) => state.chat.socket);
  const newMessage = useSelector((state) => state.chat.newMessage);
  const fileUpload = useRef();
  const msgInput = useRef();

  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showNewMessageNotification, setShowNewMessageNotification] =
    useState(false);

  useEffect(() => {
    if (!newMessage.seen && newMessage.chatId === chat.id) {
      const msgBox = document.getElementById('msg-box');
      const { scrollTop, scrollHeight } = msgBox;
      if (scrollTop > scrollHeight * 0.3) {
        dispatch(incrementScroll());
      } else {
        setShowNewMessageNotification(true);
      }
    } else {
      setShowNewMessageNotification(false);
    }
  }, [newMessage, dispatch, chat.id]);

  const handleMessage = (e) => {
    const value = e.target.value;
    setMessage(value);

    const receiver = {
      chatId: chat.id,
      fromUser: user,
      toUser: chat.Users.map((user) => user.id),
    };

    if (value.length === 1) {
      receiver.typing = true;
      socket.emit('typing', receiver);
    } else if (value.length === 0) {
      receiver.typing = false;
      socket.emit('typing', receiver);
    }
  };

  const handleKeyDown = (e, isImgUpload) => {
    if (e.key === 'Enter') {
      sendMessage(isImgUpload);
    }
  };

  const sendMessage = (imageUrl) => {
    const isImgUpload = !!imageUrl;
    if (message.length < 1 && !isImgUpload) return;

    const msg = {
      type: isImgUpload ? 'image' : 'text',
      fromUser: user,
      fromUserId: user.id,
      toUserId: chat.Users.map((user) => user.id),
      chatId: chat.id,
      message: isImgUpload ? imageUrl : message,
    };

    setMessage('');
    setImage('');
    setShowEmoji(false);

    // send message with socket
    socket.emit('message', msg);
  };

  const handleImageUpload = () => {
    const formData = new FormData();
    formData.append('id', chat.id);
    formData.append('image', image);

    ChatService.uploadImage(formData)
      .then(({ url: imageUrl }) => {
        sendMessage(imageUrl);
      })
      .catch((err) => {
        console.log('handleImageUpload() - err', err);
      });
  };

  const selectEmoji = (emoji) => {
    const startPosition = msgInput.current.selectionStart;
    const endPosition = msgInput.current.selectionEnd;
    const emojiLength = emoji.native.length;
    const value = msgInput.current.value;

    setMessage(
      value.substring(0, startPosition) +
        emoji.native +
        value.substring(endPosition, value.length)
    );

    msgInput.current.focus();
    msgInput.current.selectionEnd = endPosition + emojiLength;
  };

  const showNewMessage = () => {
    dispatch(incrementScroll());
    setShowNewMessageNotification(false);
  };

  return (
    <div id="input-container">
      <div id="image-upload-container">
        <div>
          {showNewMessageNotification && (
            <div id="message-notification" onClick={showNewMessage}>
              <FontAwesomeIcon icon="bell" className="fa-icon" />

              <p className="m-0">New message</p>
            </div>
          )}
        </div>

        <div id="image-upload">
          {image && image.name ? (
            <div id="image-details">
              <p className="m-9">{image.name}</p>
              <FontAwesomeIcon
                icon="upload"
                className="fa-icon"
                onClick={handleImageUpload}
              />
              <FontAwesomeIcon
                icon="times"
                className="fa-icon"
                onClick={() => setImage('')}
              />
            </div>
          ) : null}

          <FontAwesomeIcon
            icon={['far', 'image']}
            className="fa-icon"
            onClick={() => fileUpload.current.click()}
          />
        </div>
      </div>

      <div id="message-input">
        <input
          ref={msgInput}
          value={message}
          type="text"
          placeholder="message..."
          onChange={(e) => handleMessage(e)}
          onKeyDown={(e) => handleKeyDown(e, false)}
        />

        <FontAwesomeIcon
          icon={['far', 'smile']}
          className="fa-icon"
          onClick={() => setShowEmoji(!showEmoji)}
        />
      </div>

      <input
        id="chat-image"
        type="file"
        ref={fileUpload}
        onChange={(e) => setImage(e.target.files?.[0])}
      />

      {showEmoji && (
        <Picker
          title="Pick your emoji…"
          emoji="point_up"
          style={{ position: 'absolute', bottom: '20px', right: '20px' }}
          onSelect={selectEmoji}
        />
      )}
    </div>
  );
};

export default MessageInput;
