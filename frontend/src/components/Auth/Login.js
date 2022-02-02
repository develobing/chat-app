import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import loginImage from '../../assets/images/login.svg';
import AuthService from '../../services/authService';
import { login } from '../../store/actions/auth';
import './Auth.scss';

const Login = ({ history }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitForm = (e) => {
    e.preventDefault();

    dispatch(login({ email, password }, history));
  };

  return (
    <div id="auth-container">
      <div id="auth-card">
        <div>
          <div id="image-section">
            <img src={loginImage} alt="login" />
          </div>

          <div id="form-section">
            <h2>Welcome back</h2>

            <form onSubmit={submitForm}>
              <div className="input-field mb-1">
                <input
                  type="text"
                  value={email}
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-field mb-1">
                <input
                  type="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button>LOGIN</button>
            </form>

            <p>
              Don't have an account?
              <Link to="/register"> Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
