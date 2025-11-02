import React, { useEffect, useRef } from 'react'
import './QuestParticipantsTooltip.css'

const QuestParticipantsTooltip = ({ 
  participants, 
  questName, 
  isVisible, 
  position, 
  isLocked, 
  onClose,
  onToggleLock 
}) => {
  const tooltipRef = useRef(null)

  // Handle outside clicks when locked
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLocked && tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isLocked) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isLocked, onClose])

  if (!isVisible || !participants || participants.length === 0) {
    return null
  }

  // Generate Discord avatar URL
  const getDiscordAvatarUrl = (participant) => {
    const userId = participant.discordId
    const avatarHash = participant.avatar
    
    if (!avatarHash || !userId) {
      // Default Discord avatar based on user ID
      const defaultAvatar = userId ? (parseInt(userId) % 5) : 0
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=64`
  }

  return (
    <div 
      ref={tooltipRef}
      className={`quest-participants-tooltip ${isLocked ? 'locked' : ''}`}
      style={{
        left: position.x + 10,
        top: position.y - 10,
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!isLocked) {
          onToggleLock()
        }
      }}
    >
      <div className="tooltip-header">
        <div className="tooltip-title">
          <h4>Quest Participants</h4>
          {isLocked && (
            <button 
              className="close-button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              aria-label="Close tooltip"
            >
              ×
            </button>
          )}
        </div>
        <p className="quest-name">{questName}</p>
        {!isLocked && (
          <p className="click-hint">Click to lock and scroll</p>
        )}
      </div>
      
      <div className="participants-list">
        {participants.map((participant, index) => (
          <div key={participant.discordId || index} className="participant-item">
            <div className="participant-avatar">
              <img 
                src={getDiscordAvatarUrl(participant)} 
                alt={participant.name}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div 
                className="avatar-fallback"
                style={{ display: 'none' }}
              >
                {participant.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="participant-info">
              <div className="participant-name">{participant.name}</div>
              <div className="participant-details">
                <span className="participant-rank">{participant.rank}</span>
                <span className="participant-role">{participant.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {participants.length === 0 && (
        <div className="no-participants">
          No participants found
        </div>
      )}
    </div>
  )
}

export default QuestParticipantsTooltip