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

  // Generate rank icon URL
  const getRankIconUrl = (participant) => {
    const rank = participant.rank
    if (!rank || rank === 'Unknown') {
      return '/Ranks/Page.png' // Default rank icon
    }
    
    // Map rank names to icon filenames
    const rankIconMap = {
      'Primarch': 'Primarch.png',
      'Chapter Master': 'Chapter Master.png',
      'Lord Commander': 'Lord Commander.png',
      'Commander': 'Commander.png',
      'Marshal': 'Marshal.png',
      'Lord': 'Lord.png',
      'Templar': 'Templar.png',
      'Knight': 'Knight.png',
      'Squire': 'Squire.png',
      'Page': 'Page.png',
      'Serf': 'Serf.png'
    }
    
    const iconFilename = rankIconMap[rank] || 'Page.png'
    return `/Ranks/${iconFilename}`
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
                src={getRankIconUrl(participant)} 
                alt={`${participant.rank} rank`}
                onError={(e) => {
                  e.target.src = '/Ranks/Page.png' // Fallback to Page rank
                }}
              />
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