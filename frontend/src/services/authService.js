import API from './api.js';

const AuthService = {
  login: async (data) => {
    return API.post('/login', data)
      .then(({ data }) => {
        API.defaults.headers['Authorization'] = `Bearer ${data.token}`;
        return data;
      })
      .catch((err) => {
        console.log('Auth service err', err);
        throw err;
      });
  },

  register: async (data) => {},

  logout: async () => {},
};

export default AuthService;
