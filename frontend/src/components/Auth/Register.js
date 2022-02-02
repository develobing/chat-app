import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import registerImage from '../../assets/images/register.svg';
import { register } from '../../store/actions/auth';
import './Auth.scss';

const Register = ({ history }) => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('male');
  const [password, setPassword] = useState('');

  const submitForm = (e) => {
    e.preventDefault();

    dispatch(
      register({ firstName, lastName, gender, email, password }, history)
    );
  };

  return (
    <div id="auth-container">
      <div id="auth-card">
        <div>
          <div id="image-section">
            <img src={registerImage} alt="register" />
          </div>

          <div id="form-section">
            <h2>Create an account</h2>

            <form onSubmit={submitForm}>
              <div className="input-field mb-1">
                <input
                  type="text"
                  value={firstName}
                  placeholder="First name"
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="input-field mb-1">
                <input
                  type="text"
                  value={lastName}
                  placeholder="Last name"
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="input-field mb-1">
                <input
                  type="email"
                  value={email}
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-field mb-1">
                <select
                  value={gender}
                  placeholder="gender"
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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

              <button>REGISTER</button>
            </form>

            <p>
              Already have an account?
              <Link to="/login"> Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
