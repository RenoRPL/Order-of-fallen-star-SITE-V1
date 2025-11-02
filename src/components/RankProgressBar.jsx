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
  const [progressRequirements, setProgressRequirements] = useState([])
  const [currentRankData, setCurrentRankData] = useState(null)
  const [nextRankData, setNextRankData] = useState(null)
  const [currentProgressData, setCurrentProgressData] = useState(null)
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
      const [ranks, progressData] = await Promise.all([
        OFSDataService.getAllRanks(),
        OFSDataService.getProgressRequirements()
      ])
      
      setAllRanks(ranks)
      setProgressRequirements(progressData)

      if (currentRank) {
        // Find current rank info from ranks sheet
        const currentRankInfo = ranks.find(rank => rank['Rank Name'] === currentRank)
        setCurrentRankData(currentRankInfo)

        // Find current rank progress requirements from progress sheet  
        const currentProgressInfo = progressData.find(progress => progress['Rank'] === currentRank)
        setCurrentProgressData(currentProgressInfo)

        // Find next rank in progression based on tier system
        if (currentRankInfo?.Tier) {
          const currentTier = parseInt(currentRankInfo.Tier)
          const nextTier = currentTier - 1 // Lower tier number = higher rank
          
          if (nextTier >= 1) {
            const nextRankInfo = ranks.find(rank => parseInt(rank.Tier) === nextTier)
            setNextRankData(nextRankInfo)
          } else {
            setNextRankData(null) // Already at max rank
          }
        }
      }
    } catch (error) {
      console.error('Error loading rank data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress based on the Progress sheet requirements
  const calculateProgressFromSheet = (progressData, stats, memberData) => {
    if (!progressData || !stats || !memberData) return { progress: 0, requirements: [] }

    const requirements = []
    let totalRequirements = 0
    let metRequirements = 0

    // Get time in service from Member Log (column G)
    const timeInService = memberData['Time in Service'] || '0 days'
    const serviceDays = parseInt(timeInService.replace(/\D/g, '')) || 0

    // Parse each requirement from the Progress sheet
    const requirementChecks = [
      {
        field: 'Crusade/Quest Led Total',
        current: (parseInt(stats.ledQuests) || 0) + (parseInt(stats.ledCrusades) || 0),
        label: 'Total Led (Quests + Crusades)'
      },
      {
        field: 'Crusade Led',  
        current: parseInt(stats.ledCrusades) || 0,
        label: 'Crusades Led'
      },
      {
        field: 'Quests Led',
        current: parseInt(stats.ledQuests) || 0,
        label: 'Quests Led'
      },
      {
        field: 'Pilot Kills',
        current: parseInt(stats.shipKills) || 0,
        label: 'Pilot Kills'
      },
      {
        field: 'Ground Kills',
        current: parseInt(stats.fpsKills) || 0,
        label: 'Ground Kills'
      },
      {
        field: 'Turret Kills',
        current: parseInt(stats.turretKills) || 0,
        label: 'Turret Kills'
      },
      {
        field: 'Crusade/Quest Total',
        current: (parseInt(stats.quests) || 0) + (parseInt(stats.crusades) || 0),
        label: 'Total Completed (Quests + Crusades)'
      },
      {
        field: 'Quests Completed',
        current: parseInt(stats.quests) || 0,
        label: 'Quests Completed'
      },
      {
        field: 'Crusade Completed',
        current: parseInt(stats.crusades) || 0,
        label: 'Crusades Completed'
      },
      {
        field: 'Time in Service',
        current: serviceDays,
        label: 'Days in Service'
      }
    ]

    requirementChecks.forEach(check => {
      const required = parseInt(progressData[check.field]) || 0
      if (required > 0) {
        totalRequirements++
        const isMet = check.current >= required
        if (isMet) metRequirements++
        
        requirements.push({
          label: check.label,
          current: check.current,
          required: required,
          progress: Math.min(100, (check.current / required) * 100),
          met: isMet
        })
      }
    })

    const overallProgress = totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 100
    
    return { progress: overallProgress, requirements, metRequirements, totalRequirements }
  }

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#00ff88'
    if (progress >= 75) return '#39b9ff'
    if (progress >= 50) return '#ffaa00'
    if (progress >= 25) return '#ff6b35'
    return '#ff4757'
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

  // Calculate progress using the new Progress sheet data
  const progressResult = calculateProgressFromSheet(currentProgressData, currentStats, memberData)
  const { progress: overallProgress, requirements: requirementsBreakdown } = progressResult
  const overallProgressColor = currentTheme.primary

  return (
    <div className={`rank-progress-bar-inline ${className}`}>
      {/* Compact Header */}
      <div className="progress-inline-header">
        <div className="rank-progression-compact">
          <span className="current-rank-compact">{currentRank || 'Unranked'}</span>
          <span className="progression-arrow-compact">→</span>
          <span className="next-rank-compact">{nextRankData['Rank Name']}</span>
        </div>
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
            {currentProgressData?.['Detail Req'] && (
              <div className="tooltip-step">
                <span className="step-info">📋 {currentProgressData['Detail Req']}</span>
              </div>
            )}
            {requirementsBreakdown.map((req, index) => (
              <div key={index} className={`tooltip-requirement ${req.met ? 'completed' : ''}`}>
                <span className="req-type">{req.label}:</span>
                <span className="req-progress">{req.current}/{req.required}</span>
                <span className="req-percentage">({Math.round(req.progress)}%)</span>
                {req.met && <span className="req-checkmark">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}