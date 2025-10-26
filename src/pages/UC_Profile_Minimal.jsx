import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import OFSDataService from '../services/ofsDataService'
import './UC_Profile_Minimal.css'

const UC_Profile_Minimal = () => {
  const { user, isAuthenticated } = useAuth()
  const [memberData, setMemberData] = useState(null)
  const [patrolData, setPatrolData] = useState([])
  const [ranksData, setRanksData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true)
          const data = await OFSDataService.getAllData()
          
          // Find member data
          const member = data.members.find(m => 
            m.Discord?.toLowerCase() === user.username?.toLowerCase() ||
            m['Discord Username']?.toLowerCase() === user.username?.toLowerCase()
          )
          
          setMemberData(member)
          setPatrolData(data.patrols || [])
          setRanksData(data.ranks || [])
          setError(null)
        } catch (err) {
          console.error('Error loading member data:', err)
          setError('Failed to load member data')
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        setShowLoginModal(true)
      }
    }

    loadData()
  }, [isAuthenticated, user])

  const handleDiscordLogin = () => {
    window.location.href = '/api/auth/discord'
  }

  const closeModal = () => {
    setShowLoginModal(false)
    // Redirect back to home page
    window.location.href = '/'
  }

  // Login Modal
  if (showLoginModal && !isAuthenticated) {
    return (
      <div className="login-modal-overlay">
        <div className="login-modal">
          <button className="modal-close" onClick={closeModal}>
            ✕
          </button>
          <div className="modal-content">
            <h2>Member Stats Access</h2>
            <p>Please sign in with Discord to view your member statistics (Beta)</p>
            <button onClick={handleDiscordLogin} className="modal-discord-btn">
              Sign in with Discord
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="uc-stats-page">
        <div className="stats-container">
          <div className="loading-stats">
            <div className="loading-spinner"></div>
            <h2>Loading Member Stats...</h2>
            <p>Fetching your data from the organization database</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="uc-stats-page">
        <div className="stats-container">
          <div className="error-stats">
            <h2>❌ Error Loading Stats</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Member not found
  if (!memberData) {
    return (
      <div className="uc-stats-page">
        <div className="stats-container">
          <div className="member-not-found">
            <h2>👤 Member Not Found</h2>
            <p>Discord User: <strong>{user.username}</strong></p>
            <p>Your Discord account is not yet registered in our member database.</p>
            <div className="contact-info">
              <p>Please contact leadership to get your stats added to the system.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get member's patrols
  const memberPatrols = patrolData.filter(patrol => 
    patrol['Discord Username']?.toLowerCase() === user.username?.toLowerCase()
  )

  // Get member's rank info
  const memberRank = ranksData.find(rank => 
    rank['Rank Name'] === memberData['Current Rank'] || 
    rank.Rank === memberData.Rank
  )

  return (
    <div className="uc-stats-page">
      <div className="stats-container">
        
        {/* Member Header */}
        <div className="member-header">
          <div className="member-avatar">
            {user.avatar ? (
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                alt={user.username}
              />
            ) : (
              <div className="default-avatar">{user.username?.charAt(0)?.toUpperCase()}</div>
            )}
          </div>
          <div className="member-info">
            <h1>{memberData['Member Name'] || memberData.Name || user.username}</h1>
            <div className="member-details">
              <span className="discord-tag">@{user.username}</span>
              <span className="rank">{memberData['Current Rank'] || memberData.Rank || 'Recruit'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          
          {/* Basic Info */}
          <div className="stat-card">
            <h3>👤 Basic Info</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span className="label">RSI Handle</span>
                <span className="value">{memberData['RSI Handle'] || memberData.RSI || 'Not Set'}</span>
              </div>
              <div className="stat-row">
                <span className="label">Join Date</span>
                <span className="value">{memberData['Join Date'] || memberData.Joined || 'Unknown'}</span>
              </div>
              <div className="stat-row">
                <span className="label">Time Zone</span>
                <span className="value">{memberData['Time Zone'] || memberData.Timezone || 'Not Set'}</span>
              </div>
              <div className="stat-row">
                <span className="label">Status</span>
                <span className="value active">Active Member</span>
              </div>
            </div>
          </div>

          {/* Rank Info */}
          <div className="stat-card">
            <h3>🏆 Rank & Position</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span className="label">Current Rank</span>
                <span className="value rank-value">{memberData['Current Rank'] || memberData.Rank || 'Recruit'}</span>
              </div>
              {memberRank && (
                <>
                  <div className="stat-row">
                    <span className="label">Rank Level</span>
                    <span className="value">{memberRank.Level || 'N/A'}</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Department</span>
                    <span className="value">{memberRank.Department || 'General'}</span>
                  </div>
                </>
              )}
              <div className="stat-row">
                <span className="label">Specialization</span>
                <span className="value">{memberData.Specialization || memberData.Role || 'General Operations'}</span>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="stat-card">
            <h3>📊 Activity Stats</h3>
            <div className="stat-rows">
              <div className="stat-row">
                <span className="label">Total Patrols</span>
                <span className="value highlight">{memberPatrols.length}</span>
              </div>
              <div className="stat-row">
                <span className="label">Last Patrol</span>
                <span className="value">
                  {memberPatrols.length > 0 
                    ? memberPatrols[memberPatrols.length - 1].Date || 'Recent'
                    : 'No patrols yet'
                  }
                </span>
              </div>
              <div className="stat-row">
                <span className="label">Patrol Score</span>
                <span className="value highlight">
                  {memberPatrols.reduce((total, patrol) => total + (parseInt(patrol.Score) || 0), 0)}
                </span>
              </div>
              <div className="stat-row">
                <span className="label">Avg. Performance</span>
                <span className="value">
                  {memberPatrols.length > 0 
                    ? Math.round(memberPatrols.reduce((total, patrol) => total + (parseInt(patrol.Score) || 0), 0) / memberPatrols.length)
                    : 'N/A'
                  }%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="stat-card full-width">
            <h3>🚀 Recent Patrol Activity</h3>
            {memberPatrols.length > 0 ? (
              <div className="patrol-list">
                {memberPatrols.slice(-5).reverse().map((patrol, index) => (
                  <div key={index} className="patrol-item">
                    <div className="patrol-date">{patrol.Date}</div>
                    <div className="patrol-type">{patrol.Type || 'Standard Patrol'}</div>
                    <div className="patrol-score">{patrol.Score || 0}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-patrols">
                <p>No patrol activity recorded yet.</p>
                <p>Contact leadership to log your first patrol!</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="stats-footer">
          <p>Data last updated: {new Date().toLocaleDateString()}</p>
          <p>For questions about your stats, contact organization leadership</p>
        </div>

      </div>
    </div>
  )
}

export default UC_Profile_Minimal
