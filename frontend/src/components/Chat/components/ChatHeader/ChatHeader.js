import React, { useState, Fragment } from 'react';
import { userStatus } from '../../../../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import Modal from '../../../../components/Modal/Modal';
import ChatService from '../../../../services/chatService';
import './ChatHeader.scss';

const ChatHeader = ({ chat }) => {
  const socket = useSelector((state) => state.chat.socket);

  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showLeaveChatModal, setShowLeaveChatModal] = useState(false);
  const [showDeleteChat, setShowDeleteChat] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const searchFriends = (e) => {
    ChatService.searchUsers(e.target.value).then((res) => {
      const users = res.users;
      setSuggestions(users);
    });
  };

  const addNewFriend = (id) => {
    ChatService.addFriendToGroupChat(id, chat.id)
      .then((data) => {
        socket.emit('add-user-to-group', data);
        setShowAddFriendModal(false);
      })
      .catch((err) => {
        console.log('addNewFriend() - err', err);
      });
  };

  const leaveChat = () => {
    ChatService.leaveCurrentChat(chat.id)
      .then((data) => {
        socket.emit('leave-current-chat', data);
      })
      .catch((err) => {
        console.log('leaveChat() - err', err);
      });
  };

  const deleteChat = () => {
    ChatService.deleteCurrentChat(chat.id)
      .then((data) => {
        socket.emit('delete-chat', data);
      })
      .catch((err) => {
        console.log('deleteChat() - err', err);
      });
  };

  return (
    <Fragment>
      <div id="chatter">
        {chat?.Users?.map((user) => (
          <div className="chatter-info" key={user.id}>
            <h3>
              {user.firstName} {user.lastName}
            </h3>

            <div className="chatter-status">
              <span className={`online-status ${userStatus(user)}`}>
                {/* {user.status} */}
              </span>
            </div>
          </div>
        ))}
      </div>

      <FontAwesomeIcon
        icon={['fas', 'ellipsis-v']}
        className="fa-icon"
        onClick={() => setShowChatOptions(!showChatOptions)}
      />

      {showChatOptions && (
        <div id="settings">
          <div onClick={() => setShowAddFriendModal(true)}>
            <FontAwesomeIcon icon={['fas', 'user-plus']} className="fa-icon" />

            <p>Add user to chat</p>
          </div>

          {chat.type === 'group' && (
            <div onClick={leaveChat}>
              <FontAwesomeIcon
                icon={['fas', 'sign-out-alt']}
                className="fa-icon"
              />

              <p>Leave chat</p>
            </div>
          )}

          {chat.type === 'dual' && (
            <div onClick={deleteChat}>
              <FontAwesomeIcon icon={['fas', 'trash']} className="fa-icon" />

              <p>Delete Chat</p>
            </div>
          )}
        </div>
      )}

      {showAddFriendModal && (
        <Modal onClose={() => setShowAddFriendModal(false)}>
          <Fragment key="header">
            <h3 className="m-0">Add friend to group chat</h3>
          </Fragment>

          <Fragment key="body">
            <p>Find friends by typing their name below</p>

            <input
              type="text"
              placeholder="Search..."
              onInput={(e) => searchFriends(e)}
            />

            <div id="suggestions">
              {suggestions.map((user) => {
                return (
                  <div className="suggestion" key={user.id}>
                    <p className="m-0">
                      {user.firstName} {user.lastName}
                    </p>

                    <button onClick={() => addNewFriend(user.id)}>ADD</button>
                  </div>
                );
              })}
            </div>
          </Fragment>
        </Modal>
      )}
    </Fragment>
  );
};

export default ChatHeader;
