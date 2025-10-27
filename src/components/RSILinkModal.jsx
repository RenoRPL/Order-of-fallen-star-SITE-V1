import React, { useState } from 'react'
import './RSILinkModal.css'

const RSILinkModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [rsiHandle, setRsiHandle] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!rsiHandle.trim() || !agreedToTerms) return
    
    onSubmit(rsiHandle.trim())
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Link Your RSI Account</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="benefits-section">
            <h3>🌟 Benefits of Linking Your RSI Account</h3>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🚀</span>
                <strong>Fleet Integration:</strong> Display your ships in our fleet registry
              </li>
              <li>
                <span className="benefit-icon">🎖️</span>
                <strong>Verification Badge:</strong> Get a verified citizen badge on your profile
              </li>
              <li>
                <span className="benefit-icon">📊</span>
                <strong>Enhanced Stats:</strong> Track UEC earnings and mission progress
              </li>
              <li>
                <span className="benefit-icon">🏆</span>
                <strong>Leaderboards:</strong> Compete in org-wide rankings and achievements
              </li>
              <li>
                <span className="benefit-icon">🎁</span>
                <strong>Exclusive Events:</strong> Access to verified citizen-only operations
              </li>
              <li>
                <span className="benefit-icon">⚡</span>
                <strong>Auto-Sync:</strong> Automatic updates from your RSI profile
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="rsi-form">
            <div className="form-group">
              <label htmlFor="rsiHandle">RSI Handle (Citizen Name)</label>
              <input
                type="text"
                id="rsiHandle"
                value={rsiHandle}
                onChange={(e) => setRsiHandle(e.target.value)}
                placeholder="Enter your RSI handle (e.g., StarCitizen123)"
                className="rsi-input"
                disabled={isLoading}
              />
              <div className="input-help">
                Your RSI handle is your unique identifier in Star Citizen
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                I agree to sync my RSI profile data with Order of the Fallen Star
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!rsiHandle.trim() || !agreedToTerms || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Linking Account...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔗</span>
                    Link RSI Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RSILinkModal