import React from 'react'
import './BackstoryModal.css'

const BackstoryModal = ({ 
  isOpen, 
  onClose, 
  playerName, 
  backstory, 
  pathImage, 
  customBannerImage,
  formatBackstoryText 
}) => {
  if (!isOpen) return null

  const backgroundImage = customBannerImage || pathImage

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
          backgroundImage: backgroundImage 
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackstoryModal