import React, { useState, useEffect } from 'react'
import OFSDataService from '../services/ofsDataService'
import './RankProgressBar.css'

export default function RankProgressBar({ 
  currentRank, 
  currentStats, 
  memberData, 
  className = '' 
}) {
  const [allRanks, setAllRanks] = useState([])
  const [currentRankData, setCurrentRankData] = useState(null)
  const [nextRankData, setNextRankData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Define rank order for progression (from lowest to highest)
  const rankOrder = [
    'Serf',
    'Page',
    'Squire',
    'Knight',
    'Templar',
    'Lord',
    'Marshal',
    'Commander',
    'Lord Commander',
    'Chapter Master',
    'Primarch'
  ]

  useEffect(() => {
    loadRankData()
  }, [currentRank])

  const loadRankData = async () => {
    try {
      setLoading(true)
      const ranks = await OFSDataService.getAllRanks()
      setAllRanks(ranks)

      if (currentRank) {
        const currentRankInfo = ranks.find(rank => rank['Rank Name'] === currentRank)
        setCurrentRankData(currentRankInfo)

        // Find next rank in progression
        const currentIndex = rankOrder.indexOf(currentRank)
        if (currentIndex >= 0 && currentIndex < rankOrder.length - 1) {
          const nextRankName = rankOrder[currentIndex + 1]
          const nextRankInfo = ranks.find(rank => rank['Rank Name'] === nextRankName)
          setNextRankData(nextRankInfo)
        } else {
          setNextRankData(null) // Already at max rank
        }
      }
    } catch (error) {
      console.error('Error loading rank data:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseRequirements = (requirementsText) => {
    if (!requirementsText) return []
    
    // Split by common delimiters and clean up
    const requirements = requirementsText
      .split(/[,;\n]/)
      .map(req => req.trim())
      .filter(req => req.length > 0)

    return requirements
  }

  const calculateProgress = (requirement, stats, memberData) => {
    if (!requirement || !stats) return 0

    const reqLower = requirement.toLowerCase()
    
    // Extract numbers from requirement text
    const numberMatch = requirement.match(/(\d+)/)
    const requiredAmount = numberMatch ? parseInt(numberMatch[1]) : 0

    let currentAmount = 0

    // Parse different types of requirements
    if (reqLower.includes('quest') && reqLower.includes('led')) {
      currentAmount = parseInt(stats.ledQuests) || 0
    } else if (reqLower.includes('quest')) {
      currentAmount = parseInt(stats.quests) || 0
    } else if (reqLower.includes('crusade') && reqLower.includes('led')) {
      currentAmount = parseInt(stats.ledCrusades) || 0
    } else if (reqLower.includes('crusade')) {
      currentAmount = parseInt(stats.crusades) || 0
    } else if (reqLower.includes('kill') && reqLower.includes('ground')) {
      currentAmount = parseInt(stats.fpsKills) || 0
    } else if (reqLower.includes('kill') && (reqLower.includes('ship') || reqLower.includes('pilot'))) {
      currentAmount = parseInt(stats.shipKills) || 0
    } else if (reqLower.includes('kill') && reqLower.includes('turret')) {
      currentAmount = parseInt(stats.turretKills) || 0
    } else if (reqLower.includes('hour')) {
      currentAmount = parseInt(stats.totalLength) || 0
    } else if (reqLower.includes('month') || reqLower.includes('time')) {
      // Calculate months in service
      if (memberData?.['Join Date']) {
        const joinDate = new Date(memberData['Join Date'])
        const now = new Date()
        const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth())
        currentAmount = monthsDiff
      }
    }

    if (requiredAmount === 0) return 100 // No specific number requirement
    return Math.min(100, (currentAmount / requiredAmount) * 100)
  }

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#00ff88'
    if (progress >= 75) return '#39b9ff'
    if (progress >= 50) return '#ffaa00'
    if (progress >= 25) return '#ff6b35'
    return '#ff4757'
  }

  const calculateOverallProgress = (requirements, stats, memberData) => {
    if (!requirements || requirements.length === 0) return 0

    const progressValues = requirements.map(requirement => 
      calculateProgress(requirement, stats, memberData)
    )

    const totalProgress = progressValues.reduce((sum, progress) => sum + progress, 0)
    return Math.round(totalProgress / requirements.length)
  }

  if (loading) {
    return (
      <div className={`rank-progress-bar loading ${className}`}>
        <div className="progress-header">
          <h3>Rank Progress</h3>
        </div>
        <div className="loading-spinner">Loading rank requirements...</div>
      </div>
    )
  }

  if (!nextRankData) {
    return (
      <div className={`rank-progress-bar max-rank ${className}`}>
        <div className="progress-header">
          <h3>Rank Progress</h3>
        </div>
        <div className="max-rank-message">
          <span className="rank-icon">👑</span>
          <span>You have reached the highest rank: {currentRank}</span>
        </div>
      </div>
    )
  }

  const requirements = parseRequirements(nextRankData['Requirements'])
  // TESTING: Override progress to 60% for demonstration
  const overallProgress = 60 // calculateOverallProgress(requirements, currentStats, memberData)
  const overallProgressColor = getProgressColor(overallProgress)

  return (
    <div className={`rank-progress-bar ${className}`}>
      <div className="progress-header">
        <h3>Progress to {nextRankData['Rank Name']}</h3>
        <div className="rank-progression">
          <span className="current-rank">{currentRank || 'Unranked'}</span>
          <span className="progression-arrow">→</span>
          <span className="next-rank">{nextRankData['Rank Name']}</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="overall-progress-section">
        <div className="overall-progress-header">
          <span className="overall-progress-label">
            Overall Progress
            {overallProgress >= 100 && <span className="completion-badge">✓ Ready for Promotion!</span>}
          </span>
          <span className="overall-progress-percentage">{overallProgress}%</span>
        </div>
        <div className="overall-progress-bar">
          <div 
            className={`overall-progress-fill ${overallProgress >= 100 ? 'completed' : ''}`}
            style={{ 
              width: `${overallProgress}%`,
              backgroundColor: overallProgressColor,
              boxShadow: `0 0 15px ${overallProgressColor}70, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
            }}
          />
          <div className="overall-progress-glow" style={{ backgroundColor: overallProgressColor }} />
        </div>
      </div>

      <div className="requirements-container">
        {requirements.length > 0 ? (
          requirements.map((requirement, index) => {
            const progress = calculateProgress(requirement, currentStats, memberData)
            const progressColor = getProgressColor(progress)

            return (
              <div key={index} className="requirement-item">
                <div className="requirement-text">
                  {requirement}
                </div>
                <div className="requirement-progress">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: progressColor,
                      boxShadow: `0 0 10px ${progressColor}50`
                    }}
                  />
                  <div className="progress-percentage">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="no-requirements">
            <span>Requirements data not available</span>
          </div>
        )}
      </div>

      {nextRankData['Rank Image'] && (
        <div className="next-rank-preview">
          <img 
            src={`/Ranks/${nextRankData['Rank Name']}.png`}
            alt={`${nextRankData['Rank Name']} insignia`}
            className="next-rank-icon"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}