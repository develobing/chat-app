import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import loginImage from '../../assets/images/login.svg';
import AuthService from '../../services/authService';
import './Auth.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitForm = (e) => {
    e.preventDefault();

    AuthService.login({ email, password }).then((data) =>
      console.log('data', data)
    );
    console.log(email, password);
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
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-field mb-1">
                <input
                  type="password"
                  value={password}
                  placeholder="Password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
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
