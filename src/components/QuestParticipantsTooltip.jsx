import React from 'react'
import './QuestParticipantsTooltip.css'

const QuestParticipantsTooltip = ({ participants, questName, isVisible, position }) => {
  if (!isVisible || !participants || participants.length === 0) {
    return null
  }

  return (
    <div 
      className="quest-participants-tooltip"
      style={{
        left: position.x + 10,
        top: position.y - 10,
      }}
    >
      <div className="tooltip-header">
        <h4>Quest Participants</h4>
        <p className="quest-name">{questName}</p>
      </div>
      
      <div className="participants-list">
        {participants.map((participant, index) => (
          <div key={participant.discordId || index} className="participant-item">
            <div className="participant-avatar">
              {participant.avatar ? (
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div 
                className="avatar-fallback"
                style={{ display: participant.avatar ? 'none' : 'flex' }}
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