import React, { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentChat } from '../../../../store/actions/chat';
import Friend from '../Friend/Friend';
import Modal from '../../../Modal/Modal';
import './FriendList.scss';
import ChatService from '../../../../services/chatService';

const FriendList = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const socket = useSelector((state) => state.chat.socket);

  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const openChat = (chat) => {
    dispatch(setCurrentChat(chat));
  };

  const searchFriends = (e) => {
    ChatService.searchUsers(e.target.value).then((res) => {
      const users = res.users;
      setSuggestions(users);
    });
  };

  const addNewFriend = (id) => {
    ChatService.createChat(id)
      .then((chats) => {
        socket.emit('add-friend', chats);
        setShowFriendsModal(false);
      })
      .catch((err) => {
        console.log('addNewFriend() - err', err);
      });
  };

  return (
    <div id="friends" className="shadow-light">
      <div id="title">
        <h3 className="m-0">Friends</h3>

        <button onClick={() => setShowFriendsModal(true)}>ADD</button>
      </div>
      <hr />

      <div id="friends-box">
        {chats && chats.length > 0 ? (
          chats.map((chat) => (
            <Friend chat={chat} key={chat.id} click={() => openChat(chat)} />
          ))
        ) : (
          <p id="no-chat">No friends added</p>
        )}
      </div>

      {showFriendsModal && (
        <Modal onClose={() => setShowFriendsModal(false)}>
          <Fragment key="header">
            <h3 className="m-0">Create new chat</h3>
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
    </div>
  );
};

export default FriendList;
