import React from 'react'
import './BackstoryModal.css'

const BackstoryModal = ({ 
  isOpen, 
  onClose, 
  playerName, 
  playerRole,
  backstory, 
  pathImage, 
  formatBackstoryText 
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="backstory-modal-overlay" onClick={handleBackdropClick}>
      <div 
        className="backstory-modal-container"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backgroundImage: 'none'
        }}
      >
        <button className="backstory-modal-close" onClick={onClose}>
          ✕
        </button>
        
        {/* Full width hero image at top */}
        {pathImage && (
          <div className="backstory-hero-image-container">
            <img 
              src={pathImage} 
              alt="Role Hero" 
              className="backstory-hero-image"
            />
          </div>
        )}
        
        <div className="backstory-modal-content">
          <div className="backstory-modal-header">
            <h2 className="backstory-modal-title">{playerName}</h2>
          </div>
          
          <div className="backstory-modal-text">
            {formatBackstoryText ? formatBackstoryText(backstory) : (
              <div className="backstory-content">
                {backstory?.split(/\n\s*\n/).filter(p => p.trim()).map((paragraph, index) => (
                  <p key={index} className="backstory-paragraph">
                    {paragraph.split('\n').map((line, lineIndex) => (
                      <React.Fragment key={lineIndex}>
                        {line}
                        {lineIndex < paragraph.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                ))}
              </div>
            )}
            
            {/* Signature at bottom */}
            {playerName && playerRole && (
              <div className="backstory-signature">
                {playerName} - {playerRole}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackstoryModal