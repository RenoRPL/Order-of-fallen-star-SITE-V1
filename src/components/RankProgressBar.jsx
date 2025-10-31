import React, { useState, useEffect } from 'react'
import OFSDataService from '../services/ofsDataService'
import './RankProgressBar.css'

export default function RankProgressBar({ 
  currentRank, 
  currentStats, 
  memberData, 
  className = '',
  customization = null
}) {
  const [allRanks, setAllRanks] = useState([])
  const [currentRankData, setCurrentRankData] = useState(null)
  const [nextRankData, setNextRankData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

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

  // Progress bar color themes
  const colorThemes = {
    'classic': {
      primary: '#39b9ff',
      secondary: '#00ff88',
      background: 'rgba(57, 185, 255, 0.1)',
      border: 'rgba(57, 185, 255, 0.3)'
    },
    'frost': {
      primary: '#00d4ff',
      secondary: '#7dd3fc',
      background: 'rgba(0, 212, 255, 0.1)',
      border: 'rgba(0, 212, 255, 0.3)'
    },
    'ocean': {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      background: 'rgba(14, 165, 233, 0.1)',
      border: 'rgba(14, 165, 233, 0.3)'
    },
    'midnight': {
      primary: '#1e40af',
      secondary: '#3b82f6',
      background: 'rgba(30, 64, 175, 0.1)',
      border: 'rgba(30, 64, 175, 0.3)'
    },
    'cyan': {
      primary: '#06b6d4',
      secondary: '#67e8f9',
      background: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)'
    }
  }

  // Get current theme
  const currentTheme = colorThemes[customization?.progressBarTheme || 'classic']

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

  const getRequirementsBreakdown = (requirements, stats, memberData) => {
    if (!requirements || !stats || !memberData) return []

    return requirements.map(requirement => {
      const reqLower = requirement.toLowerCase()
      const numberMatch = requirement.match(/(\d+)/)
      const requiredAmount = numberMatch ? parseInt(numberMatch[1]) : 0
      
      let currentAmount = 0
      let type = ''

      if (reqLower.includes('quest') && reqLower.includes('led')) {
        currentAmount = parseInt(stats.ledQuests) || 0
        type = 'Quests Led'
      } else if (reqLower.includes('quest')) {
        currentAmount = parseInt(stats.quests) || 0
        type = 'Quests Completed'
      } else if (reqLower.includes('crusade') && reqLower.includes('led')) {
        currentAmount = parseInt(stats.ledCrusades) || 0
        type = 'Crusades Led'
      } else if (reqLower.includes('crusade')) {
        currentAmount = parseInt(stats.crusades) || 0
        type = 'Crusades Completed'
      } else if (reqLower.includes('kill') && reqLower.includes('ground')) {
        currentAmount = parseInt(stats.fpsKills) || 0
        type = 'Ground Kills'
      } else if (reqLower.includes('kill') && (reqLower.includes('ship') || reqLower.includes('pilot'))) {
        currentAmount = parseInt(stats.shipKills) || 0
        type = 'Ship Kills'
      } else if (reqLower.includes('kill') && reqLower.includes('turret')) {
        currentAmount = parseInt(stats.turretKills) || 0
        type = 'Turret Kills'
      } else if (reqLower.includes('hour')) {
        currentAmount = parseInt(stats.totalLength) || 0
        type = 'Hours Played'
      } else if (reqLower.includes('month') || reqLower.includes('time')) {
        if (memberData?.['Join Date']) {
          const joinDate = new Date(memberData['Join Date'])
          const now = new Date()
          const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth())
          currentAmount = monthsDiff
        }
        type = 'Months in Service'
      } else {
        type = 'Other'
      }

      return {
        type,
        current: currentAmount,
        required: requiredAmount,
        progress: requiredAmount > 0 ? Math.min(100, (currentAmount / requiredAmount) * 100) : 100
      }
    })
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
  const overallProgressColor = currentTheme.primary
  const requirementsBreakdown = getRequirementsBreakdown(requirements, currentStats, memberData)

  return (
    <div className={`rank-progress-bar-inline ${className}`}>
      {/* Compact Header */}
      <div className="progress-inline-header">
        <div className="rank-progression-compact">
          <span className="current-rank-compact">{currentRank || 'Unranked'}</span>
          <span className="progression-arrow-compact">→</span>
          <span className="next-rank-compact">{nextRankData['Rank Name']}</span>
        </div>
        <span className="progress-percentage-compact">{overallProgress}%</span>
      </div>

      {/* Sleek Progress Bar with Hover */}
      <div 
        className="progress-bar-container"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          '--theme-primary': currentTheme.primary,
          '--theme-secondary': currentTheme.secondary,
          '--theme-background': currentTheme.background,
          '--theme-border': currentTheme.border
        }}
      >
        <div className="sleek-progress-bar">
          <div 
            className="sleek-progress-fill"
            style={{ 
              width: `${overallProgress}%`,
              background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary})`
            }}
          />
        </div>

        {/* Hover Tooltip */}
        {showTooltip && requirementsBreakdown.length > 0 && (
          <div className="requirements-tooltip">
            <div className="tooltip-header">Requirements for {nextRankData['Rank Name']}</div>
            {requirementsBreakdown.map((req, index) => (
              <div key={index} className="tooltip-requirement">
                <span className="req-type">{req.type}:</span>
                <span className="req-progress">{req.current}/{req.required}</span>
                <span className="req-percentage">({Math.round(req.progress)}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}