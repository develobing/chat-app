import API from './api.js';

const AuthService = {
  login: async (data) => {
    return API.post('/login', data)
      .then(({ data }) => {
        setHeadersAndStorage(data);
        return data;
      })
      .catch((err) => {
        console.log('Auth service err', err);
        throw err;
      });
  },

  register: async (data) => {
    return API.post('/register', data)
      .then(({ data }) => {
        setHeadersAndStorage(data);
        return data;
      })
      .catch((err) => {
        console.log('Auth service err', err);
        throw err;
      });
  },

  logout: async () => {
    API.defaults.headers['Authorization'] = '';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  updateProfile: async (data) => {
    const headers = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    return API.post('/users/update', data, headers)
      .then(({ data }) => {
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      })
      .catch((err) => {
        console.log('Auth service err', err);
        throw err;
      });
  },
};

const setHeadersAndStorage = ({ user, token }) => {
  API.defaults.headers['Authorization'] = `Bearer ${token}`;
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

export default AuthService;
