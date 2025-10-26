import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import OFSDataService from '../services/ofsDataService'
import './UC_Profile.css'

const UC_Profile = () => {
  const { user, isAuthenticated } = useAuth()
  const [memberData, setMemberData] = useState(null)
  const [patrolData, setPatrolData] = useState([])
  const [rankData, setRankData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load member data
      const memberInfo = await OFSDataService.getMemberByDiscordUsername(user.username)
      if (memberInfo) {
        setMemberData(memberInfo)
        
        // Load rank data if member found
        const rankInfo = await OFSDataService.getRankData(memberInfo.Rank)
        setRankData(rankInfo)
        
        // Load patrol data
        const patrols = await OFSDataService.getPatrolsByMember(memberInfo.Username)
        setPatrolData(patrols)
      } else {
        setError('Member not found in organization database')
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="uc-profile-page">
        <Header />
        <div className="uc-container">
          <div className="uc-login-prompt">
            <h1>Member Profile Access</h1>
            <p>Please sign in with Discord to access your member profile.</p>
            <div className="uc-login-note">
              <p>This will connect your Discord account to your Order of the Fallen Star membership data.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="uc-profile-page">
        <Header />
        <div className="uc-container">
          <div className="uc-loading">
            <div className="loading-spinner"></div>
            <h2>Loading Member Data...</h2>
            <p>Connecting to organization database...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="uc-profile-page">
        <Header />
        <div className="uc-container">
          <div className="uc-error">
            <h2>⚠️ Access Issue</h2>
            <p>{error}</p>
            <div className="uc-error-help">
              <h3>Possible Solutions:</h3>
              <ul>
                <li>Ensure your Discord username matches your organization registration</li>
                <li>Contact organization leadership if you're a new member</li>
                <li>Check if your membership status is active</li>
              </ul>
            </div>
            <button onClick={loadUserData} className="retry-btn">
              🔄 Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="uc-profile-page">
      <Header />
      <div className="uc-container">
        
        {/* Profile Header */}
        <div className="uc-header">
          <h1>Member Profile - Under Construction</h1>
          <p>Welcome, {user.username}! We're building your personalized profile experience.</p>
        </div>

        {/* Development Progress */}
        <div className="uc-progress-section">
          <h2>🚧 Development Progress</h2>
          <div className="progress-grid">
            <div className="progress-item completed">
              <span className="progress-icon">✅</span>
              <span className="progress-text">Discord Authentication</span>
            </div>
            <div className="progress-item completed">
              <span className="progress-icon">✅</span>
              <span className="progress-text">Data Connection</span>
            </div>
            <div className="progress-item in-progress">
              <span className="progress-icon">🔄</span>
              <span className="progress-text">Profile Design</span>
            </div>
            <div className="progress-item pending">
              <span className="progress-icon">⏳</span>
              <span className="progress-text">Statistics Display</span>
            </div>
            <div className="progress-item pending">
              <span className="progress-icon">⏳</span>
              <span className="progress-text">Achievement System</span>
            </div>
          </div>
        </div>

        {/* Current Data Display */}
        {memberData && (
          <div className="uc-data-section">
            <h2>📊 Your Current Data</h2>
            <div className="data-preview">
              <div className="data-card">
                <h3>Member Information</h3>
                <div className="data-row">
                  <span className="label">Username:</span>
                  <span className="value">{memberData.Username}</span>
                </div>
                <div className="data-row">
                  <span className="label">Rank:</span>
                  <span className="value">{memberData.Rank}</span>
                </div>
                <div className="data-row">
                  <span className="label">Join Date:</span>
                  <span className="value">{memberData['Join Date']}</span>
                </div>
                <div className="data-row">
                  <span className="label">Status:</span>
                  <span className="value">{memberData.Status}</span>
                </div>
              </div>

              {rankData && (
                <div className="data-card">
                  <h3>Rank Details</h3>
                  <div className="data-row">
                    <span className="label">Tier:</span>
                    <span className="value">{rankData.Tier}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Description:</span>
                    <span className="value">{rankData.Description}</span>
                  </div>
                  {rankData['Rank Icon'] && (
                    <div className="rank-preview">
                      <img 
                        src={rankData['Rank Icon'].replace('view?usp=drive_link', 'preview')} 
                        alt={`${memberData.Rank} Icon`}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="data-card">
                <h3>Activity Summary</h3>
                <div className="data-row">
                  <span className="label">Total Patrols:</span>
                  <span className="value">{patrolData.length}</span>
                </div>
                <div className="data-row">
                  <span className="label">Recent Activity:</span>
                  <span className="value">
                    {patrolData.length > 0 ? 
                      new Date(patrolData[0].Date).toLocaleDateString() : 
                      'No recent activity'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="uc-next-steps">
          <h2>🎯 What's Next?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <h3>Profile Design</h3>
              <p>We're creating an epic Star Citizen-themed profile layout with your rank, achievements, and statistics beautifully displayed.</p>
            </div>
            <div className="step-card">
              <h3>Quest System</h3>
              <p>Your patrol history will be transformed into an interactive quest log showing completed missions and active assignments.</p>
            </div>
            <div className="step-card">
              <h3>Statistics Dashboard</h3>
              <p>Detailed combat stats, exploration records, and leadership metrics will be visualized in an immersive interface.</p>
            </div>
          </div>
        </div>

        {/* Test Links */}
        <div className="uc-test-section">
          <h2>🧪 Preview Designs</h2>
          <p>Check out the design prototypes we're developing:</p>
          <div className="test-buttons">
            <Link to="/profile-test" className="test-btn">
              🌟 Compact Profile Preview
            </Link>
            <Link to="/profile-org" className="test-btn">
              👑 Organization Style Preview
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default UC_Profile
