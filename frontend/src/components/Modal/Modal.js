import React from 'react';
import './Modal.scss';

const Modal = (props) => {
  const findByKey = (key) => props.children.find((child) => child.key === key);

  const closeModal = (e) => {
    e.stopPropagation();

    if (e.target.classList.contains('modal-close')) {
      props.onClose();
    }
  };

  return (
    <div className="modal-mask modal-close" onClick={closeModal}>
      <div className="modal-wrapper">
        <div className="modal-container">
          <div className="modal-header">{findByKey('header')}</div>

          <div className="modal-body">{findByKey('body')}</div>

          <div className="modal-footer">
            {findByKey('footer')}

            <button className="modal-close" onClick={closeModal}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
