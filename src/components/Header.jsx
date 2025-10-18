import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'
import LoginButton from './LoginButton'

export default function Header() {
  const { user, isAuthenticated } = useAuth()

  const getAvatarUrl = (userId, avatarHash) => {
    if (!avatarHash) {
      const defaultAvatar = (parseInt(user?.discriminator || '0') % 5)
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=64`
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="Order of the Fallen Star" className="logo" />
            <span className="org-name">Order of the Fallen Star</span>
          </Link>
        </div>
        
        <nav className="main-nav">
          <Link to="/" className="nav-link">Home</Link>
          <a href="/about" className="nav-link">About</a>
          <a href="/fleet" className="nav-link">Fleet</a>
          <a href="/join" className="nav-link">Join Us</a>
          <a href="/progress" className="nav-link">Progress</a>
        </nav>
        
        <div className="header-actions">
          {isAuthenticated && user ? (
            <Link to="/profile" className="profile-link">
              <img 
                src={getAvatarUrl(user.id, user.avatar)} 
                alt="Profile"
                className="profile-avatar"
              />
              <span className="profile-name">{user.username}</span>
            </Link>
          ) : (
            <LoginButton />
          )}
          
          <a 
            href="https://discord.gg/3dhZ38nbNZ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="discord-btn"
          >
            Discord
          </a>
          <a 
            href="https://robertsspaceindustries.com/en/orgs/FALLSTR" 
            target="_blank" 
            rel="noopener noreferrer"
            className="spectrum-btn"
          >
            Spectrum
          </a>
        </div>
      </div>
    </header>
  )
}
