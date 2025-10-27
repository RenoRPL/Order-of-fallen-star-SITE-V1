import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import OFSDataService from '../services/ofsDataService'
import { GoogleSheetsService } from '../services/googleSheetsService'
import './Profile.css'

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
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

  // Fetch member and patrol data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch member data
        const member = await OFSDataService.getMemberData(user.id)
        setMemberData(member)
        
        // Fetch rank data if member exists
        if (member?.Rank) {
          const rank = await OFSDataService.getRankData(member.Rank)
          setRankData(rank)
        }
        
        // Fetch patrol data
        const patrols = await OFSDataService.getPatrolData(user.id)
        setPatrolData(patrols)
        
        // Calculate patrol stats
        const stats = OFSDataService.formatPatrolStats(patrols)
        setPatrolStats(stats)
        
      } catch (err) {
        console.error('Error fetching OFS data:', err)
        setError('Failed to load organization data')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (isAuthenticated && user?.id) {
      fetchData()
    }
  }, [user?.id, isAuthenticated])

  // Fetch Google Sheets patrol stats
  useEffect(() => {
    const fetchGoogleStats = async () => {
      if (!user?.id) return
      
      setStatsLoading(true)
      try {
        console.log('Fetching Google Sheets stats for user:', user.id)
        const stats = await googleSheetsService.fetchUserStats(user.id)
        setGoogleStats(stats)
        console.log('Profile: Received Google stats:', stats)
      } catch (err) {
        console.error('Error fetching Google Sheets stats:', err)
        setGoogleStats(null)
      } finally {
        setStatsLoading(false)
      }
    }

    if (isAuthenticated && user?.id) {
      fetchGoogleStats()
    }
  }, [user?.id, isAuthenticated])

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/')
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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
      
      <main className="profile-main">
        <div className="profile-container">
          
          {/* Welcome Section - Top of Page */}
          <div className="profile-welcome">
            <h2 className="welcome-title">
              Welcome, {memberData?.Username || user?.username || 'Warrior'}
            </h2>
            <p className="welcome-subtitle">
              Order of the Fallen Star • {OFSDataService.calculateTimeInService(memberData?.['Join Date']) || 'New Recruit'}
            </p>
            <div className="welcome-rank-info">
              <span className="rank-badge">{memberData?.Rank || 'Unranked'}</span>
              <span className="role-badge">{memberData?.Role || 'Member'}</span>
              <span className="path-badge">{memberData?.['Role Path'] || 'Unassigned'}</span>
            </div>
          </div>
          
          {/* Epic Profile Header with Rank Display - Compact */}
          <div className="profile-hero" style={{
            backgroundImage: memberData?.['Role Path'] 
              ? `url('/Role Path/${memberData['Role Path']} - Hero.png')` 
              : 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 46, 0.6) 100%), url("/Nebula BG.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            {/* Remove nebula and stars overlays when Role Path image exists */}
            {!memberData?.['Role Path'] && (
              <>
                <div className="nebula-background"></div>
                <div className="stars-overlay"></div>
              </>
            )}
            
            {/* Left: Battle Record Stats */}
            <div className="battle-stats-overview">
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.fpsKills || '0')}
                </div>
                <div className="stat-label">Ground Kills</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.shipKills || '0')}
                </div>
                <div className="stat-label">Pilot Kills</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.totalLength || '0')}
                </div>
                <div className="stat-label">Total Hours</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.turretKills || '0')}
                </div>
                <div className="stat-label">Turret Kills</div>
              </div>
            </div>

            {/* Right: Quest Stats */}
            <div className="profile-stats-overview">
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.quests || '0')}
                </div>
                <div className="stat-label">Quests</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.ledQuests || '0')}
                </div>
                <div className="stat-label">Led Quests</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.crusades || '0')}
                </div>
                <div className="stat-label">Crusades</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-value">
                  {statsLoading ? '...' : (googleStats?.ledCrusades || '0')}
                </div>
                <div className="stat-label">Led Crusades</div>
              </div>
            </div>
          </div>

          {/* Content Grid - Compact Layout */}
          <div className="profile-content">
            
            {/* Error Display */}
            {error && (
              <div className="error-section">
                <p className="error-message">⚠️ {error}</p>
              </div>
            )}
            
            {/* Command Center */}
            <div className="command-panel">
              <h2 className="panel-title">
                <span className="title-icon">⚙️</span>
                Command Center
              </h2>
              <div className="command-grid">
                <button className="command-btn primary">
                  <span className="btn-icon">🔗</span>
                  <span className="btn-text">Link RSI Account</span>
                </button>
                <button className="command-btn secondary">
                  <span className="btn-icon">�</span>
                  <span className="btn-text">Update Profile</span>
                </button>
                <button className="command-btn secondary">
                  <span className="btn-icon">�️</span>
                  <span className="btn-text">Privacy Settings</span>
                </button>
                <button className="command-btn danger" onClick={handleLogout}>
                  <span className="btn-icon">🚪</span>
                  <span className="btn-text">End Session</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
