import AuthService from '../../services/authService';
import { LOGIN, LOGOUT, REGISTER, UPDATE_PROFILE } from '../types';

export const login = (params, history) => (dispatch) => {
  return AuthService.login(params)
    .then((data) => {
      console.log('data', data);
      dispatch({ type: LOGIN, payload: data });
      history.push('/');
    })
    .catch((err) => {
      console.log('err', err);
    });
};

export const logout = () => (dispatch) => {
  AuthService.logout();
  dispatch({ type: LOGOUT });
};

export const register = (params, history) => (dispatch) => {
  return AuthService.register(params)
    .then((data) => {
      dispatch({ type: REGISTER, payload: data });
      history.push('/');
    })
    .catch((err) => {
      console.log('err', err);
    });
};

export const updateProfile = (params) => (dispatch) => {
  return AuthService.updateProfile(params)
    .then((data) => {
      dispatch({ type: UPDATE_PROFILE, payload: data });
    })
    .catch((err) => {
      console.log('err', err);
      throw err;
    });
};
