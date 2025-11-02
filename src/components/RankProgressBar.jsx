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
  const [dataLoaded, setDataLoaded] = useState(false)

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
      setDataLoaded(true)
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

  // Progress bar color function to match Profile.jsx
  const getProgressBarColors = (customization) => {
    if (!customization?.progressBarTheme) {
      return { primary: '#39b9ff', secondary: '#00ff88' } // Default classic theme
    }

    const theme = customization.progressBarTheme
    
    // If custom theme is selected, use the custom hue
    if (theme === 'custom' && customization.customHue !== undefined) {
      const hue = customization.customHue
      return {
        primary: `hsl(${hue}, 85%, 60%)`,
        secondary: `hsl(${hue + 30}, 80%, 65%)`
      }
    }

    // Predefined themes
    const themes = {
      classic: { primary: '#39b9ff', secondary: '#00ff88' },
      frost: { primary: '#00d4ff', secondary: '#7dd3fc' },
      ocean: { primary: '#0ea5e9', secondary: '#38bdf8' },
      midnight: { primary: '#1e40af', secondary: '#3b82f6' },
      cyan: { primary: '#06b6d4', secondary: '#67e8f9' }
    }

    return themes[theme] || themes.classic
  }

  if (loading || !dataLoaded || !currentProgressData) {
    return (
      <div className="welcome-progress-section">
        <div className="progress-label">Next Rank Progress</div>
        <div className="welcome-progress-bar-container">
          <span className="current-rank-welcome">{currentRank || 'Loading...'}</span>
          <div className="welcome-progress-bar">
            <div 
              className="welcome-progress-fill"
              style={{ 
                width: '0%',
                background: 'linear-gradient(90deg, #39b9ff, #00ff88)'
              }}
            />
          </div>
          <span className="next-rank-welcome">Loading...</span>
        </div>
      </div>
    )
  }

  // Only show max rank if we have loaded data and confirmed no next rank
  if (dataLoaded && !nextRankData) {
    return (
      <div className="welcome-progress-section">
        <div className="progress-label">Max Rank Achieved</div>
        <div className="welcome-progress-bar-container">
          <span className="current-rank-welcome">{currentRank}</span>
          <div className="welcome-progress-bar">
            <div 
              className="welcome-progress-fill"
              style={{ 
                width: '100%',
                background: 'linear-gradient(90deg, #00ff88, #39b9ff)'
              }}
            />
          </div>
          <span className="next-rank-welcome">👑 Max</span>
        </div>
      </div>
    )
  }

  // Calculate progress using the new Progress sheet data
  const progressResult = calculateProgressFromSheet(currentProgressData, currentStats, memberData)
  const { progress: overallProgress, requirements: requirementsBreakdown } = progressResult
  const overallProgressColor = currentTheme.primary

  // Debug logging
  console.log('RankProgressBar Debug:', {
    showTooltip,
    requirementsBreakdown,
    requirementsLength: requirementsBreakdown?.length,
    currentProgressData,
    nextRankData,
    dataLoaded
  })

  return (
    <div className="welcome-progress-section">
      <div className="progress-label">Next Rank Progress</div>
      <div 
        className="welcome-progress-bar-container"
        onMouseEnter={() => {
          console.log('Mouse entered progress bar')
          setShowTooltip(true)
        }}
        onMouseLeave={() => {
          console.log('Mouse left progress bar')
          setShowTooltip(false)
        }}
        style={{ 
          position: 'relative',
          cursor: 'help',
          backgroundColor: showTooltip ? 'rgba(57, 185, 255, 0.1)' : 'transparent',
          padding: '5px',
          margin: '-5px',
          borderRadius: '4px'
        }}
      >
        <span className="current-rank-welcome">{currentRank || 'Unranked'}</span>
        <div className="welcome-progress-bar">
          <div 
            className="welcome-progress-fill"
            style={{ 
              width: `${overallProgress}%`,
              background: (() => {
                const colors = getProgressBarColors(customization)
                return `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
              })()
            }}
          />
        </div>
        <span className="next-rank-welcome">{nextRankData['Rank Name']}</span>

        {/* Hover Tooltip */}
        {showTooltip && (
          <div className="requirements-tooltip" style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-100%)',
            backgroundColor: 'rgba(10, 20, 40, 0.95)',
            border: '1px solid rgba(57, 185, 255, 0.4)',
            borderRadius: '8px',
            padding: '1rem',
            minWidth: '250px',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(57, 185, 255, 0.2)'
          }}>
            {/* Tooltip arrow */}
            <div style={{
              content: '',
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '6px solid transparent',
              borderTopColor: 'rgba(57, 185, 255, 0.4)'
            }}></div>
            
            <div className="tooltip-header" style={{
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.8rem',
              textAlign: 'center',
              borderBottom: '1px solid rgba(57, 185, 255, 0.2)',
              paddingBottom: '0.5rem'
            }}>
              {nextRankData ? `Requirements for ${nextRankData['Rank Name']}` : 'Tooltip Test'}
            </div>
            
            {currentProgressData?.['Detail Req'] && (
              <div className="tooltip-step" style={{
                color: '#00ff88',
                marginBottom: '8px',
                fontSize: '0.85em',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                📋 {currentProgressData['Detail Req']}
              </div>
            )}
            
            {requirementsBreakdown && requirementsBreakdown.length > 0 ? (
              requirementsBreakdown.map((req, index) => (
                <div key={index} className={`tooltip-requirement ${req.met ? 'completed' : ''}`} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <span className="req-type" style={{
                    color: '#39b9ff',
                    fontWeight: '500',
                    flex: 1
                  }}>{req.label}:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="req-progress" style={{
                      color: '#ffffff',
                      fontWeight: '600'
                    }}>{req.current}/{req.required}</span>
                    <span className="req-percentage" style={{
                      color: req.met ? '#00ff88' : '#ffffff',
                      fontWeight: '500',
                      minWidth: '50px',
                      textAlign: 'right'
                    }}>({Math.round(req.progress)}%)</span>
                    {req.met && <span className="req-checkmark" style={{ 
                      color: '#00ff88',
                      fontWeight: 'bold'
                    }}>✓</span>}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#ffffff', textAlign: 'center' }}>
                No requirements data available
                <br />
                <small style={{ color: '#888' }}>
                  Data loaded: {dataLoaded ? 'Yes' : 'No'}<br />
                  Current progress data: {currentProgressData ? 'Yes' : 'No'}<br />
                  Requirements count: {requirementsBreakdown?.length || 0}
                </small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}