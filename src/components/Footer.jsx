import React, { useState } from 'react'
import './Footer.css'

export default function Footer() {
  const [openDropdown, setOpenDropdown] = useState(null)

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-container">
          <div className="footer-sections">
            <div className="footer-section">
              <div className="footer-logo">
                <img src="/logo.png" alt="Order of the Fallen Star" className="footer-logo-img" />
                <span className="footer-org-name">Order of the Fallen Star</span>
              </div>
              <p className="footer-description">
                Elite Star Citizen Organization forging legends among the stars
              </p>
            </div>
            
            <div className="footer-section">
              <h4 className="dropdown-header" onClick={() => toggleDropdown('links')}>
                Quick Links <span className={`dropdown-arrow ${openDropdown === 'links' ? 'open' : ''}`}>▼</span>
              </h4>
              <ul className={`footer-links ${openDropdown === 'links' ? 'open' : ''}`}>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/fleet">Fleet</a></li>
                <li><a href="/join">Join Us</a></li>
                <li><a href="/progress">Progress</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="dropdown-header" onClick={() => toggleDropdown('community')}>
                Community <span className={`dropdown-arrow ${openDropdown === 'community' ? 'open' : ''}`}>▼</span>
              </h4>
              <ul className={`footer-links ${openDropdown === 'community' ? 'open' : ''}`}>
                <li>
                  <a href="https://discord.gg/3dhZ38nbNZ" target="_blank" rel="noopener noreferrer">
                    Discord Server
                  </a>
                </li>
                <li>
                  <a href="https://robertsspaceindustries.com/en/orgs/FALLSTR" target="_blank" rel="noopener noreferrer">
                    Spectrum Page
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="dropdown-header" onClick={() => toggleDropdown('org')}>
                Organization <span className={`dropdown-arrow ${openDropdown === 'org' ? 'open' : ''}`}>▼</span>
              </h4>
              <div className={`footer-info ${openDropdown === 'org' ? 'open' : ''}`}>
                <p>Founded: 2024</p>
                <p>Members: 150+</p>
                <p>Fleet: 50+ Ships</p>
                <p>Focus: Multi-Discipline</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>&copy; 2025 Order of the Fallen Star. All rights reserved.</p>
            </div>
            
            <div className="footer-logos">
              <img src="/MadeByTheCommunity_Black.png" alt="Made by the Community" className="footer-brand-logo" />
              <img src="/STARCITIZEN_WHITE.png" alt="Star Citizen" className="footer-brand-logo" />
            </div>
            
            <div className="footer-legal">
              <p>Star Citizen is a trademark of Cloud Imperium Games Corporation</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
