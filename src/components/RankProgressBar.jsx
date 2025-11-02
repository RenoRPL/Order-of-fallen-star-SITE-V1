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
  const [showRankTooltip, setShowRankTooltip] = useState(false)
  const [rankTooltipLocked, setRankTooltipLocked] = useState(false)
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

  // Fallback rank requirements when Progress sheet is not available
  const getFallbackRequirements = (currentRank, nextRank) => {
    const rankRequirements = {
      'Serf': { 'Quests Completed': 5, 'Time in Service': 7 },
      'Page': { 'Quests Completed': 10, 'Crusade Completed': 2, 'Time in Service': 30 },
      'Squire': { 'Quests Completed': 20, 'Crusade Completed': 5, 'Pilot Kills': 10, 'Time in Service': 60 },
      'Knight': { 'Quests Completed': 35, 'Crusade Completed': 10, 'Pilot Kills': 25, 'Quests Led': 3, 'Time in Service': 90 },
      'Templar': { 'Quests Completed': 50, 'Crusade Completed': 15, 'Pilot Kills': 50, 'Quests Led': 8, 'Crusade Led': 2, 'Time in Service': 120 },
      'Lord': { 'Quests Completed': 75, 'Crusade Completed': 25, 'Pilot Kills': 100, 'Quests Led': 15, 'Crusade Led': 5, 'Time in Service': 180 },
      'Marshal': { 'Quests Completed': 100, 'Crusade Completed': 40, 'Pilot Kills': 200, 'Quests Led': 25, 'Crusade Led': 10, 'Time in Service': 240 },
      'Commander': { 'Quests Completed': 150, 'Crusade Completed': 60, 'Pilot Kills': 350, 'Quests Led': 40, 'Crusade Led': 15, 'Time in Service': 300 },
      'Lord Commander': { 'Quests Completed': 200, 'Crusade Completed': 80, 'Pilot Kills': 500, 'Quests Led': 60, 'Crusade Led': 25, 'Time in Service': 365 },
      'Chapter Master': { 'Quests Completed': 300, 'Crusade Completed': 120, 'Pilot Kills': 750, 'Quests Led': 100, 'Crusade Led': 40, 'Time in Service': 500 }
    }
    
    return rankRequirements[nextRank] || {}
  }

  // Calculate progress using fallback requirements if Progress sheet data is not available
  const calculateProgressFromSheet = (progressData, stats, memberData) => {
    if (!stats || !memberData) return { progress: 0, requirements: [] }

    let requirements = {}
    
    // Use Progress sheet data if available, otherwise use fallback
    if (progressData) {
      // Original Progress sheet logic (keep existing code)
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
          current: parseInt(memberData['Time in Service']?.replace(/\D/g, '')) || 0,
          label: 'Days in Service'
        }
      ]

      const requirementsArray = []
      let totalRequirements = 0
      let metRequirements = 0

      requirementChecks.forEach(check => {
        const required = parseInt(progressData[check.field]) || 0
        if (required > 0) {
          totalRequirements++
          const isMet = check.current >= required
          if (isMet) metRequirements++
          
          requirementsArray.push({
            label: check.label,
            current: check.current,
            required: required,
            progress: Math.min(100, (check.current / required) * 100),
            met: isMet
          })
        }
      })

      const overallProgress = totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 100
      return { progress: overallProgress, requirements: requirementsArray, metRequirements, totalRequirements }
    } else {
      // Fallback logic using hardcoded requirements
      console.log('Using fallback requirements - Progress sheet not available')
      const fallbackReqs = getFallbackRequirements(currentRank, nextRankData?.['Rank Name'])
      
      const requirementsArray = []
      let totalRequirements = 0
      let metRequirements = 0

      // Get time in service from Member Log (column G)
      const timeInService = memberData['Time in Service'] || '0 days'
      const serviceDays = parseInt(timeInService.replace(/\D/g, '')) || 0

      const statChecks = [
        {
          key: 'Quests Completed',
          current: parseInt(stats.quests) || 0,
          label: 'Quests Completed'
        },
        {
          key: 'Crusade Completed',
          current: parseInt(stats.crusades) || 0,
          label: 'Crusades Completed'
        },
        {
          key: 'Pilot Kills',
          current: parseInt(stats.shipKills) || 0,
          label: 'Pilot Kills'
        },
        {
          key: 'Ground Kills',
          current: parseInt(stats.fpsKills) || 0,
          label: 'Ground Kills'
        },
        {
          key: 'Turret Kills',
          current: parseInt(stats.turretKills) || 0,
          label: 'Turret Kills'
        },
        {
          key: 'Quests Led',
          current: parseInt(stats.ledQuests) || 0,
          label: 'Quests Led'
        },
        {
          key: 'Crusade Led',
          current: parseInt(stats.ledCrusades) || 0,
          label: 'Crusades Led'
        },
        {
          key: 'Time in Service',
          current: serviceDays,
          label: 'Days in Service'
        }
      ]

      statChecks.forEach(check => {
        const required = fallbackReqs[check.key] || 0
        if (required > 0) {
          totalRequirements++
          const isMet = check.current >= required
          if (isMet) metRequirements++
          
          requirementsArray.push({
            label: check.label,
            current: check.current,
            required: required,
            progress: Math.min(100, (check.current / required) * 100),
            met: isMet
          })
        }
      })

      const overallProgress = totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 100
      return { progress: overallProgress, requirements: requirementsArray, metRequirements, totalRequirements }
    }
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

  if (loading || !dataLoaded) {
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
  const { progress: overallProgress, requirements: requirementsBreakdown } = progressResult || { progress: 0, requirements: [] }
  const overallProgressColor = currentTheme.primary

  return (
    <div className="welcome-progress-section" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      position: 'relative',
      pointerEvents: 'auto'
    }}>
      <div className="progress-label">Next Rank Progress</div>
      <div 
        className="welcome-progress-bar-container"
        onMouseEnter={() => !rankTooltipLocked && setShowRankTooltip(true)}
        onMouseLeave={() => !rankTooltipLocked && setShowRankTooltip(false)}
        onClick={() => {
          setRankTooltipLocked(!rankTooltipLocked)
          setShowRankTooltip(true)
        }}
        style={{ 
          position: 'relative',
          cursor: 'help',
          backgroundColor: showRankTooltip ? 'rgba(57, 185, 255, 0.05)' : 'transparent',
          padding: '8px',
          margin: '-8px',
          borderRadius: '8px',
          transition: 'background-color 0.2s ease',
          width: '100%',
          maxWidth: '450px',
          pointerEvents: 'auto'
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
        <span className="next-rank-welcome">{nextRankData?.['Rank Name'] || 'Unknown'}</span>

        {/* Hover/Click Tooltip - Temporarily disabled for testing */}
        {false && (showRankTooltip || rankTooltipLocked) && (
          <div className="requirements-tooltip" style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '12px',
            backgroundColor: 'linear-gradient(135deg, rgba(10, 20, 40, 0.98) 0%, rgba(20, 30, 50, 0.98) 100%)',
            border: '1px solid rgba(57, 185, 255, 0.4)',
            borderRadius: '12px',
            padding: '1.5rem',
            minWidth: '500px',
            maxWidth: '700px',
            width: 'max-content',
            zIndex: 900,
            backdropFilter: 'blur(15px)',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(57, 185, 255, 0.4)',
            fontSize: '0.9rem',
            pointerEvents: 'auto'
          }}>
            {/* Tooltip arrow pointing up */}
            <div style={{
              content: '',
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '8px solid transparent',
              borderBottomColor: 'rgba(57, 185, 255, 0.4)'
            }}></div>
            
            {/* Close button for locked tooltip */}
            {rankTooltipLocked && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setRankTooltipLocked(false)
                  setShowRankTooltip(false)
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                ×
              </button>
            )}
            
            <div className="tooltip-header" style={{
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: '700',
              marginBottom: '1.2rem',
              textAlign: 'center',
              borderBottom: '2px solid rgba(57, 185, 255, 0.3)',
              paddingBottom: '0.8rem',
              textShadow: '0 0 10px rgba(57, 185, 255, 0.5)',
              paddingRight: rankTooltipLocked ? '30px' : '0'
            }}>
              {nextRankData ? `Requirements for ${nextRankData['Rank Name']}` : 'Rank Progress Information'}
              {!rankTooltipLocked && (
                <div style={{
                  fontSize: '0.7rem',
                  color: '#888',
                  fontWeight: '400',
                  marginTop: '4px',
                  textShadow: 'none'
                }}>
                  Click to pin this tooltip
                </div>
              )}
            </div>
            
            {currentProgressData?.['Detail Req'] && (
              <div className="tooltip-step" style={{
                color: '#00ff88',
                marginBottom: '1.2rem',
                fontSize: '0.95em',
                textAlign: 'center',
                fontStyle: 'italic',
                padding: '0.8rem',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 136, 0.2)'
              }}>
                📋 {currentProgressData['Detail Req']}
              </div>
            )}
            
            {requirementsBreakdown && requirementsBreakdown.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.8rem',
                marginBottom: '1rem'
              }}>
                {requirementsBreakdown.map((req, index) => (
                  <div key={index} className={`tooltip-requirement ${req.met ? 'completed' : ''}`} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    backgroundColor: req.met ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: `1px solid ${req.met ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                    transition: 'all 0.2s ease',
                    minHeight: '50px'
                  }}>
                    <span className="req-type" style={{
                      color: req.met ? '#00ff88' : '#39b9ff',
                      fontWeight: '600',
                      flex: 1,
                      fontSize: '0.9rem',
                      marginRight: '1rem'
                    }}>{req.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <span className="req-progress" style={{
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '1rem',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>{req.current}/{req.required}</span>
                      <span className="req-percentage" style={{
                        color: req.met ? '#00ff88' : req.progress >= 50 ? '#ffaa00' : '#ff6b35',
                        fontWeight: '600',
                        minWidth: '55px',
                        textAlign: 'right',
                        fontSize: '0.85rem'
                      }}>({Math.round(req.progress)}%)</span>
                      {req.met && <span className="req-checkmark" style={{ 
                        color: '#00ff88',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        textShadow: '0 0 5px rgba(0, 255, 136, 0.5)',
                        width: '20px',
                        textAlign: 'center'
                      }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(57, 185, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(57, 185, 255, 0.2)',
              textAlign: 'center'
            }}>
              <span style={{
                color: '#39b9ff',
                fontWeight: '700',
                fontSize: '1rem'
              }}>
                Overall Progress: {Math.round(overallProgress)}%
              </span>
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: '#888'
              }}>
                {requirementsBreakdown?.filter(req => req.met).length || 0} of {requirementsBreakdown?.length || 0} requirements completed
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}