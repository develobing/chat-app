import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Message from '../Message/Message.js';
import { paginateMessages } from '../../../../store/actions/chat.js';
import './MessageBox.scss';

const MessageBox = ({ chat }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const scrollBottom = useSelector((state) => state.chat.scrollBottom);
  const senderTyping = useSelector((state) => state.chat.senderTyping);
  const [scrollUp, setScrollUp] = useState(0);
  const [loading, setLoading] = useState(false);
  const msgBox = useRef();

  useEffect(() => {
    setTimeout(() => {
      scrollManual(Math.ceil(msgBox.current.scrollHeight * 0.1));
    }, 1);
  }, [scrollUp]);

  useEffect(() => {
    const { scrollTop, scrollHeight } = msgBox.current;
    if (senderTyping.typing && scrollTop > scrollHeight * 0.3) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 1);
    }
  }, [senderTyping]);

  useEffect(() => {
    if (!senderTyping.typing) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 1);
    }
  }, [scrollBottom]);

  const scrollManual = (value) => {
    msgBox.current.scrollTop = value;
  };

  const handleInfinitiveScroll = (e) => {
    if (e.target.scrollTop === 0) {
      setLoading(true);

      const pagination = chat.Pagination;
      const page = typeof pagination === 'undefined' ? 1 : pagination.page;

      // dispatch action to get more message(page)
      dispatch(paginateMessages(chat.id, parseInt(page) + 1))
        .then((res) => {
          console.log('res', res);
          if (res) {
            setScrollUp(scrollUp + 1);
          }

          setLoading(false);
        })
        .catch((err) => {
          console.log('handleInfinitiveScroll() - err', err);
          setLoading(false);
        });
    }
  };

  return (
    <div onScroll={handleInfinitiveScroll} id="msg-box" ref={msgBox}>
      {loading && (
        <p className="loader m-0">
          <FontAwesomeIcon icon="spinner" className="fa-spin" />
        </p>
      )}

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
