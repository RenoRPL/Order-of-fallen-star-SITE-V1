import React, { useState } from 'react';
import './RSILinkModal.css';

const RSILinkModal = ({ isOpen, onClose, onVerify, isLoading }) => {
  const [rsiHandle, setRsiHandle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!rsiHandle.trim()) {
      setError('Please enter your RSI handle');
      return;
    }

    setError('');
    onVerify(rsiHandle.trim());
  };

  const handleClose = () => {
    setRsiHandle('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rsi-modal-overlay" onClick={handleClose}>
      <div className="rsi-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rsi-modal-header">
          <h2 className="rsi-modal-title">Link RSI Account</h2>
          <button className="rsi-modal-close" onClick={handleClose}>
            
          </button>
        </div>
        
        <div className="rsi-modal-body">
          <div className="verification-requirements">
            <h3>Verification Requirements</h3>
            <ul className="requirements-list">
              <li>Valid RSI handle or Citizen number</li>
              <li>Active member of Order of the Fallen Star organization</li>
              <li>Verified Discord member in our server</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="rsi-form">
            <div className="form-group">
              <label htmlFor="rsiHandle" className="form-label">
                RSI Handle or Citizen Number
              </label>
              <input
                type="text"
                id="rsiHandle"
                value={rsiHandle}
                onChange={(e) => setRsiHandle(e.target.value)}
                placeholder="Enter your RSI handle"
                className="form-input"
                disabled={isLoading}
              />
              {error && <div className="form-error">{error}</div>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RSILinkModal;
