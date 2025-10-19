import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import OFSDataService from '../services/ofsDataService'
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
          
          {/* Epic Profile Header with Rank Display */}
          <div className="profile-hero">
            <div className="nebula-background"></div>
            <div className="stars-overlay"></div>
            
            <div className="rank-display">
              {rankData?.['Rank Icon'] && (
                <div className="rank-icon-container">
                  <img 
                    src={rankData['Rank Icon'].replace('view?usp=drive_link', 'preview')} 
                    alt={`${memberData?.Rank} Rank`}
                    className="rank-icon"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="rank-glow"></div>
                </div>
              )}
              
              <div className="rank-info">
                <div className="rank-tier">
                  {rankData?.Tier && `Tier ${rankData.Tier}`}
                </div>
                <h1 className="rank-title">
                  {memberData?.Rank || 'Unranked'}
                </h1>
                <div className="member-title">
                  {memberData?.Username || user?.username || 'Unknown Warrior'}
                </div>
              </div>
            </div>

            <div className="profile-stats-overview">
              <div className="stat-crystal">
                <div className="stat-number">{patrolStats?.totalQuests || 0}</div>
                <div className="stat-label">Quests</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-number">{patrolStats?.patrolsLed || 0}</div>
                <div className="stat-label">Led</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-number">{patrolStats?.totalFPSKills || 0}</div>
                <div className="stat-label">Kills</div>
              </div>
              <div className="stat-crystal">
                <div className="stat-number">{OFSDataService.calculateTimeInService(memberData?.['Join Date']).split(' ')[0] || '0'}</div>
                <div className="stat-label">Service</div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="profile-content-grid">
            
            {/* Error Display */}
            {error && (
              <div className="error-section">
                <p className="error-message">⚠️ {error}</p>
              </div>
            )}

            {/* Current Quests */}
            <div className="quest-panel current-quests">
              <h2 className="panel-title">
                <span className="title-icon">🎯</span>
                Active Quests
              </h2>
              {isLoading ? (
                <div className="loading-state">Scanning for active missions...</div>
              ) : patrolStats?.currentQuests && patrolStats.currentQuests.length > 0 ? (
                <div className="quest-grid">
                  {patrolStats.currentQuests.slice(0, 3).map((quest, index) => (
                    <div key={index} className="quest-card active">
                      <div className="quest-image">
                        {quest.image ? (
                          <img src={quest.image} alt={quest.name} />
                        ) : (
                          <div className="quest-placeholder">🌌</div>
                        )}
                      </div>
                      <div className="quest-info">
                        <h4 className="quest-name">{quest.name}</h4>
                        <p className="quest-description">{quest.description}</p>
                        <div className="quest-status">
                          <span className="status-indicator active">In Progress</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-state">
                  <div className="empty-quest-state">
                    <span className="empty-icon">⭐</span>
                    <p>No active quests</p>
                    <p>Join a patrol to begin your next adventure!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Completed Quests */}
            <div className="quest-panel completed-quests">
              <h2 className="panel-title">
                <span className="title-icon">🏆</span>
                Completed Quests
              </h2>
              {isLoading ? (
                <div className="loading-state">Loading quest archives...</div>
              ) : patrolStats?.completedQuests && patrolStats.completedQuests.length > 0 ? (
                <div className="quest-grid">
                  {patrolStats.completedQuests.slice(0, 6).map((quest, index) => (
                    <div key={index} className="quest-card completed">
                      <div className="quest-image">
                        {quest.image ? (
                          <img src={quest.image} alt={quest.name} />
                        ) : (
                          <div className="quest-placeholder">✅</div>
                        )}
                      </div>
                      <div className="quest-info">
                        <h4 className="quest-name">{quest.name}</h4>
                        <p className="quest-description">{quest.description}</p>
                        <div className="quest-status">
                          <span className="status-indicator completed">Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-state">
                  <div className="empty-quest-state">
                    <span className="empty-icon">📜</span>
                    <p>No completed quests yet</p>
                    <p>Complete your first quest to build your legend!</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Knight's Codex - Member Information */}
            <div className="codex-panel">
              <h2 className="panel-title">
                <span className="title-icon">📖</span>
                Knight's Codex
              </h2>
              {isLoading ? (
                <div className="loading-state">Accessing Order records...</div>
              ) : memberData ? (
                <div className="codex-content">
                  <div className="codex-section">
                    <h3>Order Allegiance</h3>
                    <div className="codex-grid">
                      <div className="codex-item">
                        <label>Rank</label>
                        <span className="codex-value rank">{memberData.Rank || 'Initiate'}</span>
                      </div>
                      <div className="codex-item">
                        <label>Path</label>
                        <span className="codex-value path">{memberData['Role Path'] || 'Unassigned'}</span>
                      </div>
                      <div className="codex-item">
                        <label>Chapter</label>
                        <span className="codex-value">{memberData['Current Chapter'] || 'General'}</span>
                      </div>
                      <div className="codex-item">
                        <label>Sworn</label>
                        <span className="codex-value">{memberData['Join Date'] || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="codex-section">
                    <h3>Battle Record</h3>
                    <div className="battle-stats">
                      <div className="battle-stat">
                        <div className="stat-icon">⚔️</div>
                        <div className="stat-info">
                          <div className="stat-number">{patrolStats?.totalFPSKills || 0}</div>
                          <div className="stat-name">Combat Victories</div>
                        </div>
                      </div>
                      <div className="battle-stat">
                        <div className="stat-icon">�</div>
                        <div className="stat-info">
                          <div className="stat-number">{patrolStats?.totalShipKills || 0}</div>
                          <div className="stat-name">Ships Defeated</div>
                        </div>
                      </div>
                      <div className="battle-stat">
                        <div className="stat-icon">🎖️</div>
                        <div className="stat-info">
                          <div className="stat-number">{patrolStats?.totalCrusades || 0}</div>
                          <div className="stat-name">Crusades</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-data-state">
                  <p>Records not found in the Order's archives.</p>
                  <p>Contact your Chapter Master to register your oath.</p>
                </div>
              )}
            </div>

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
