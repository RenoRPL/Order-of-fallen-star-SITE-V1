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
          <h2>RSI Account Verification</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="benefits-section">
            <h3>Verification Requirements</h3>
            <div className="verification-requirements">
              <div className="requirement-item">
                <span className="req-icon"></span>
                <strong>Discord Member:</strong> You must be a verified member of Order of the Fallen Star Discord
              </div>
              <div className="requirement-item">
                <span className="req-icon"></span>
                <strong>RSI Organization:</strong> Your main organization must be "Order of the Fallen Star"
              </div>
              <div className="requirement-item">
                <span className="req-icon"></span>
                <strong>Public Profile:</strong> Your RSI citizen profile must be publicly visible
              </div>
            </div>
            
            <h3>🎁 Verified Citizen Benefits</h3>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🚀</span>
                <strong>Fleet Integration:</strong> Display your real RSI ships in our fleet registry
              </li>
              <li>
                <span className="benefit-icon">🎖️</span>
                <strong>Verification Badge:</strong> Get a verified OFS citizen badge on your profile
              </li>
              <li>
                <span className="benefit-icon">📊</span>
                <strong>Enhanced Stats:</strong> Track real UEC earnings and mission progress
              </li>
              <li>
                <span className="benefit-icon">🏆</span>
                <strong>Leaderboards:</strong> Compete in org-wide rankings with verified data
              </li>
              <li>
                <span className="benefit-icon">🎁</span>
                <strong>Exclusive Events:</strong> Access to verified citizen-only operations
              </li>
              <li>
                <span className="benefit-icon">⚡</span>
                <strong>Real-time Sync:</strong> Live updates from your RSI organization status
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
                placeholder="Enter your RSI handle (e.g., RenoTG)"
                className="rsi-input"
                disabled={isLoading}
              />
              <div className="input-help">
                We'll verify this handle is a member of Order of the Fallen Star organization
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
                I confirm this is my RSI account and I'm a member of Order of the Fallen Star
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
                    Verifying Account...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">�</span>
                    Verify RSI Account
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

