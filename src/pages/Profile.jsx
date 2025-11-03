import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RSILinkModal from '../components/RSILinkModal'
import EditProfileModal from '../components/EditProfileModal'
import BackstoryModal from '../components/BackstoryModal'
import PlayerSearch from '../components/PlayerSearch'
import QuestParticipantsTooltip from '../components/QuestParticipantsTooltip'
import OFSDataService from '../services/ofsDataService'
import { GoogleSheetsService } from '../services/googleSheetsService'
import './Profile.css'

export default function Profile() {
  const { user, isAuthenticated, logout, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { discordId: urlDiscordId } = useParams() // Get Discord ID from URL parameter
  const [memberData, setMemberData] = useState(null)
  const [allMemberData, setAllMemberData] = useState([])
  const [allRankData, setAllRankData] = useState([])
  const [progressRequirements, setProgressRequirements] = useState([])
  const [patrolData, setPatrolData] = useState([])
  const [patrolStats, setPatrolStats] = useState(null)
  const [rankData, setRankData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Google Sheets stats
  const [googleStats, setGoogleStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const googleSheetsService = new GoogleSheetsService()
  
  // RSI account linking
  const [rsiData, setRsiData] = useState(null)
  const [rsiLoading, setRsiLoading] = useState(false)
  const [showRsiModal, setShowRsiModal] = useState(false)
  const [notification, setNotification] = useState(null)

  // Player search state
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedPlayerData, setSelectedPlayerData] = useState(null)
  const [selectedPlayerPatrolData, setSelectedPlayerPatrolData] = useState([])
  const [selectedPlayerStats, setSelectedPlayerStats] = useState(null)
  const [selectedPlayerGoogleStats, setSelectedPlayerGoogleStats] = useState(null)
  const [selectedPlayerBackstory, setSelectedPlayerBackstory] = useState('')
  const [selectedPlayerShip, setSelectedPlayerShip] = useState('')
  const [isViewingOtherPlayer, setIsViewingOtherPlayer] = useState(false)
  const [selectedPlayerLoading, setSelectedPlayerLoading] = useState(false)
  const [clearPlayerSearch, setClearPlayerSearch] = useState(false)
  const [navigationLocked, setNavigationLocked] = useState(false) // Lock navigation to prevent race conditions

  // Profile editing state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [profileBio, setProfileBio] = useState('')
  const [profileShip, setProfileShip] = useState('')
  const [profileCustomShipImage, setProfileCustomShipImage] = useState('')
  const [profileCustomBannerImage, setProfileCustomBannerImage] = useState('')
  const [profileCustomization, setProfileCustomization] = useState(null)
  const [selectedPlayerCustomization, setSelectedPlayerCustomization] = useState(null)
  const [selectedPlayerCustomShipImage, setSelectedPlayerCustomShipImage] = useState('')
  const [selectedPlayerCustomBannerImage, setSelectedPlayerCustomBannerImage] = useState('')
  const [shipRegistry, setShipRegistry] = useState([])

  // Back story scroll state
  const [showBackstoryJumpToTop, setShowBackstoryJumpToTop] = useState(false)
  const backstoryRef = React.useRef(null)
  
  // Backstory modal state
  const [showBackstoryModal, setShowBackstoryModal] = useState(false)
  
  // Rank progression section toggle state
  const [showRankProgression, setShowRankProgression] = useState(false)

  // Quest participants tooltip state
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipParticipants, setTooltipParticipants] = useState([])
  const [tooltipQuestName, setTooltipQuestName] = useState('')
  const [tooltipLocked, setTooltipLocked] = useState(false)
  const activeQuestRef = React.useRef(null)

  // Get current displayed data (either logged-in user or selected player)
  const currentDisplayData = isViewingOtherPlayer && selectedPlayerData ? selectedPlayerData : memberData
  const currentCustomization = isViewingOtherPlayer && selectedPlayerCustomization ? selectedPlayerCustomization : profileCustomization
  const currentPatrolData = isViewingOtherPlayer && selectedPlayerPatrolData ? selectedPlayerPatrolData : patrolData
  const currentPatrolStats = isViewingOtherPlayer && selectedPlayerStats ? selectedPlayerStats : patrolStats
  const currentGoogleStats = isViewingOtherPlayer && selectedPlayerGoogleStats ? selectedPlayerGoogleStats : googleStats
  
  // Function to get the most recent completed quest from member data
  const getMostRecentQuest = () => {
    if (!currentDisplayData) {
      return null
    }
    
    // Debug: Log available fields to verify column names
    console.log('Available currentDisplayData fields:', Object.keys(currentDisplayData))
    
    // Get quest data directly from Member Log sheet columns
    const questName = currentDisplayData['Most Recent Completed Quest']
    const questLeader = currentDisplayData['Most Recent Quest Leader']
    const questDescription = currentDisplayData['Most Recent Completed Quest Desc']
    
    console.log('Quest data from Member Log:', { questName, questLeader, questDescription })
    
    // Check if quest data exists
    if (!questName || questName.trim() === '') {
      return null
    }
    
    // Determine if current user was the leader
    const currentUserName = currentDisplayData?.['Display Name'] || currentDisplayData?.['Username'] || 'Unknown'
    const isLeader = questLeader === currentUserName
    
    return {
      name: questName,
      description: questDescription || 'No description available',
      leader: questLeader || 'Unknown Leader',
      isLeader: isLeader
    }
  }

  // Function to get the active quest from member data
  const getActiveQuest = () => {
    if (!currentDisplayData) {
      return null
    }
    
    // Get active quest data directly from Member Log sheet columns (W, X, Y)
    const questName = currentDisplayData['Active Quest']
    const questDescription = currentDisplayData['Active Quest Desc']
    const questLeader = currentDisplayData['Active Quest Leader']
    
    console.log('Active quest data from Member Log:', { questName, questDescription, questLeader })
    
    // Check if active quest data exists
    if (!questName || questName.trim() === '') {
      return null
    }
    
    // Determine if current user is the leader
    const currentUserName = currentDisplayData?.['Display Name'] || currentDisplayData?.['Username'] || 'Unknown'
    const isLeader = questLeader === currentUserName
    
    return {
      name: questName,
      description: questDescription || 'No description available',
      leader: questLeader || 'Unknown Leader',
      isLeader: isLeader
    }
  }
  
  // Function to get all participants of a quest by searching through all member data
  const getQuestParticipants = (questName) => {
    if (!questName || !allMemberData || allMemberData.length === 0) {
      return []
    }
    
    // Get the quest leader from the current quest data
    const activeQuest = getActiveQuest()
    const questLeader = activeQuest?.leader
    
    const participants = []
    
    // Search through all member data for anyone with this quest in their Active Quest column
    allMemberData.forEach(member => {
      const memberActiveQuest = member['Active Quest']
      if (memberActiveQuest && memberActiveQuest.trim() === questName.trim()) {
        const memberName = member['Display Name'] || member['Username'] || 'Unknown'
        const discordId = member['User ID'] || null // Use the correct field name from Member Log
        
        const participant = {
          name: memberName,
          rank: member['Rank'] || 'Unknown',
          role: member['Role'] || member['Role Path'] || 'Unknown',
          avatar: member['Avatar'] || null,
          discordId: discordId,
          isLeader: questLeader === memberName
        }
        participants.push(participant)
      }
    })
    
    // Sort participants by rank tier (lowest tier number = highest rank)
    if (allRankData && allRankData.length > 0) {
      participants.sort((a, b) => {
        const rankA = allRankData.find(rank => rank['Rank Name'] === a.rank)
        const rankB = allRankData.find(rank => rank['Rank Name'] === b.rank)
        
        const tierA = rankA ? parseInt(rankA.Tier || 999) : 999
        const tierB = rankB ? parseInt(rankB.Tier || 999) : 999
        
        // Sort by tier (lower tier number = higher rank = appears first)
        if (tierA !== tierB) {
          return tierA - tierB
        }
        
        // If same tier, sort alphabetically by name
        return a.name.localeCompare(b.name)
      })
    }
    
    console.log(`Found ${participants.length} participants for quest "${questName}" (sorted by tier):`, participants)
    return participants
  }

  // Function to get next rank based on Tier system from Google Sheets
  const getNextRankFromTier = (currentRank) => {
    if (!allRankData || allRankData.length === 0 || !currentRank) {
      return null
    }

    // Find current rank data
    const currentRankData = allRankData.find(rank => rank['Rank Name'] === currentRank)
    if (!currentRankData || !currentRankData.Tier) {
      return null
    }

    const currentTier = parseInt(currentRankData.Tier)
    
    // If already at Tier 1 (highest rank), return null
    if (currentTier <= 1) {
      return null
    }

    // Find the rank with the next tier (current tier - 1)
    const nextTier = currentTier - 1
    const nextRankData = allRankData.find(rank => parseInt(rank.Tier) === nextTier)
    
    return nextRankData
  }

  // Function to get progress requirements for a specific rank from Progress sheet
  const getProgressRequirementsForRank = (rankName) => {
    if (!progressRequirements || progressRequirements.length === 0 || !rankName) {
      return null
    }

    console.log('Looking for rank:', rankName)
    console.log('Available progress requirements:', progressRequirements)

    // Find the rank requirements in the Progress sheet
    // Try multiple column name variations
    const requirement = progressRequirements.find(req => 
      req.Rank === rankName || 
      req.rank === rankName ||
      (req['Rank Name'] && req['Rank Name'] === rankName) ||
      // Handle the first column (index 0) which should be the rank name
      Object.values(req)[0] === rankName
    )

    console.log('Found requirement for', rankName, ':', requirement)
    return requirement
  }

  // Function to calculate progress percentage towards next rank
  const calculateRankProgress = (nextRankRequirements, currentUserStats) => {
    if (!nextRankRequirements || !currentUserStats) return 0

    let totalRequirements = 0
    let metRequirements = 0

    // Count requirements from the next rank requirements object
    const checkRequirement = (reqKey, userValue, parseRequired = true) => {
      const requiredValue = parseRequired 
        ? parseInt((nextRankRequirements[reqKey] || '0').toString().replace(/\D/g, '') || 0)
        : nextRankRequirements[reqKey]
      
      if (requiredValue && requiredValue > 0) {
        totalRequirements++
        if (userValue >= requiredValue) {
          metRequirements++
        }
      }
    }

    // Check each type of requirement
    checkRequirement('Time in Service', currentUserStats.timeInServiceDays)
    checkRequirement('Crusade/Quest Led Total', currentUserStats.totalLed)
    checkRequirement('Crusade Led', currentUserStats.crusadesLed)
    checkRequirement('Quests Led', currentUserStats.questsLed)
    checkRequirement('Pilot Kills', currentUserStats.pilotKills)
    checkRequirement('Ground Kills', currentUserStats.fpsKills)
    checkRequirement('Turret Kills', currentUserStats.turretKills)
    checkRequirement('Crusade/Quest Total', currentUserStats.totalCompleted)
    checkRequirement('Quests Completed', currentUserStats.questsCompleted)
    checkRequirement('Crusade Completed', currentUserStats.crusadesCompleted)

    // If no requirements found, return 50% as placeholder
    if (totalRequirements === 0) return 50

    // Calculate percentage
    return Math.round((metRequirements / totalRequirements) * 100)
  }

  // Function to get player's current statistics for requirements comparison
  const getPlayerCurrentStats = () => {
    // Calculate time in service from join date
    const timeInService = currentDisplayData?.['Join Date'] 
      ? OFSDataService.calculateTimeInService(currentDisplayData['Join Date'])
      : '0 days'
    
    // Parse time in service to get days
    const timeInServiceDays = timeInService.includes('days') 
      ? parseInt(timeInService.split(' ')[0]) 
      : timeInService.includes('months') 
        ? parseInt(timeInService.split(' ')[0]) * 30
        : timeInService.includes('years')
          ? parseInt(timeInService.split(' ')[0]) * 365
          : 0

    // Get the current player's Discord ID for matching
    const currentPlayerDiscordId = isViewingOtherPlayer 
      ? selectedPlayerData?.discordId 
      : (currentDisplayData?.discordId || user?.id)

    console.log('Player Discord ID for stats:', currentPlayerDiscordId)
    console.log('Total patrol records:', patrolData.length)

    // Count quests and crusades led from patrol data
    const playerLedPatrols = patrolData.filter(patrol => 
      patrol['Patrol Leader ID'] === currentPlayerDiscordId
    )
    
    console.log('Patrols led by player:', playerLedPatrols.length)

    const questsLed = playerLedPatrols.filter(patrol => 
      patrol['Patrol Type']?.toLowerCase().includes('quest') ||
      patrol['Patrol Name']?.toLowerCase().includes('quest')
    ).length

    const crusadesLed = playerLedPatrols.filter(patrol => 
      patrol['Patrol Type']?.toLowerCase().includes('crusade') ||
      patrol['Patrol Name']?.toLowerCase().includes('crusade')
    ).length

    // Count total completed patrols (participated in)
    const playerPatrols = patrolData.filter(patrol => 
      patrol['Patrol Leader ID'] === currentPlayerDiscordId || 
      patrol['Player ID'] === currentPlayerDiscordId
    )

    console.log('Total patrols participated:', playerPatrols.length)

    const questsCompleted = playerPatrols.filter(patrol => 
      patrol['Patrol Type']?.toLowerCase().includes('quest') ||
      patrol['Patrol Name']?.toLowerCase().includes('quest')
    ).length

    const crusadesCompleted = playerPatrols.filter(patrol => 
      patrol['Patrol Type']?.toLowerCase().includes('crusade') ||
      patrol['Patrol Name']?.toLowerCase().includes('crusade')
    ).length

    console.log('Stats calculated:', { 
      questsLed, 
      crusadesLed, 
      questsCompleted, 
      crusadesCompleted 
    })

    return {
      timeInServiceDays,
      questsLed,
      crusadesLed,
      totalLed: questsLed + crusadesLed,
      questsCompleted,
      crusadesCompleted,
      totalCompleted: questsCompleted + crusadesCompleted,
      fpsKills: parseInt(currentGoogleStats?.fpsKills || 0),
      pilotKills: parseInt(currentGoogleStats?.shipKills || 0),
      turretKills: parseInt(currentGoogleStats?.turretKills || 0)
    }
  }
  
  // Tooltip control functions
  const handleTooltipToggleLock = () => {
    if (!tooltipLocked && activeQuestRef.current) {
      // Calculate position relative to document (not viewport) when locking
      const rect = activeQuestRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      
      setTooltipPosition({ 
        x: rect.right + scrollLeft + 10, 
        y: rect.top + scrollTop 
      })
    }
    setTooltipLocked(prev => !prev)
  }
  
  const handleTooltipClose = () => {
    setShowTooltip(false)
    setTooltipLocked(false)
    setTooltipParticipants([])
    setTooltipQuestName('')
  }
  
  const handleTooltipMouseEnter = (e, activeQuest) => {
    if (!tooltipLocked) {
      const participants = getQuestParticipants(activeQuest.name)
      setTooltipParticipants(participants)
      setTooltipQuestName(activeQuest.name)
      setTooltipPosition({ x: e.clientX, y: e.clientY })
      setShowTooltip(true)
    }
  }
  
  const handleTooltipMouseMove = (e) => {
    if (!tooltipLocked) {
      setTooltipPosition({ x: e.clientX, y: e.clientY })
    }
  }
  
  const handleTooltipMouseLeave = () => {
    if (!tooltipLocked) {
      setShowTooltip(false)
      setTooltipParticipants([])
      setTooltipQuestName('')
    }
  }
  
  // Debug logging for stats display
  console.log('=== PROFILE STATS DEBUG ===');
  console.log('isViewingOtherPlayer:', isViewingOtherPlayer);
  console.log('selectedPlayerGoogleStats:', selectedPlayerGoogleStats);
  console.log('googleStats (own stats):', googleStats);
  console.log('currentGoogleStats (what will be displayed):', currentGoogleStats);
  if (currentGoogleStats) {
    console.log('*** DETAILED CURRENT STATS VALUES ***');
    console.log('fpsKills (Ground Kills):', currentGoogleStats.fpsKills);
    console.log('shipKills (Pilot Kills):', currentGoogleStats.shipKills);
    console.log('totalLength (Total Hours):', currentGoogleStats.totalLength);
    console.log('turretKills (Turret Kills):', currentGoogleStats.turretKills);
    console.log('quests (Quests):', currentGoogleStats.quests);
    console.log('ledQuests (Led Quests):', currentGoogleStats.ledQuests);
    console.log('crusades (Crusades):', currentGoogleStats.crusades);
    console.log('ledCrusades (Led Crusades):', currentGoogleStats.ledCrusades);
  }
  console.log('selectedPlayerLoading:', selectedPlayerLoading);
  console.log('=== END PROFILE STATS DEBUG ===');

  // Load profile data from localStorage and Google Sheets
  useEffect(() => {
    const loadProfileData = async () => {
      // Determine which Discord ID to use: URL parameter or authenticated user
      const targetDiscordId = urlDiscordId || user?.id
      if (!targetDiscordId) return

      // For localhost testing - provide fallback data when APIs aren't available
      if (window.location.hostname === 'localhost') {
        console.log('Localhost detected - setting test profile data')
        
        const testBio = `Order of the Fallen Star — The Path of a Page

In the cold expanse between suns, where wreckage drifts like ghosts of forgotten wars, I found my calling—not in victory, but in silence. I am Oner, and I am a Page of the Order of the Fallen Star. Even the smallest light can cast a shadow across eternity.

Before the Order found me, I was nothing more than a pilot-for-hire—a name on mercenary rosters, a face behind a visor burned by re-entry heat. I flew wherever credits flowed: escort runs, salvage jobs, border patrols, even smuggling when hunger outlasted pride. The stars were vast, but life was small. Out there, survival meant everything; purpose meant nothing.

I thought I understood the void—its silence, its indifference. But then I heard the signal.

It came through the static of a dying comm array, orbiting the bones of a shattered station. At first, it seemed like another distress call—the kind spacers learn to ignore unless there's profit in rescue. But this was different. The transmission wasn't asking for help; it was offering something rarer than credits: meaning.

The voice spoke of the Fallen Star, of light born from collapse, of order emerging from the chaos between worlds. It spoke of Tenets—Duty, Loyalty, and Wisdom—not as commands, but as anchors in the endless drift. For the first time since I'd left atmosphere, I felt something other than the cold: purpose.

I followed the signal to a gathering of ships unlike any fleet I'd seen. No uniform hulls, no corporate insignia—just pilots from every corner of the 'verse, bound by something stronger than contracts. They called themselves the Order of the Fallen Star, and they offered me what no employer ever had: a place to belong.

Wings of the Skyward Flame

I found my faith in flight. The hangars of the Celestial Bastion are temples of steel and fire, where even the hum of a reactor feels like prayer. We Pages train beside veterans whose ships have seen more stars than some worlds know exist.`

        const testShip = 'Aegis Dynamics Avenger Stalker'
        
        setProfileBio(testBio)
        setProfileShip(testShip)
        setProfileCustomShipImage('')
        setProfileCustomBannerImage('')
        
        // Set test memberData with role for localhost
        setMemberData({
          username: 'TestUser',
          role: 'The Guardian', // Test with Guardian role
          discriminator: '1234'
        })
        
        console.log('Test profile data set:', { bio: testBio.length + ' characters', ship: testShip, role: 'The Guardian' })
        return // Skip API calls for localhost
      }

      // Load from localStorage first (for immediate display) - only for authenticated user's own profile
      if (!urlDiscordId && user?.id) {
        const savedProfile = localStorage.getItem(`profile_${user.id}`)
        if (savedProfile) {
          try {
            const { bio, ship, customShipImage, customBannerImage, customization } = JSON.parse(savedProfile)
            setProfileBio(bio || '')
            setProfileShip(ship || '')
            setProfileCustomShipImage(customShipImage || '')
            setProfileCustomBannerImage(customBannerImage || '')
            setProfileCustomization(customization || null)
          } catch (error) {
            console.error('Error loading profile data from localStorage:', error)
          }
        }
      }

      // Also fetch ship selection from Google Sheets (authoritative source)
      try {
        const response = await fetch('/api/update-ship-selection-v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discordId: targetDiscordId,
            action: 'get'
          })
        })

        const result = await response.json()
        if (result.success && result.shipValue) {
          // Convert ship name back to value format for UI consistency
          const shipFromSheets = result.shipValue
          let shipValueForUI = shipFromSheets
          
          console.log('Ship from Google Sheets:', shipFromSheets)
          console.log('Ship registry length:', shipRegistry.length)
          
          // If it's a full name, find the corresponding value
          const matchedShip = shipRegistry.find(ship => 
            ship.fullName === shipFromSheets || ship.value === shipFromSheets
          )
          if (matchedShip) {
            shipValueForUI = matchedShip.value
            console.log('Converted ship to UI value:', shipValueForUI)
          } else {
            console.warn('No matching ship found for:', shipFromSheets, 'Registry length:', shipRegistry.length)
            // If registry is empty, try to use the value as-is (might be already in correct format)
            if (shipRegistry.length === 0) {
              console.log('Ship registry not loaded yet, using value as-is')
              shipValueForUI = shipFromSheets
            }
          }
          
          // Update ship from Google Sheets if it exists
          setProfileShip(shipValueForUI)
          
          // Update localStorage to keep it in sync (only for authenticated user)
          if (!urlDiscordId && user?.id) {
            const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}
            currentProfile.ship = shipValueForUI
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(currentProfile))
          }
        }
      } catch (error) {
        console.error('Error loading ship from Google Sheets:', error)
        // Continue with localStorage data if Google Sheets fetch fails
      }
      
      // Also fetch backstory from Google Sheets (authoritative source)
      try {
        const backstoryResponse = await fetch('/api/update-backstory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discordId: targetDiscordId,
            action: 'get'
          })
        })

        const backstoryResult = await backstoryResponse.json()
        if (backstoryResult.success && backstoryResult.backstory) {
          console.log('Loaded backstory from Google Sheets:', backstoryResult.backstory.length, 'characters')
          
          // Update backstory from Google Sheets if it exists
          setProfileBio(backstoryResult.backstory)
          
          // Update localStorage to keep it in sync (only for authenticated user)
          if (!urlDiscordId && user?.id) {
            const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}
            currentProfile.bio = backstoryResult.backstory
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(currentProfile))
          }
        }
      } catch (error) {
        console.error('Error loading backstory from Google Sheets:', error)
        // Continue with localStorage data if Google Sheets fetch fails
      }

      // Also fetch custom ship image from Google Sheets
      try {
        const customShipImageResponse = await fetch('/api/get-custom-ship-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            discordId: targetDiscordId
          })
        })

        const customShipImageResult = await customShipImageResponse.json()
        console.log('Custom ship image API response:', customShipImageResult)
        
        if (customShipImageResult.success && customShipImageResult.customShipImage) {
          console.log('Loaded custom ship image from Google Sheets:', customShipImageResult.customShipImage)
          
          // Update custom ship image from Google Sheets
          setProfileCustomShipImage(customShipImageResult.customShipImage)
          
          // Update localStorage to keep it in sync (only for authenticated user)
          if (!urlDiscordId && user?.id) {
            const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}
            currentProfile.customShipImage = customShipImageResult.customShipImage
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(currentProfile))
          }
        } else {
          console.log('No custom ship image found in Google Sheets')
          setProfileCustomShipImage('')
        }
      } catch (error) {
        console.error('Error loading custom ship image from Google Sheets:', error)
        // Continue with localStorage data if Google Sheets fetch fails
      }
    }

    loadProfileData()
  }, [user?.id, urlDiscordId])

  // Progress bar color theme function
  const getProgressBarColors = (customization) => {
    // If viewing another player and no customization found, use default
    if (isViewingOtherPlayer && !selectedPlayerCustomization) {
      return { primary: '#39b9ff', secondary: '#00ff88' } // Default classic theme
    }
    
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

  // Profile page theme function
  const getProfileThemeColors = (customization) => {
    if (!customization?.profilePageTheme) {
      return { primary: '#0ea5e9', secondary: '#1e293b', accent: '#39b9ff' } // Default theme
    }

    const theme = customization.profilePageTheme
    
    // If custom theme is selected, use the custom hue
    if (theme === 'custom' && customization.profileCustomHue !== undefined) {
      const hue = customization.profileCustomHue
      return {
        primary: `hsl(${hue}, 85%, 60%)`,
        secondary: `hsl(${hue}, 90%, 8%)`,
        accent: `hsl(${hue}, 80%, 65%)`
      }
    }

    // Predefined themes
    const themes = {
      default: { primary: '#0ea5e9', secondary: '#1e293b', accent: '#39b9ff' },
      crimson: { primary: '#dc2626', secondary: '#450a0a', accent: '#ef4444' },
      emerald: { primary: '#059669', secondary: '#064e3b', accent: '#10b981' },
      violet: { primary: '#7c3aed', secondary: '#2e1065', accent: '#8b5cf6' },
      amber: { primary: '#d97706', secondary: '#451a03', accent: '#f59e0b' },
      rose: { primary: '#e11d48', secondary: '#4c0519', accent: '#f43f5e' }
    }

    return themes[theme] || themes.default
  }

  // Load ship registry for display names
  useEffect(() => {
    const loadShipRegistry = async () => {
      try {
        const ships = await OFSDataService.getShipRegistry()
        console.log('Loaded ships from registry:', ships.length)
        setShipRegistry(ships)
      } catch (error) {
        console.error('Error loading ship registry:', error)
      }
    }
    
    loadShipRegistry()
  }, [])

  // Re-process ship value when ship registry loads
  useEffect(() => {
    if (shipRegistry.length > 0 && profileShip && !user) {
      // Skip if no user or no ship selected
      return
    }
    
    if (shipRegistry.length > 0 && profileShip) {
      // Check if current profileShip is a full name that needs conversion
      const currentShip = shipRegistry.find(ship => ship.value === profileShip)
      if (!currentShip) {
        // Current profileShip might be a full name, try to find by fullName
        const shipByFullName = shipRegistry.find(ship => ship.fullName === profileShip)
        if (shipByFullName) {
          console.log('Converting ship from full name to value:', profileShip, '->', shipByFullName.value)
          setProfileShip(shipByFullName.value)
          
          // Update localStorage
          if (user?.id) {
            const savedProfile = localStorage.getItem(`profile_${user.id}`)
            const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}
            currentProfile.ship = shipByFullName.value
            localStorage.setItem(`profile_${user.id}`, JSON.stringify(currentProfile))
          }
        }
      }
    }
  }, [shipRegistry, profileShip, user?.id])

  // Re-process selected player ship when ship registry loads
  useEffect(() => {
    if (shipRegistry.length > 0 && selectedPlayerShip && isViewingOtherPlayer) {
      const currentShip = shipRegistry.find(ship => ship.value === selectedPlayerShip)
      if (!currentShip) {
        // selectedPlayerShip might be a full name, try to find by fullName  
        const shipByFullName = shipRegistry.find(ship => ship.fullName === selectedPlayerShip)
        if (shipByFullName) {
          console.log('Converting selected player ship from full name to value:', selectedPlayerShip, '->', shipByFullName.value)
          setSelectedPlayerShip(shipByFullName.value)
        }
      }
    }
  }, [shipRegistry, selectedPlayerShip, isViewingOtherPlayer])

  // Apply profile theme colors as CSS custom properties
  useEffect(() => {
    let themeToUse = currentCustomization
    
    // If viewing another player and no customization found, use default theme
    if (isViewingOtherPlayer && !selectedPlayerCustomization) {
      themeToUse = {
        profilePageTheme: 'default',
        profileCustomHue: 220
      }
      console.log('Using default theme for selected player (no customization found)')
    }
    
    const themeColors = getProfileThemeColors(themeToUse)
    const root = document.documentElement
    
    // Apply theme colors as CSS variables
    root.style.setProperty('--profile-primary', themeColors.primary)
    root.style.setProperty('--profile-secondary', themeColors.secondary)
    root.style.setProperty('--profile-accent', themeColors.accent)
    
    // Cleanup function to reset to defaults when component unmounts
    return () => {
      root.style.setProperty('--profile-primary', '#0ea5e9')
      root.style.setProperty('--profile-secondary', '#1e293b')
      root.style.setProperty('--profile-accent', '#39b9ff')
    }
  }, [currentCustomization, isViewingOtherPlayer, selectedPlayerCustomization])

  // Fetch member and patrol data
  useEffect(() => {
    let isCancelled = false // Track if this effect should be cancelled
    
    const fetchData = async () => {
      // Get playerId from URL params or URL route parameter
      const playerId = searchParams.get('playerId') || urlDiscordId
      const targetUserId = playerId || user?.id
      
      if (!targetUserId) return
      
      // If navigation is locked and we're trying to fetch for a different user, skip
      if (navigationLocked && playerId && !isViewingOtherPlayer) {
        console.log('Navigation locked, skipping fetch for:', targetUserId)
        return
      }
      
      // Determine if we're viewing another player
      const viewingOtherPlayer = !!playerId
      
      console.log('=== FETCH DATA DEBUG ===')
      console.log('urlDiscordId:', urlDiscordId)
      console.log('playerId from searchParams:', searchParams.get('playerId'))
      console.log('user?.id:', user?.id)
      console.log('targetUserId:', targetUserId)
      console.log('viewingOtherPlayer:', viewingOtherPlayer)
      console.log('navigationLocked:', navigationLocked)
      console.log('isViewingOtherPlayer:', isViewingOtherPlayer)
      console.log('========================')
      
      // Only update loading state if not cancelled
      if (!isCancelled) {
        setIsLoading(true)
        setError(null)
        setIsViewingOtherPlayer(viewingOtherPlayer)
      }
      
      try {
        // Fetch member data for the target user (either URL param or current user)
        const member = await OFSDataService.getMemberData(targetUserId)
        
        // Check if this effect was cancelled while we were fetching
        if (isCancelled) {
          console.log('Fetch cancelled, ignoring results for:', targetUserId)
          return
        }
        
        console.log('Fetched member data:', member)
        console.log('Member data keys:', member ? Object.keys(member) : 'No member data')
        
        if (member) {
          console.log('Rank field:', member.Rank)
          console.log('Role field:', member.Role)
          console.log('Role Path field:', member['Role Path'])
        }
        
        console.log('Fetched member data:', member) // Debug log
        
        if (playerId) {
          // Check if cancelled before setting other player data
          if (isCancelled) return
          
          // If viewing another player, set their data in the selected player state
          setSelectedPlayerData(member)
          setSelectedPlayer(member) // Set the selected player for PlayerSearch component
          
          // Fetch their patrol data
          const patrols = await OFSDataService.getPatrolData(targetUserId)
          
          // Check if cancelled after patrol data fetch
          if (isCancelled) return
          
          setSelectedPlayerPatrolData(patrols)
          
          // Calculate their patrol stats
          const stats = OFSDataService.formatPatrolStats(patrols)
          setSelectedPlayerStats(stats)
          
          // Fetch selected player's Google Sheets stats
          try {
            console.log('Fetching Google Sheets stats for URL player:', targetUserId)
            const playerGoogleStats = await googleSheetsService.fetchUserStats(targetUserId)
            
            // Check if cancelled after Google stats fetch
            if (isCancelled) return
            
            console.log('URL-based player Google stats:', playerGoogleStats)
            setSelectedPlayerGoogleStats(playerGoogleStats)
            console.log('*** SET selectedPlayerGoogleStats for URL player ***', playerGoogleStats)
          } catch (error) {
            console.log('No Google Sheets stats found for URL player:', error)
            if (!isCancelled) {
              setSelectedPlayerGoogleStats(null)
            }
          }
          
          // Fetch selected player's backstory from Google Sheets
          try {
            console.log('Fetching backstory for player:', targetUserId)
            const backstoryResponse = await fetch('/api/update-backstory', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                discordId: targetUserId,
                action: 'get'
              })
            })
            
            if (backstoryResponse.ok) {
              const backstoryResult = await backstoryResponse.json()
              
              // Check if cancelled after backstory fetch
              if (isCancelled) return
              
              if (backstoryResult.success) {
                setSelectedPlayerBackstory(backstoryResult.backstory || '')
                console.log('Loaded backstory for selected player:', backstoryResult.backstory?.length || 0, 'characters')
              }
            }
          } catch (error) {
            console.log('No backstory found for selected player:', error)
            if (!isCancelled) {
              setSelectedPlayerBackstory('')
            }
          }
          
          // Fetch selected player's ship from Google Sheets
          try {
            console.log('Fetching ship for player:', targetUserId)
            const shipResponse = await fetch('/api/update-ship-selection-v2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                discordId: targetUserId,
                action: 'get'
              })
            })
            
            if (shipResponse.ok) {
              const shipResult = await shipResponse.json()
              
              // Check if cancelled after ship fetch
              if (isCancelled) return
              
              if (shipResult.success && shipResult.shipValue) {
                // Convert ship name to value format for UI consistency
                let shipValueForUI = shipResult.shipValue
                const matchedShip = shipRegistry.find(ship => 
                  ship.fullName === shipResult.shipValue || ship.value === shipResult.shipValue
                )
                if (matchedShip) {
                  shipValueForUI = matchedShip.value
                }
                setSelectedPlayerShip(shipValueForUI)
                console.log('Loaded ship for selected player:', shipResult.shipValue)
              }
            }
          } catch (error) {
            console.log('No ship found for selected player:', error)
            if (!isCancelled) {
              setSelectedPlayerShip('')
            }
          }
          
          // Fetch selected player's custom ship image from Google Sheets
          try {
            console.log('Fetching custom ship image for player:', targetUserId)
            const customShipImageResponse = await fetch('/api/get-custom-ship-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                discordId: targetUserId
              })
            })
            
            if (customShipImageResponse.ok) {
              const customShipImageResult = await customShipImageResponse.json()
              
              // Check if cancelled after custom ship image fetch
              if (isCancelled) return
              
              if (customShipImageResult.success && customShipImageResult.customShipImage) {
                setSelectedPlayerCustomShipImage(customShipImageResult.customShipImage)
                console.log('Loaded custom ship image for selected player:', customShipImageResult.customShipImage)
              } else {
                setSelectedPlayerCustomShipImage('')
              }
            }
          } catch (error) {
            console.log('No custom ship image found for selected player:', error)
            if (!isCancelled) {
              setSelectedPlayerCustomShipImage('')
            }
          }
          
          // Fetch selected player's customization settings
          try {
            // For now, try localStorage (will only work if player used same device)
            const savedProfile = localStorage.getItem(`profile_${targetUserId}`)
            if (savedProfile) {
              const { customization } = JSON.parse(savedProfile)
              setSelectedPlayerCustomization(customization || null)
              console.log('Loaded customization for selected player from localStorage:', customization)
            } else {
              // Set to null so we use default theme
              setSelectedPlayerCustomization(null)
              console.log('No customization found for selected player, using default theme')
            }
          } catch (error) {
            console.log('No customization found for selected player:', error)
            if (!isCancelled) {
              setSelectedPlayerCustomization(null)
            }
          }
          
          // Final check before clearing current user data
          if (isCancelled) return
          
          // Clear current user data to avoid confusion
          setMemberData(null)
          setPatrolData([])
          setPatrolStats(null)
          setRankData(null)
          
        } else {
          // Check if cancelled before setting current user data
          if (isCancelled) return
          
          // Viewing current user - preserve local RSI verification state if it exists
          setMemberData(prevMemberData => {
            const newMemberData = { ...member }
            
            // Check for RSI verification from Google Sheets (columns U and V)
            // Column U should contain "Verified" and Column V should contain RSI handle
            const hasSheetVerification = member && (
              member['Verified'] === 'Verified' || // Column U
              member['RSI User Name'] || // Column V  
              member['RSI_Verified'] === true ||
              member['RSI_Verified'] === 'true' ||
              member['RSI_Verified'] === 'Verified'
            )
            
            if (hasSheetVerification) {
              console.log('Found RSI verification in sheets data:', {
                verified: member['Verified'],
                rsiUserName: member['RSI User Name'],
                rsiVerified: member['RSI_Verified']
              })
              
              newMemberData.RSI_Verified = true
              newMemberData.RSI_Handle = member['RSI User Name'] || member['RSI_Handle']
            }
            
            // If we have local RSI verification data, preserve it (this overrides sheets data)
            if (prevMemberData?.RSI_Verified === true) {
              newMemberData.RSI_Verified = prevMemberData.RSI_Verified
              newMemberData.RSI_Handle = prevMemberData.RSI_Handle
              newMemberData.RSI_Data = prevMemberData.RSI_Data
              newMemberData.RSI_Organization = prevMemberData.RSI_Organization
              newMemberData.RSI_Rank = prevMemberData.RSI_Rank
            }
            
            return newMemberData
          })
          
          // Fetch rank data if member exists
          if (member?.Rank) {
            const rank = await OFSDataService.getRankData(member.Rank)
            setRankData(rank)
          }
          
          // Fetch current user's backstory from Google Sheets
          try {
            console.log('Fetching backstory for current user:', targetUserId)
            const backstoryResponse = await fetch('/api/update-backstory', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                discordId: targetUserId,
                action: 'get'
              })
            })
            
            if (backstoryResponse.ok) {
              const backstoryResult = await backstoryResponse.json()
              if (backstoryResult.success) {
                setProfileBio(backstoryResult.backstory || '')
                console.log('Loaded backstory for current user:', backstoryResult.backstory?.length || 0, 'characters')
              }
            }
          } catch (error) {
            console.log('No backstory found for current user:', error)
            setProfileBio('')
          }
          
          // Fetch current user's ship from Google Sheets
          try {
            console.log('Fetching ship for current user:', targetUserId)
            const shipResponse = await fetch('/api/update-ship-selection-v2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                discordId: targetUserId,
                action: 'get'
              })
            })
            
            if (shipResponse.ok) {
              const shipResult = await shipResponse.json()
              if (shipResult.success && shipResult.shipValue) {
                // Convert ship name to value format for UI consistency
                let shipValueForUI = shipResult.shipValue
                const matchedShip = shipRegistry.find(ship => 
                  ship.fullName === shipResult.shipValue || ship.value === shipResult.shipValue
                )
                if (matchedShip) {
                  shipValueForUI = matchedShip.value
                }
                setProfileShip(shipValueForUI)
                console.log('Loaded ship for current user:', shipResult.shipValue)
              }
            }
          } catch (error) {
            console.log('No ship found for current user:', error)
            setProfileShip('')
          }
          
          // Fetch current user's custom ship image from Google Sheets
          try {
            console.log('Fetching custom ship image for current user:', targetUserId)
            const customShipImageResponse = await fetch('/api/get-custom-ship-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                discordId: targetUserId
              })
            })
            
            if (customShipImageResponse.ok) {
              const customShipImageResult = await customShipImageResponse.json()
              if (customShipImageResult.success && customShipImageResult.customShipImage) {
                setProfileCustomShipImage(customShipImageResult.customShipImage)
                console.log('Loaded custom ship image for current user:', customShipImageResult.customShipImage)
              } else {
                setProfileCustomShipImage('')
              }
            }
          } catch (error) {
            console.log('No custom ship image found for current user:', error)
            setProfileCustomShipImage('')
          }

          // Fetch patrol data
          const patrols = await OFSDataService.getPatrolData(targetUserId)
          setPatrolData(patrols)
          
          // Calculate patrol stats
          const stats = OFSDataService.formatPatrolStats(patrols)
          setPatrolStats(stats)
          
          // Clear selected player data when viewing own profile
          setSelectedPlayerData(null)
          setSelectedPlayer(null)
          setSelectedPlayerPatrolData([])
          setSelectedPlayerStats(null)
          setSelectedPlayerBackstory('')
          setSelectedPlayerShip('')
          setSelectedPlayerCustomShipImage('')
          setSelectedPlayerCustomization(null)
        }
        
        // Fetch all member data for quest participant lookups
        try {
          const allMembers = await OFSDataService.getAllMemberData()
          setAllMemberData(allMembers)
          console.log('Loaded all member data for quest lookups:', allMembers.length, 'members')
        } catch (error) {
          console.error('Error loading all member data:', error)
          setAllMemberData([])
        }
        
        // Fetch all rank data for tier sorting
        try {
          const allRanks = await OFSDataService.getAllRanks()
          setAllRankData(allRanks)
          console.log('Loaded all rank data for tier sorting:', allRanks.length, 'ranks')
        } catch (error) {
          console.error('Error loading all rank data:', error)
          setAllRankData([])
        }

        // Fetch progress requirements data
        try {
          const progressReqs = await OFSDataService.getProgressRequirements()
          setProgressRequirements(progressReqs)
          console.log('Loaded progress requirements:', progressReqs.length, 'ranks')
        } catch (error) {
          console.error('Error loading progress requirements:', error)
          setProgressRequirements([])
        }
        
      } catch (err) {
        console.error('Error fetching OFS data:', err)
        setError('Failed to load organization data')
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }
    
    // Only fetch if we have a target user ID
    const playerId = searchParams.get('playerId') || urlDiscordId
    const targetUserId = playerId || user?.id
    
    if (targetUserId) {
      // If viewing another player (via URL), always fetch regardless of auth state
      // If viewing own profile, only fetch if authenticated OR if user ID exists
      if (playerId || user?.id) {
        console.log('Triggering fetchData for:', targetUserId, 'viewingOther:', !!playerId)
        fetchData()
      }
    }
    
    // Cleanup function to cancel the effect if dependencies change
    return () => {
      isCancelled = true
    }
  }, [urlDiscordId, searchParams, user?.id, navigationLocked]) // Added navigationLocked to dependencies

  // Fetch Google Sheets patrol stats
  useEffect(() => {
    const fetchGoogleStats = async () => {
      // Get playerId from URL params
      const playerId = searchParams.get('playerId')
      const targetUserId = playerId || user?.id
      
      if (!targetUserId) return
      
      setStatsLoading(true)
      try {
        console.log('Fetching Google Sheets stats for user:', targetUserId)
        const stats = await googleSheetsService.fetchUserStats(targetUserId)
        
        if (playerId) {
          // If viewing another player, set their Google stats
          setSelectedPlayerGoogleStats(stats)
          setGoogleStats(null) // Clear current user stats
        } else {
          // If viewing current user
          setGoogleStats(stats)
          setSelectedPlayerGoogleStats(null) // Clear selected player stats
        }
        
        console.log('Profile: Received Google stats:', stats)
      } catch (err) {
        console.error('Error fetching Google Sheets stats:', err)
        if (playerId) {
          setSelectedPlayerGoogleStats(null)
        } else {
          setGoogleStats(null)
        }
      } finally {
        setStatsLoading(false)
      }
    }

    // Only fetch if we have a user ID OR a playerId from URL
    const playerId = searchParams.get('playerId') || urlDiscordId
    if (user?.id || playerId) {
      fetchGoogleStats()
    }
  }, [user?.id, searchParams, urlDiscordId]) // Removed isAuthenticated from dependencies

  // Back story scroll handler
  useEffect(() => {
    const handleBackstoryScroll = () => {
      if (backstoryRef.current) {
        const { scrollTop } = backstoryRef.current
        // Show jump to top link if scrolled down more than 50px
        const shouldShow = scrollTop > 50
        setShowBackstoryJumpToTop(shouldShow)
      }
    }

    const backstoryElement = backstoryRef.current
    if (backstoryElement) {
      backstoryElement.addEventListener('scroll', handleBackstoryScroll)
      return () => {
        backstoryElement.removeEventListener('scroll', handleBackstoryScroll)
      }
    }
  }, [profileBio, selectedPlayerBackstory]) // Re-run when backstory content changes

  // Show loading while authentication is being determined
  if (isAuthLoading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  // Only redirect if not authenticated AND not viewing another player's profile
  if (!isAuthenticated && !urlDiscordId) {
    navigate('/')
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleBackstoryJumpToTop = () => {
    if (backstoryRef.current) {
      backstoryRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  // RSI Account Linking Functions
  const handleRsiLink = async (rsiHandle) => {
    setRsiLoading(true)
    try {
      // Call our real RSI verification service
      const response = await fetch('/.netlify/functions/verify-rsi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsiHandle: rsiHandle,
          discordId: user.id // User's Discord ID from auth context
        })
      })

      const result = await response.json()

      if (response.ok && result.verified) {
        // Success - Real RSI account verified!
        setRsiData(result.rsiProfile)
        
        // Update local member data with real RSI info
        setMemberData(prev => ({
          ...prev,
          RSI_Handle: rsiHandle,
          RSI_Verified: true,
          RSI_Data: result.rsiProfile,
          RSI_Organization: result.rsiProfile.mainOrganization,
          RSI_Rank: result.rsiProfile.organizationRank
        }))
        
        setShowRsiModal(false)
        setNotification({
          type: 'success',
          message: `RSI Account Successfully Verified & Logged! Welcome ${rsiHandle}, ${result.rsiProfile.organizationRank || 'Member'} of Order of the Fallen Star! Your verification has been recorded in our Member Log.`
        })
        
        console.log('RSI Verification Success:', result)
        
      } else {
        // Verification failed
        throw new Error(result.error || 'RSI verification failed')
      }
      
      // Clear notification after 7 seconds for success
      setTimeout(() => setNotification(null), 7000)
      
    } catch (error) {
      console.error('Error verifying RSI account:', error)
      
      let errorMessage = 'Failed to verify RSI account. '
      
      if (error.message.includes('not found')) {
        errorMessage += 'Please check that your RSI handle is spelled correctly.'
      } else if (error.message.includes('not a member')) {
        errorMessage += 'Your RSI account must be a member of Order of the Fallen Star organization.'
      } else if (error.message.includes('Discord member not found')) {
        errorMessage += 'You must be a verified Discord member of Order of the Fallen Star.'
      } else {
        errorMessage += 'Please try again later or contact support.'
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      })
      
      // Clear error notification after 10 seconds
      setTimeout(() => setNotification(null), 10000)
    } finally {
      setRsiLoading(false)
    }
  }

  const openRsiModal = () => {
    setShowRsiModal(true)
  }

  const handlePlayerSelect = async (player) => {
    if (player) {
      console.log('Selected player:', player)
      
      // Close rank progression modal when switching players
      setShowRankProgression(false)
      
      // Get the player's Discord ID
      const playerDiscordId = player['User ID']
      
      if (playerDiscordId) {
        // Lock navigation to prevent race conditions
        setNavigationLocked(true)
        
        // Clear search field first
        setClearPlayerSearch(true)
        
        // Navigate immediately
        console.log('Navigating to player profile:', playerDiscordId)
        navigate(`/profile/${playerDiscordId}`)
        
        // Unlock navigation after a delay to allow data fetching
        setTimeout(() => {
          setNavigationLocked(false)
          setClearPlayerSearch(false)
        }, 3000) // 3 second lock for better stability
        
      } else {
        console.error('No Discord ID found for player:', player)
        setNotification({
          type: 'error',
          message: `Cannot load profile for ${player.Username} - no Discord ID found`
        })
        setTimeout(() => setNotification(null), 3000)
      }
    } else {
      // Deselect player - go back to own profile
      // Close rank progression modal when switching back to own profile
      setShowRankProgression(false)
      
      setNavigationLocked(true)
      setClearPlayerSearch(true)
      
      navigate('/profile')
      
      setTimeout(() => {
        setNavigationLocked(false)
        setClearPlayerSearch(false)
      }, 3000) // 3 second lock for better stability
    }
  }

  const switchBackToOwnProfile = () => {
    // Close rank progression modal when switching back to own profile
    setShowRankProgression(false)
    
    // Navigate back to profile without parameters
    navigate('/profile')
    setIsViewingOtherPlayer(false)
    setClearPlayerSearch(true) // Trigger search field clearing
    setNotification({
      type: 'success',
      message: 'Switched back to your profile'
    })
    setTimeout(() => {
      setNotification(null)
      setClearPlayerSearch(false) // Reset the clear trigger
    }, 100)
  }

  const handleEditProfile = () => {
    setShowEditProfileModal(true)
  }

  const handleSaveProfile = async (profileData) => {
    try {
      // Save to localStorage (for immediate UI update)
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData))
      
      // Update local state
      setProfileBio(profileData.bio)
      setProfileShip(profileData.ship)
      setProfileCustomShipImage(profileData.customShipImage || '')
      setProfileCustomBannerImage(profileData.customBannerImage || '')
      setProfileCustomization(profileData.customization || null)
      
      // Save ship selection to Google Sheets Member Log
      if (user?.id && profileData.ship !== undefined) {
        try {
          // Find the ship in the registry to get the full name
          console.log('Saving ship selection:', {
            selectedShipValue: profileData.ship,
            shipRegistryLength: shipRegistry.length,
            shipRegistry: shipRegistry.slice(0, 3) // Log first 3 ships for debugging
          })
          
          const selectedShip = shipRegistry.find(ship => ship.value === profileData.ship)
          const shipNameToSave = selectedShip ? selectedShip.fullName : profileData.ship
          
          console.log('Ship to save to Google Sheets:', {
            selectedShip,
            shipNameToSave
          })
          
          const response = await fetch('/api/update-ship-selection-v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              discordId: user.id,
              shipValue: shipNameToSave,
              action: 'update'
            })
          })

          console.log('Response status:', response.status, response.statusText)
          
          if (!response.ok) {
            console.error('API request failed:', response.status, response.statusText)
            const errorText = await response.text()
            console.error('Error response body:', errorText)
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          console.log('Google Sheets update response:', result)
          
          if (!result.success) {
            console.warn('Failed to save ship to Google Sheets:', result.message)
            console.warn('Full error response:', result)
          } else {
            console.log('Ship selection saved to Member Log successfully:', result)
          }
        } catch (sheetError) {
          console.error('Error saving ship to Google Sheets:', sheetError)
          console.error('Error details:', {
            message: sheetError.message,
            stack: sheetError.stack
          })
          // Don't fail the entire save operation for sheet errors
        }
      }
      
      // Save backstory to Google Sheets Member Log
      if (user?.id && profileData.bio !== undefined) {
        try {
          console.log('Saving backstory to Google Sheets:', {
            discordId: user.id,
            backstoryLength: profileData.bio?.length || 0
          })
          
          const backstoryResponse = await fetch('/api/update-backstory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              discordId: user.id,
              backstory: profileData.bio,
              action: 'update'
            })
          })

          if (!backstoryResponse.ok) {
            console.error('Backstory API request failed:', backstoryResponse.status, backstoryResponse.statusText)
            const errorText = await backstoryResponse.text()
            console.error('Backstory error response body:', errorText)
            throw new Error(`Backstory API request failed: ${backstoryResponse.status} ${backstoryResponse.statusText}`)
          }

          const backstoryResult = await backstoryResponse.json()
          console.log('Google Sheets backstory update response:', backstoryResult)
          
          if (!backstoryResult.success) {
            console.warn('Failed to save backstory to Google Sheets:', backstoryResult.message)
            console.warn('Full backstory error response:', backstoryResult)
          } else {
            console.log('Backstory saved to Member Log Column J successfully:', backstoryResult)
          }
        } catch (backstoryError) {
          console.error('Error saving backstory to Google Sheets:', backstoryError)
          console.error('Backstory error details:', {
            message: backstoryError.message,
            stack: backstoryError.stack
          })
          // Don't fail the entire save operation for backstory errors
        }
      }
      
      // Save custom ship image to Google Sheets Member Log
      if (user?.id && profileData.customShipImage !== undefined) {
        try {
          console.log('Saving custom ship image to Google Sheets:', {
            discordId: user.id,
            customShipImage: profileData.customShipImage
          })
          
          const token = localStorage.getItem('auth_token')
          const customShipImageResponse = await fetch('/api/update-custom-ship-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              discordId: user.id,
              customShipImage: profileData.customShipImage
            })
          })

          if (!customShipImageResponse.ok) {
            console.error('Custom ship image API request failed:', customShipImageResponse.status, customShipImageResponse.statusText)
            const errorResponse = await customShipImageResponse.json().catch(async () => {
              const errorText = await customShipImageResponse.text()
              return { error: errorText }
            })
            console.error('Custom ship image error response:', errorResponse)
            
            // Handle specific error cases
            if (customShipImageResponse.status === 400 && errorResponse.message?.includes('too large for sharing')) {
              alert('Image too large: Your image is too big to be shared with other players. Please:\n\n1. Use a smaller image (under 1MB), or\n2. Ask admin to configure Cloudinary/Imgur for large image support\n\nLarge images stored locally are only visible to you.')
            } else {
              alert(`Failed to save custom ship image: ${errorResponse.error || errorResponse.message || 'Unknown error'}`)
            }
            throw new Error(`Custom ship image API request failed: ${customShipImageResponse.status}`)
          }

          const customShipImageResult = await customShipImageResponse.json()
          console.log('Google Sheets custom ship image update response:', customShipImageResult)
          
          if (!customShipImageResult.success) {
            console.warn('Failed to save custom ship image to Google Sheets:', customShipImageResult.message)
            console.warn('Full custom ship image error response:', customShipImageResult)
            alert(`Failed to save custom ship image: ${customShipImageResult.error || customShipImageResult.message}`)
          } else {
            console.log('Custom ship image saved successfully:', customShipImageResult)
          }
        } catch (customShipImageError) {
          console.error('Error saving custom ship image to Google Sheets:', customShipImageError)
          console.error('Custom ship image error details:', {
            message: customShipImageError.message,
            stack: customShipImageError.stack
          })
          // Don't fail the entire save operation for custom ship image errors
        }
      }
      
      // Save customization (theme) data to Google Sheets Member Log
      if (user?.id && profileData.customization !== undefined) {
        try {
          console.log('Saving customization to Google Sheets:', {
            discordId: user.id,
            customization: profileData.customization
          })
          
          // For now, we'll store the customization data as JSON in a new column
          // This would require a new API endpoint, but for testing we'll log it
          console.log('Customization data to save:', JSON.stringify(profileData.customization))
          
          // TODO: Create a new API endpoint like /api/update-customization
          // that saves theme data to Google Sheets for cross-device/player visibility
          
        } catch (customizationError) {
          console.error('Error saving customization to Google Sheets:', customizationError)
          // Don't fail the entire save operation for customization errors
        }
      }
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      })
      setTimeout(() => setNotification(null), 3000)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setNotification({
        type: 'error',
        message: 'Failed to save profile. Please try again.'
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const formatBackstoryText = (text) => {
    if (!text) return null
    
    // Check if the text contains HTML tags (from rich text editor)
    const hasHtmlTags = /<[^>]*>/.test(text)
    
    if (hasHtmlTags) {
      // For HTML content from rich text editor, render as HTML
      return (
        <div 
          className="backstory-html-content"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )
    } else {
      // For plain text, use the old paragraph formatting
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
      
      return paragraphs.map((paragraph, index) => {
        // Convert single line breaks within paragraphs to <br> tags
        const formattedParagraph = paragraph.split('\n').map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))
        
        return (
          <p key={index} className="backstory-paragraph">
            {formattedParagraph}
          </p>
        )
      })
    }
  }

  const getShipDisplayName = (shipValue) => {
    if (!shipValue) return null
    
    // First try to find in ship registry
    const ship = shipRegistry.find(s => s.value === shipValue)
    if (ship) {
      return ship.fullName
    }
    
    // Fallback to old system for backwards compatibility
    const shipNames = {
      'aegis-avenger-titan': 'Aegis Avenger Titan',
      'aegis-gladius': 'Aegis Gladius',
      'aegis-sabre': 'Aegis Sabre',
      'aegis-vanguard-warden': 'Aegis Vanguard Warden',
      'anvil-arrow': 'Anvil Arrow',
      'anvil-f7c-hornet': 'Anvil F7C Hornet',
      'anvil-hawk': 'Anvil Hawk',
      'anvil-hurricane': 'Anvil Hurricane',
      'anvil-terrapin': 'Anvil Terrapin',
      'argo-cargo': 'Argo MPUV Cargo',
      'crusader-mercury-star-runner': 'Crusader Mercury Star Runner',
      'crusader-nomad': 'Crusader Nomad',
      'drake-buccaneer': 'Drake Buccaneer',
      'drake-caterpillar': 'Drake Caterpillar',
      'drake-cutlass-black': 'Drake Cutlass Black',
      'drake-herald': 'Drake Herald',
      'origin-300i': 'Origin 300i',
      'origin-325a': 'Origin 325a',
      'origin-350r': 'Origin 350r',
      'origin-600i': 'Origin 600i',
      'origin-890-jump': 'Origin 890 Jump',
      'rsi-aurora-mr': 'RSI Aurora MR',
      'rsi-constellation-andromeda': 'RSI Constellation Andromeda',
      'rsi-mantis': 'RSI Mantis',
      'misc-freelancer': 'MISC Freelancer',
      'misc-prospector': 'MISC Prospector',
      'misc-starfarer': 'MISC Starfarer',
      'banu-defender': 'Banu Defender',
      'esperia-prowler': 'Esperia Prowler',
      'vanduul-scythe': 'Vanduul Scythe'
    }
    
    return shipNames[shipValue] || shipValue
  }

  const getShipImageUrl = (shipValue) => {
    if (!shipValue) {
      return '/Nebula BG.jpeg'
    }
    
    // Try to find in ship registry
    const ship = shipRegistry.find(s => s.value === shipValue)
    
    if (ship && ship.imageUrl) {
      return ship.imageUrl
    }
    
    return '/Nebula BG.jpeg'
  }

  // Get ship background image, prioritizing custom images over registry images
  const getShipBackgroundUrl = (shipValue, customShipImage) => {
    // Prioritize custom ship image if available
    if (customShipImage && customShipImage.trim() !== '') {
      return customShipImage
    }
    
    // Fallback to registry ship image
    const registryImageUrl = getShipImageUrl(shipValue)
    
    // If we got a registry image URL, use it, otherwise use nebula background
    if (registryImageUrl && registryImageUrl.trim() !== '') {
      return registryImageUrl
    }
    
    return '/Nebula BG.jpeg'
  }

  // Get path background image based on role path
  const getPathImageUrl = (rolePath) => {
    if (!rolePath || rolePath.trim() === '') {
      return '/Nebula BG.jpeg'
    }
    
    // Construct the hero image path directly from the Role Path field
    const heroImagePath = `/Role Path/${rolePath} - Hero.png`
    return encodeURI(heroImagePath)
  }

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(parseInt(timestamp) / 4194304 + 1420070400000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAvatarUrl = (userId, avatarHash) => {
    if (!avatarHash) {
      // Default Discord avatar based on discriminator
      const defaultAvatar = (parseInt(user?.discriminator || '0') % 5)
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=256`
  }

  return (
    <div className="profile-page">
      <Header />
      
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '' : ''}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <main className="profile-main">
        <div className="profile-container">
          
          {/* Player Search - Top of Page */}
          <PlayerSearch 
            onPlayerSelect={handlePlayerSelect} 
            shouldClear={clearPlayerSearch}
          />
          
          {/* Profile Switch Banner - Between Search and Welcome */}
          {isViewingOtherPlayer && selectedPlayer && (
            <div className="profile-switch-banner">
              <span className="switch-text">
                Viewing {selectedPlayer.Username}'s Profile
              </span>
              <button 
                className="switch-back-button"
                onClick={switchBackToOwnProfile}
              >
                ← Back to My Profile
              </button>
            </div>
          )}
          
          {/* Welcome Section - Top of Page */}
          {!showRankProgression ? (
            <div className="profile-welcome">
              <div className="welcome-layout">
                {/* Left: Rank Icon and Rank */}
                <div className="welcome-rank-section">
                  {currentDisplayData?.Rank && (
                    <div className="welcome-rank-icon-container">
                      <img 
                        src={`/Ranks/${currentDisplayData.Rank}.png`}
                        alt={`${currentDisplayData.Rank} Rank`}
                        className="welcome-rank-icon"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <span className="rank-badge">{currentDisplayData?.Rank || 'Unranked'}</span>
                </div>
                
                {/* Center: Welcome Text */}
                <div className="welcome-content">
                  <h2 className="welcome-title">
                    {currentDisplayData?.Username || user?.username || 'Warrior'}
                  </h2>
                  <p className="welcome-subtitle">
                    Order of the Fallen Star • {OFSDataService.calculateTimeInService(currentDisplayData?.['Join Date']) || 'New Recruit'}
                  </p>
                  {/* Path badge moved to bottom center */}
                  <span className="path-badge">{currentDisplayData?.['Role Path'] || 'Unassigned'}</span>
                  
                  {/* Integrated Progress Bar - Show when user has rank data */}
                  {currentDisplayData?.Rank && allRankData && allRankData.length > 0 && !isLoading && (() => {
                    const nextRankData = getNextRankFromTier(currentDisplayData.Rank)
                    
                    if (!nextRankData) {
                      // At max rank - show "Max Rank" instead
                      return (
                        <div className="welcome-progress-section">
                          <div className="progress-label">Max Rank</div>
                          <div 
                            className="welcome-progress-bar-container"
                            onClick={() => setShowRankProgression(true)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view rank progression details"
                          >
                            <span className="current-rank-welcome">{currentDisplayData.Rank}</span>
                            <div className="welcome-progress-bar">
                              <div 
                                className="welcome-progress-fill"
                                style={{ 
                                  width: '100%',
                                  background: (() => {
                                    const colors = getProgressBarColors(currentCustomization)
                                    return `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                                  })()
                                }}
                              />
                            </div>
                            <span className="next-rank-welcome">👑 Max</span>
                          </div>
                        </div>
                      )
                    }
                    
                    // Show progress to next rank
                    return (
                      <div className="welcome-progress-section">
                        <div className="progress-label">Next Rank Progress</div>
                        <div 
                          className="welcome-progress-bar-container"
                          onClick={() => setShowRankProgression(true)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view rank progression requirements"
                        >
                          <span className="current-rank-welcome">{currentDisplayData.Rank}</span>
                          <div className="welcome-progress-bar">
                            <div 
                              className="welcome-progress-fill"
                              style={{ 
                                width: `${(() => {
                                  const nextRankRequirements = getProgressRequirementsForRank(nextRankData['Rank Name'])
                                  const currentStats = getPlayerCurrentStats()
                                  return calculateRankProgress(nextRankRequirements, currentStats)
                                })()}%`,
                                background: (() => {
                                  const colors = getProgressBarColors(currentCustomization)
                                  return `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                                })()
                              }}
                            />
                          </div>
                          <span className="next-rank-welcome">{nextRankData['Rank Name']}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                
                {/* Right: Rank Icon and Role Badge */}
                <div className="welcome-badges">
                  {currentDisplayData?.Rank && (
                    <div className="welcome-rank-icon-container">
                      <img 
                        src={`/Ranks/${currentDisplayData.Rank}.png`}
                        alt={`${currentDisplayData.Rank} Rank`}
                        className="welcome-rank-icon"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <span className="role-badge">{currentDisplayData?.Role || 'Member'}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Rank Progression Requirements Section */
            <div 
              className="profile-welcome" 
              key={`rank-progression-${isViewingOtherPlayer ? selectedPlayerData?.discordId : memberData?.discordId || user?.id}`}
            >
              <div className="welcome-layout rank-progression-layout">
                {/* Close Button - Top Right */}
                <button 
                  className="rank-progression-close"
                  onClick={() => setShowRankProgression(false)}
                  title="Back to profile"
                >
                  ✕
                </button>
                
                {/* Left: Current Rank Icon */}
                <div className="welcome-rank-section">
                  {currentDisplayData?.Rank && (
                    <div className="welcome-rank-icon-container">
                      <img 
                        src={`/Ranks/${currentDisplayData.Rank}.png`}
                        alt={`${currentDisplayData.Rank} Rank`}
                        className="welcome-rank-icon"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <span className="rank-badge">{currentDisplayData?.Rank || 'Unranked'}</span>
                </div>
                
                {/* Center: Rank Progression Details */}
                <div className="welcome-content rank-progression-content">
                  
                  {/* Current Rank Requirements */}
                  <div className="rank-requirements-section">
                    <div className="rank-header-section">
                      <div className="rank-info">
                        <span className="current-rank">Current Rank: {currentDisplayData?.Rank || 'Unranked'}</span>
                        <span className="progression-path">
                          {isViewingOtherPlayer ? (selectedPlayerData?.Username || 'Unknown Player') : (currentDisplayData?.Username || user?.username || 'Warrior')} - Progression Path
                        </span>
                        {(() => {
                          const nextRankData = getNextRankFromTier(currentDisplayData?.Rank)
                          return nextRankData ? (
                            <span className="next-rank">Next Rank: {nextRankData['Rank Name']}</span>
                          ) : (
                            <span className="next-rank">Maximum Rank Achieved!</span>
                          )
                        })()}
                      </div>
                    </div>
                    
                    {(() => {
                      const nextRankData = getNextRankFromTier(currentDisplayData?.Rank)
                      
                      if (!nextRankData) {
                        return (
                          <div className="max-rank-info">
                            <div className="rank-achievement">🏆 Maximum Rank Achieved!</div>
                            <p className="rank-description">
                              You have reached the highest rank in the Order of the Fallen Star. 
                              Continue to serve with honor and lead by example.
                            </p>
                          </div>
                        )
                      }
                      
                      return (
                        <div className="next-rank-requirements">
                          
                          {(() => {
                            // Get progress requirements for the next rank
                            const nextRankRequirements = getProgressRequirementsForRank(nextRankData['Rank Name'])
                            
                            if (!nextRankRequirements) {
                              return (
                                <div className="requirements-list">
                                  <div className="requirement-item">
                                    <span className="requirement-label">Requirements data:</span>
                                    <span className="requirement-value">
                                      {progressRequirements.length > 0 
                                        ? `Loaded ${progressRequirements.length} ranks, but no match for "${nextRankData['Rank Name']}"` 
                                        : 'Progress sheet not loaded'}
                                    </span>
                                  </div>
                                  {progressRequirements.length > 0 && (
                                    <div className="requirement-item">
                                      <span className="requirement-label">Available ranks:</span>
                                      <span className="requirement-value">
                                        {progressRequirements.map(req => Object.values(req)[0]).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            }
                            
                            return (
                              <div className="requirements-list">
                                {(() => {
                                  const playerStats = getPlayerCurrentStats()
                                  
                                  return (
                                    <>
                                      {/* Detail Requirements */}
                                      {nextRankRequirements['Detail Req'] && (
                                        <div className="requirement-item special-req">
                                          <span className="requirement-label">Step Requirements:</span>
                                          <span className="requirement-value">{nextRankRequirements['Detail Req']}</span>
                                        </div>
                                      )}
                                      
                                      {/* Time in Service */}
                                      {nextRankRequirements['Time in Service'] && (
                                        <div className={`requirement-item ${playerStats.timeInServiceDays >= parseInt(nextRankRequirements['Time in Service'].replace(/\D/g, '') || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Time in Service:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.timeInServiceDays} days</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Time in Service']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Crusade/Quest Led Total */}
                                      {nextRankRequirements['Crusade/Quest Led Total'] && nextRankRequirements['Crusade/Quest Led Total'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.totalLed >= parseInt(nextRankRequirements['Crusade/Quest Led Total'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Total Led (Quests/Crusades):</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.totalLed}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Crusade/Quest Led Total']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Crusade Led */}
                                      {nextRankRequirements['Crusade Led'] && nextRankRequirements['Crusade Led'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.crusadesLed >= parseInt(nextRankRequirements['Crusade Led'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Crusades Led:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.crusadesLed}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Crusade Led']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Quests Led */}
                                      {nextRankRequirements['Quests Led'] && nextRankRequirements['Quests Led'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.questsLed >= parseInt(nextRankRequirements['Quests Led'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Quests Led:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.questsLed}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Quests Led']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Pilot Kills */}
                                      {nextRankRequirements['Pilot Kills'] && nextRankRequirements['Pilot Kills'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.pilotKills >= parseInt(nextRankRequirements['Pilot Kills'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Pilot Kills:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.pilotKills}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Pilot Kills']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Ground Kills */}
                                      {nextRankRequirements['Ground Kills'] && nextRankRequirements['Ground Kills'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.fpsKills >= parseInt(nextRankRequirements['Ground Kills'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Ground Kills:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.fpsKills}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Ground Kills']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Turret Kills */}
                                      {nextRankRequirements['Turret Kills'] && nextRankRequirements['Turret Kills'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.turretKills >= parseInt(nextRankRequirements['Turret Kills'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Turret Kills:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.turretKills}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Turret Kills']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Crusade/Quest Total */}
                                      {nextRankRequirements['Crusade/Quest Total'] && nextRankRequirements['Crusade/Quest Total'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.totalCompleted >= parseInt(nextRankRequirements['Crusade/Quest Total'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Total Quests & Crusades:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.totalCompleted}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Crusade/Quest Total']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Quests Completed */}
                                      {nextRankRequirements['Quests Completed'] && nextRankRequirements['Quests Completed'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.questsCompleted >= parseInt(nextRankRequirements['Quests Completed'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Quests Completed:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.questsCompleted}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Quests Completed']}</span>
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Crusade Completed */}
                                      {nextRankRequirements['Crusade Completed'] && nextRankRequirements['Crusade Completed'] !== 'x' && (
                                        <div className={`requirement-item ${playerStats.crusadesCompleted >= parseInt(nextRankRequirements['Crusade Completed'] || 0) ? 'req-met' : 'req-not-met'}`}>
                                          <span className="requirement-label">Crusades Completed:</span>
                                          <span className="requirement-comparison">
                                            <span className="current-value">{playerStats.crusadesCompleted}</span>
                                            <span className="separator"> / </span>
                                            <span className="required-value">{nextRankRequirements['Crusade Completed']}</span>
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  )
                                })()}
                              </div>
                            )
                          })()}
                        </div>
                      )
                    })()}
                  </div>
                </div>
                
                {/* Right: Next Rank Icon */}
                <div className="welcome-badges">
                  {(() => {
                    const nextRankData = getNextRankFromTier(currentDisplayData?.Rank)
                    if (nextRankData) {
                      return (
                        <div className="welcome-rank-icon-container">
                          <img 
                            src={`/Ranks/${nextRankData['Rank Name']}.png`}
                            alt={`${nextRankData['Rank Name']} Rank`}
                            className="welcome-rank-icon next-rank-preview"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                      )
                    }
                    return (
                      <div className="max-rank-crown">
                        <span className="crown-icon">👑</span>
                      </div>
                    )
                  })()}
                  <span className="role-badge">
                    {(() => {
                      const nextRankData = getNextRankFromTier(currentDisplayData?.Rank)
                      return nextRankData ? nextRankData['Rank Name'] : 'Max Rank'
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Epic Profile Header with Rank Display - Compact */}
          <div className="profile-hero" style={{
            backgroundImage: currentDisplayData?.['Role Path'] 
              ? `url('/Role Path/${currentDisplayData['Role Path']} - Hero.png')` 
              : 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 46, 0.6) 100%), url("/Nebula BG.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            {/* Remove nebula and stars overlays when Role Path image exists */}
            {!currentDisplayData?.['Role Path'] && (
              <>
                <div className="nebula-background"></div>
                <div className="stars-overlay"></div>
              </>
            )}
            
            {/* Left: Battle Record Stats */}
            <div className="battle-stats-overview">
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.fpsKills || '0')}
                </div>
                <div className="stat-label">Ground Kills</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.shipKills || '0')}
                </div>
                <div className="stat-label">Pilot Kills</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.totalLength || '0')}
                </div>
                <div className="stat-label">Total Hours</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.turretKills || '0')}
                </div>
                <div className="stat-label">Turret Kills</div>
              </div>
            </div>

            {/* Center: Most Recent Quest */}
            <div className="recent-quest-overview">
              {(() => {
                const recentQuest = getMostRecentQuest()
                return recentQuest ? (
                  <div className="quest-display">
                    <div className="quest-header">
                      <h3>Most Recent Quest</h3>
                      {recentQuest.isLeader && <span className="leader-badge">Leader</span>}
                    </div>
                    <div className="quest-name">{recentQuest.name}</div>
                    <div className="quest-description">{recentQuest.description}</div>
                    <div className="quest-leader">Led by: {recentQuest.leader}</div>
                  </div>
                ) : (
                  <div className="quest-display">
                    <div className="quest-header">
                      <h3>Most Recent Quest</h3>
                    </div>
                    <div className="quest-name">No quests found</div>
                    <div className="quest-description">Complete your first quest to see it here!</div>
                  </div>
                )
              })()}
            </div>

            {/* Center Space - Empty column for character display */}
            <div></div>

            {/* Right: Active Quest */}
            <div className="active-quest-overview">
              {(() => {
                const activeQuest = getActiveQuest()
                return activeQuest ? (
                  <div 
                    ref={activeQuestRef}
                    className="quest-display active-quest-display"
                    onMouseEnter={(e) => handleTooltipMouseEnter(e, activeQuest)}
                    onMouseMove={handleTooltipMouseMove}
                    onMouseLeave={handleTooltipMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (showTooltip && !tooltipLocked) {
                        handleTooltipToggleLock()
                      }
                    }}
                  >
                    <div className="quest-header">
                      <h3>Active Quest</h3>
                      {activeQuest.isLeader && <span className="leader-badge">Leader</span>}
                    </div>
                    <div className="quest-name">{activeQuest.name}</div>
                    <div className="quest-description">{activeQuest.description}</div>
                    <div className="quest-leader">Led by: {activeQuest.leader}</div>
                  </div>
                ) : (
                  <div className="quest-display active-quest-display">
                    <div className="quest-header">
                      <h3>Active Quest</h3>
                    </div>
                    <div className="quest-name">No active quest</div>
                    <div className="quest-description">Join an active quest to see it here!</div>
                  </div>
                )
              })()}
            </div>

            {/* Right: Quest Stats */}
            <div className="profile-stats-overview">
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.quests || '0')}
                </div>
                <div className="stat-label">Quests</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.ledQuests || '0')}
                </div>
                <div className="stat-label">Led Quests</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.crusades || '0')}
                </div>
                <div className="stat-label">Crusades</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {(isViewingOtherPlayer ? selectedPlayerLoading : statsLoading) ? '...' : (currentGoogleStats?.ledCrusades || '0')}
                </div>
                <div className="stat-label">Led Crusades</div>
              </div>
            </div>
          </div>

          {/* Bio Section - Show for own profile or other players when backstory exists */}
          {/* DEBUG: Add temporary logging */}
          {console.log('=== BACKSTORY DEBUG ===')}
          {console.log('isViewingOtherPlayer:', isViewingOtherPlayer)}
          {console.log('selectedPlayerBackstory:', selectedPlayerBackstory)}
          {console.log('selectedPlayerShip:', selectedPlayerShip)}
          {console.log('profileBio:', profileBio)}
          {console.log('profileShip:', profileShip)}
          {console.log('Should show backstory section:', ((isViewingOtherPlayer && (selectedPlayerBackstory || selectedPlayerShip)) || (!isViewingOtherPlayer && (profileBio || profileShip))))}
          {console.log('=== END BACKSTORY DEBUG ===')}
          {((isViewingOtherPlayer && (selectedPlayerBackstory || selectedPlayerShip)) || (!isViewingOtherPlayer && (profileBio || profileShip))) && (
            <div 
              className="profile-bio-section"
              style={{
                backgroundImage: getShipBackgroundUrl(
                  isViewingOtherPlayer ? selectedPlayerShip : profileShip,
                  isViewingOtherPlayer ? selectedPlayerCustomShipImage : profileCustomShipImage
                ) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${getShipBackgroundUrl(
                      isViewingOtherPlayer ? selectedPlayerShip : profileShip,
                      isViewingOtherPlayer ? selectedPlayerCustomShipImage : profileCustomShipImage
                    )})` 
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="bio-header" id="backstory-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Back Story</h3>
                <button
                  onClick={() => setShowBackstoryModal(true)}
                  className="expand-backstory-btn"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#4A90E2',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '300',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.5)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                    e.target.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.3)'
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                    e.target.style.transform = 'scale(1)'
                  }}
                  title="Open backstory in full screen"
                >
                  ⛶ Expand
                </button>
              </div>
              <div 
                className="bio-content"
                ref={backstoryRef}
                style={{
                  position: 'relative',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '20px',
                  margin: '0 20px 20px 20px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {(isViewingOtherPlayer ? selectedPlayerBackstory : profileBio) && (
                  <div className="bio-text" style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                    {formatBackstoryText(isViewingOtherPlayer ? selectedPlayerBackstory : profileBio)}
                  </div>
                )}
                {(isViewingOtherPlayer ? selectedPlayerShip : profileShip) && (
                  <div className="bio-ship" style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '6px' }}>
                    <span className="ship-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Primary Ship:</span>
                    <div className="ship-info">
                      <span className="ship-name">{getShipDisplayName(isViewingOtherPlayer ? selectedPlayerShip : profileShip)}</span>
                    </div>
                  </div>
                )}
                
                {/* Jump to Top Link - simple text in top-right corner */}
                {showBackstoryJumpToTop && (
                  <span
                    onClick={handleBackstoryJumpToTop}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '15px',
                      color: '#4A90E2',
                      fontSize: '14px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      userSelect: 'none',
                      zIndex: 10
                    }}
                    title="Jump to top of backstory"
                  >
                    ↑ Top
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dynamic layout - 3 columns with Command Center, 2 columns without */}
          <div className={isViewingOtherPlayer ? "profile-two-column-layout" : "profile-three-column-layout"}>
            {/* Left Column - Command Center (only on personal profile) */}
            {!isViewingOtherPlayer && (
              <div className="profile-left-column">
                <div className="command-center-section">
                  <div className="command-center-header">
                    <h3>Command Center</h3>
                  </div>
                  <div className="command-actions">
                    {(memberData?.RSI_Verified === true || rsiData) ? (
                      <div className="command-action success">
                        <span className="action-icon">✓</span>
                        <span className="action-text">RSI Verified</span>
                      </div>
                    ) : (
                      <button className="command-action primary" onClick={openRsiModal}>
                        <span className="action-icon">🔗</span>
                        <span className="action-text">Link RSI</span>
                      </button>
                    )}
                    <button className="command-action secondary" onClick={handleEditProfile}>
                      <span className="action-icon">✏️</span>
                      <span className="action-text">Edit Profile</span>
                    </button>
                    <button className="command-action danger" onClick={handleLogout}>
                      <span className="action-icon">🚪</span>
                      <span className="action-text">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Middle Column (or Left when no Command Center) - Player Information */}
            <div className={isViewingOtherPlayer ? "profile-left-column" : "profile-middle-column"}>
              <div className="viewed-player-info-section">
                <div className="viewed-player-header">
                  <h3>Player Information</h3>
                </div>
                <div className="viewed-player-details">
                  <div className="player-detail-row">
                    <span className="detail-label">Join Date:</span>
                    <span className="detail-value">
                      {isViewingOtherPlayer 
                        ? (selectedPlayer?.['Join Date'] || 'Unknown')
                        : (memberData?.['Join Date'] || 'Unknown')
                      }
                    </span>
                  </div>
                  <div className="player-detail-row">
                    <span className="detail-label">Time in Service:</span>
                    <span className="detail-value">
                      {isViewingOtherPlayer 
                        ? OFSDataService.calculateTimeInService(selectedPlayer?.['Join Date'])
                        : OFSDataService.calculateTimeInService(memberData?.['Join Date'])
                      }
                    </span>
                  </div>
                  <div className="player-detail-row">
                    <span className="detail-label">Chapter:</span>
                    <span className="detail-value">
                      {isViewingOtherPlayer 
                        ? (selectedPlayer?.['Current Chapter'] || selectedPlayer?.['Chapter'] || selectedPlayer?.['current chapter'] || 'Unknown')
                        : (memberData?.['Current Chapter'] || memberData?.['Chapter'] || memberData?.['current chapter'] || 'Unknown')
                      }
                    </span>
                  </div>
                  {((isViewingOtherPlayer ? selectedPlayerData?.['RSI User Name'] : memberData?.['RSI User Name']) || rsiData?.handle) && (
                    <div className="player-detail-row">
                      <span className="detail-label">RSI Handle:</span>
                      <span className="detail-value">
                        {isViewingOtherPlayer 
                          ? selectedPlayerData?.['RSI User Name']
                          : (memberData?.['RSI User Name'] || rsiData?.handle)
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-section">
              <p className="error-message">⚠️ {error}</p>
            </div>
          )}

        </div>
      </main>

      {/* RSI Link Modal */}
      <RSILinkModal
        isOpen={showRsiModal}
        onClose={() => setShowRsiModal(false)}
        onVerify={handleRsiLink}
        isLoading={rsiLoading}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSave={handleSaveProfile}
        currentBio={profileBio}
        currentShip={profileShip}
        currentCustomShipImage={profileCustomShipImage}
        currentCustomBannerImage={profileCustomBannerImage}
        currentCustomization={profileCustomization}
      />

      {/* Backstory Modal */}
      <BackstoryModal
        isOpen={showBackstoryModal}
        onClose={() => setShowBackstoryModal(false)}
        playerName={isViewingOtherPlayer ? (selectedPlayerData?.Username || 'Unknown Player') : (currentDisplayData?.Username || user?.username || 'Warrior')}
        playerRole={isViewingOtherPlayer ? selectedPlayerData?.Role : currentDisplayData?.Role}
        backstory={isViewingOtherPlayer ? selectedPlayerBackstory : profileBio}
        pathImage={getPathImageUrl(isViewingOtherPlayer ? selectedPlayerData?.['Role Path'] : currentDisplayData?.['Role Path'])}
        formatBackstoryText={formatBackstoryText}
      />

      {/* Quest Participants Tooltip */}
      <QuestParticipantsTooltip
        participants={tooltipParticipants}
        questName={tooltipQuestName}
        isVisible={showTooltip}
        position={tooltipPosition}
        isLocked={tooltipLocked}
        onClose={handleTooltipClose}
        onToggleLock={handleTooltipToggleLock}
      />

      <Footer />
    </div>
  )
}
