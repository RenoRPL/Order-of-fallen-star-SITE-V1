import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RSILinkModal from '../components/RSILinkModal'
import EditProfileModal from '../components/EditProfileModal'
import BackstoryModal from '../components/BackstoryModal'
import PlayerSearch from '../components/PlayerSearch'
import OFSDataService from '../services/ofsDataService'
import { GoogleSheetsService } from '../services/googleSheetsService'
import './Profile.css'

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [memberData, setMemberData] = useState(null)
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
      if (!user?.id) return

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

      // Load from localStorage first (for immediate display)
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

      // Also fetch ship selection from Google Sheets (authoritative source)
      try {
        const response = await fetch('/api/update-ship-selection-v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discordId: user.id,
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
          
          // Update localStorage to keep it in sync
          const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}
          currentProfile.ship = shipValueForUI
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(currentProfile))
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
            discordId: user.id,
            action: 'get'
          })
        })

        const backstoryResult = await backstoryResponse.json()
        if (backstoryResult.success && backstoryResult.backstory) {
          console.log('Loaded backstory from Google Sheets:', backstoryResult.backstory.length, 'characters')
          
          // Update backstory from Google Sheets if it exists
          setProfileBio(backstoryResult.backstory)
          
          // Update localStorage to keep it in sync
          const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}
          currentProfile.bio = backstoryResult.backstory
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(currentProfile))
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
            discordId: user.id
          })
        })

        const customShipImageResult = await customShipImageResponse.json()
        console.log('Custom ship image API response:', customShipImageResult)
        
        if (customShipImageResult.success && customShipImageResult.customShipImage) {
          console.log('Loaded custom ship image from Google Sheets:', customShipImageResult.customShipImage)
          
          // Update custom ship image from Google Sheets
          setProfileCustomShipImage(customShipImageResult.customShipImage)
          
          // Update localStorage to keep it in sync
          const currentProfile = savedProfile ? JSON.parse(savedProfile) : {}
          currentProfile.customShipImage = customShipImageResult.customShipImage
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(currentProfile))
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
  }, [user?.id])

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
    const fetchData = async () => {
      // Get playerId from URL params
      const playerId = searchParams.get('playerId')
      const targetUserId = playerId || user?.id
      
      if (!targetUserId) return
      
      setIsLoading(true)
      setError(null)
      setIsViewingOtherPlayer(!!playerId)
      
      try {
        // Fetch member data for the target user (either URL param or current user)
        const member = await OFSDataService.getMemberData(targetUserId)
        console.log('Fetched member data:', member)
        console.log('Member data keys:', member ? Object.keys(member) : 'No member data')
        
        if (member) {
          console.log('Rank field:', member.Rank)
          console.log('Role field:', member.Role)
          console.log('Role Path field:', member['Role Path'])
        }
        
        console.log('Fetched member data:', member) // Debug log
        
        if (playerId) {
          // If viewing another player, set their data in the selected player state
          setSelectedPlayerData(member)
          setSelectedPlayer(member) // Set the selected player for PlayerSearch component
          
          // Fetch their patrol data
          const patrols = await OFSDataService.getPatrolData(targetUserId)
          setSelectedPlayerPatrolData(patrols)
          
          // Calculate their patrol stats
          const stats = OFSDataService.formatPatrolStats(patrols)
          setSelectedPlayerStats(stats)
          
          // Fetch selected player's Google Sheets stats
          try {
            console.log('Fetching Google Sheets stats for URL player:', targetUserId)
            const playerGoogleStats = await googleSheetsService.fetchUserStats(targetUserId)
            console.log('URL-based player Google stats:', playerGoogleStats)
            setSelectedPlayerGoogleStats(playerGoogleStats)
            console.log('*** SET selectedPlayerGoogleStats for URL player ***', playerGoogleStats)
          } catch (error) {
            console.log('No Google Sheets stats found for URL player:', error)
            setSelectedPlayerGoogleStats(null)
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
              if (backstoryResult.success) {
                setSelectedPlayerBackstory(backstoryResult.backstory || '')
                console.log('Loaded backstory for selected player:', backstoryResult.backstory?.length || 0, 'characters')
              }
            }
          } catch (error) {
            console.log('No backstory found for selected player:', error)
            setSelectedPlayerBackstory('')
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
            setSelectedPlayerShip('')
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
              if (customShipImageResult.success && customShipImageResult.customShipImage) {
                setSelectedPlayerCustomShipImage(customShipImageResult.customShipImage)
                console.log('Loaded custom ship image for selected player:', customShipImageResult.customShipImage)
              } else {
                setSelectedPlayerCustomShipImage('')
              }
            }
          } catch (error) {
            console.log('No custom ship image found for selected player:', error)
            setSelectedPlayerCustomShipImage('')
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
            setSelectedPlayerCustomization(null)
          }
          
          // Clear current user data to avoid confusion
          setMemberData(null)
          setPatrolData([])
          setPatrolStats(null)
          setRankData(null)
          
        } else {
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
        
      } catch (err) {
        console.error('Error fetching OFS data:', err)
        setError('Failed to load organization data')
      } finally {
        setIsLoading(false)
      }
    }
    
    // Only fetch if we have a user ID OR a playerId from URL
    const playerId = searchParams.get('playerId')
    if ((isAuthenticated && user?.id) || playerId) {
      fetchData()
    }
  }, [user?.id, isAuthenticated, searchParams])

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
    const playerId = searchParams.get('playerId')
    if ((isAuthenticated && user?.id) || playerId) {
      fetchGoogleStats()
    }
  }, [user?.id, isAuthenticated, searchParams])

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

  // Redirect if not authenticated
  if (!isAuthenticated) {
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
    setSelectedPlayer(player)
    
    if (player) {
      console.log('Selected player:', player)
      
      try {
        // Start loading
        setSelectedPlayerLoading(true)
        
        // Fetch detailed data for the selected player
        const playerDiscordId = player['User ID']
        
        // Show immediate feedback
        setNotification({
          type: 'success',
          message: `Loading profile for ${player.Username}...`
        })

        // Fetch selected player's patrol data
        const playerPatrols = await OFSDataService.getPatrolData(playerDiscordId)
        setSelectedPlayerPatrolData(playerPatrols)
        
        // Calculate selected player's patrol stats
        const playerStats = OFSDataService.formatPatrolStats(playerPatrols)
        setSelectedPlayerStats(playerStats)
        
        // Set the selected player data (this is already from getMemberData)
        setSelectedPlayerData(player)
        console.log('Selected player data:', player)
        console.log('Selected player data keys:', player ? Object.keys(player) : 'No player data')
        
        if (player) {
          console.log('Selected player Rank field:', player.Rank)
          console.log('Selected player Role field:', player.Role)
          console.log('Selected player Role Path field:', player['Role Path'])
        }
        
        // Fetch selected player's Google Sheets stats
        try {
          console.log('Fetching Google Sheets stats for player:', playerDiscordId)
          const playerGoogleStats = await googleSheetsService.fetchUserStats(playerDiscordId)
          console.log('Selected player Google stats:', playerGoogleStats)
          setSelectedPlayerGoogleStats(playerGoogleStats)
          
          // Show debug notification with stats
          if (playerGoogleStats) {
            console.log('Successfully loaded stats for', player.Username, ':', {
              fpsKills: playerGoogleStats.fpsKills,
              shipKills: playerGoogleStats.shipKills,
              quests: playerGoogleStats.quests,
              totalLength: playerGoogleStats.totalLength
            })
          }
        } catch (error) {
          console.log('No Google Sheets stats found for selected player:', error)
          setSelectedPlayerGoogleStats(null)
        }
        
        // Fetch selected player's backstory from Google Sheets
        try {
          console.log('Fetching backstory for player:', playerDiscordId)
          const backstoryResponse = await fetch('/api/update-backstory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              discordId: playerDiscordId,
              action: 'get'
            })
          })
          
          if (backstoryResponse.ok) {
            const backstoryResult = await backstoryResponse.json()
            if (backstoryResult.success) {
              setSelectedPlayerBackstory(backstoryResult.backstory || '')
              console.log('Loaded backstory for selected player:', backstoryResult.backstory?.length || 0, 'characters')
            }
          }
        } catch (error) {
          console.log('No backstory found for selected player:', error)
          setSelectedPlayerBackstory('')
        }
        
        // Fetch selected player's ship from Google Sheets
        try {
          console.log('Fetching ship for player:', playerDiscordId)
          const shipResponse = await fetch('/api/update-ship-selection-v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              discordId: playerDiscordId,
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
              setSelectedPlayerShip(shipValueForUI)
              console.log('Loaded ship for selected player:', shipResult.shipValue)
            }
          }
        } catch (error) {
          console.log('No ship found for selected player:', error)
          setSelectedPlayerShip('')
        }
        
        // Fetch selected player's custom ship image from Google Sheets
        try {
          console.log('Fetching custom ship image for player:', playerDiscordId)
          
          // We need to get a token for this request or handle it differently
          // For now, let's use a separate endpoint that doesn't require auth for viewing other players
          const customShipImageResponse = await fetch('/api/get-custom-ship-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              discordId: playerDiscordId
            })
          })
          
          if (customShipImageResponse.ok) {
            const customShipImageResult = await customShipImageResponse.json()
            if (customShipImageResult.success && customShipImageResult.customShipImage) {
              setSelectedPlayerCustomShipImage(customShipImageResult.customShipImage)
              console.log('Loaded custom ship image for selected player:', customShipImageResult.customShipImage)
            } else {
              setSelectedPlayerCustomShipImage('')
            }
          }
        } catch (error) {
          console.log('No custom ship image found for selected player:', error)
          setSelectedPlayerCustomShipImage('')
        }
        
        // Fetch selected player's customization settings
        try {
          // TODO: First try to fetch from Google Sheets API
          // const customizationResponse = await fetch('/api/get-customization', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ discordId: playerDiscordId, action: 'get' })
          // })
          
          // For now, try localStorage (will only work if player used same device)
          const savedProfile = localStorage.getItem(`profile_${playerDiscordId}`)
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
          setSelectedPlayerCustomization(null)
        }
        
        // Switch to viewing the other player
        setIsViewingOtherPlayer(true)
        setClearPlayerSearch(true) // Trigger search field clearing
        
        // Update notification to show success
        setNotification({
          type: 'success',
          message: `Now viewing ${player.Username}'s profile (${player.Rank}) - ${player.Role || 'No Role'}`
        })
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification(null)
          setClearPlayerSearch(false) // Reset the clear trigger after clearing
        }, 3000)
        
      } catch (error) {
        console.error('Error fetching selected player data:', error)
        setNotification({
          type: 'error',
          message: `Failed to load profile for ${player.Username}`
        })
        setTimeout(() => setNotification(null), 3000)
      } finally {
        // Stop loading
        setSelectedPlayerLoading(false)
      }
    } else {
      // Deselect player - go back to own profile
      setSelectedPlayer(null)
      setSelectedPlayerData(null)
      setSelectedPlayerPatrolData([])
      setSelectedPlayerStats(null)
      setSelectedPlayerGoogleStats(null)
      setSelectedPlayerBackstory('')
      setSelectedPlayerShip('')
      setIsViewingOtherPlayer(false)
      setSelectedPlayerLoading(false)
    }
  }

  const switchBackToOwnProfile = () => {
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
                {currentDisplayData?.Rank && (
                  <div className="welcome-progress-section">
                    <div className="progress-label">Next Rank Progress</div>
                    <div className="welcome-progress-bar-container">
                      <span className="current-rank-welcome">{currentDisplayData.Rank}</span>
                      <div className="welcome-progress-bar">
                        <div 
                          className="welcome-progress-fill"
                          style={{ 
                            width: '60%',
                            background: (() => {
                              const colors = getProgressBarColors(currentCustomization)
                              return `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                            })()
                          }}
                        />
                      </div>
                      <span className="next-rank-welcome">Squire</span>
                    </div>
                  </div>
                )}
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

      <Footer />
    </div>
  )
}
