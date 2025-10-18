import React from 'react'
import './Header.css'
import LoginButton from './LoginButton'

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-section">
          <a href="/" className="logo-link">
            <img src="/logo.png" alt="Order of the Fallen Star" className="logo" />
            <span className="org-name">Order of the Fallen Star</span>
          </a>
        </div>
        
        <nav className="main-nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/fleet" className="nav-link">Fleet</a>
          <a href="/join" className="nav-link">Join Us</a>
          <a href="/progress" className="nav-link">Progress</a>
        </nav>
        
        <div className="header-actions">
          <LoginButton />
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
