import React, { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logout } from '../../../../store/actions/auth';
import './Navbar.scss';
import Modal from '../../../Modal/Modal';
import { updateProfile } from '../../../../store/actions/auth';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [showProfileOptions, setProfileOptions] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [gender, setGender] = useState(user.gender);
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');

  const submitForm = (e) => {
    console.log('submitForm');
    e.preventDefault();

    const form = { firstName, lastName, email, gender, avatar };
    if (password.length > 0) form.password = password;

    const formData = new FormData();

    for (const key in form) {
      formData.append(key, form[key]);
    }

    // Dispatch an action for an update
    dispatch(updateProfile(formData)).then(() => {
      setShowProfileModal(false);
    });
  };

  return (
    <div id="navbar" className="card-shadow">
      <h2>Chat.io</h2>

      <div
        id="profile-menu"
        onClick={() => setProfileOptions(!showProfileOptions)}
      >
        <img src={user.avatar} alt="Avatar" width="40" height="40"></img>

        <p>
          {user.firstName} {user.lastName}
        </p>
        <FontAwesomeIcon icon="caret-down" className="fa-icon" />

        {showProfileOptions && (
          <div id="profile-options">
            <p onClick={() => setShowProfileModal(true)}>Update Profile</p>
            <p onClick={() => dispatch(logout())}>Logout</p>
          </div>
        )}

        {showProfileModal && (
          <Modal onClose={() => setShowProfileModal(false)}>
            <Fragment key="header">
              <h3 className="m-0">Upload Profile</h3>
            </Fragment>

            <Fragment key="body">
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

                <div className="input-field mb-1">
                  <input
                    type="file"
                    onChange={(e) => setAvatar(e.target.files[0])}
                  />
                </div>
              </form>
            </Fragment>

            <Fragment key="footer">
              <button className="btn-success" onClick={submitForm}>
                UPDATE
              </button>
            </Fragment>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Navbar;
