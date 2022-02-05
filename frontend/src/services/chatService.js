import API from './api';

const ChatService = {
  fetchChats: () => {
    return API.get('/chats')
      .then(({ data }) => data)
      .catch((err) => {
        throw err;
      });
  },
};

export default ChatService;
