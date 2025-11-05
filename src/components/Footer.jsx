import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { DiscordAuthService } from '../services/discordAuth';
import './Footer.css';

export default function Footer() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [content, setContent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for content updates
    const updateContent = () => {
      try {
        const newContent = contentService.getContent();
        setContent(newContent);
      } catch (error) {
        console.error('Error getting content in footer:', error);
        // Set minimal fallback content
        setContent({
          hero: {
            stats: { members: "150+", quests: "50+", systems: "2" }
          }
        });
      }
    };

    // Update content when component mounts
    updateContent();

    // Optional: Add event listener for real-time updates
    window.addEventListener('contentUpdated', updateContent);
    
    // Check admin status
    checkAdminStatus();
    
    return () => {
      window.removeEventListener('contentUpdated', updateContent);
    };
  }, []);

  const checkAdminStatus = async () => {
    const userData = DiscordAuthService.getUserData();
    if (!userData || !userData.user) {
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId: userData.user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  };

  const handleAdminClick = async () => {
    const userData = DiscordAuthService.getUserData();
    
    if (!userData || !userData.user) {
      // Not logged in with Discord
      setShowAdminModal(true);
      return;
    }

    // Check if user is admin
    setIsCheckingAdmin(true);
    try {
      const response = await fetch('/.netlify/functions/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId: userData.user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          // User is admin, allow access
          navigate('/admin/content');
        } else {
          // User is not admin
          alert('Access Denied: You must be an admin to access this page.');
        }
      } else {
        alert('Error checking admin status. Please try again.');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      alert('Error checking admin status. Please try again.');
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
  };
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
                <li><a href="/#what-we-offer">About</a></li>
                <li><a href="/fleet">Fleet</a></li>
                <li><a href="/primarchs">Primarchs</a></li>
                <li><a href="/codex">Codex</a></li>
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
                <p>Active Members: {content?.hero?.stats?.members || "150+"}</p>
                <p>Total Quests Completed: {content?.hero?.stats?.quests || "50+"}</p>
                <p>Systems Held: {content?.hero?.stats?.systems || "2"}</p>
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
            
            {isAdmin && (
              <div className="admin-access" onClick={handleAdminClick} title="Admin: Content Management">
                ⚙️
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Login Required Modal */}
      {showAdminModal && (
        <div className="admin-modal-overlay" onClick={closeAdminModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔒 Admin Access Required</h3>
            <p>You must be logged in with Discord to access the Content Management System.</p>
            <p className="modal-note">Only authorized administrators can access this section.</p>
            <div className="admin-modal-buttons">
              <button onClick={() => navigate('/profile')}>Go to Profile & Login</button>
              <button onClick={closeAdminModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Checking Admin Status */}
      {isCheckingAdmin && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Checking Admin Status...</h3>
            <p>Please wait...</p>
          </div>
        </div>
      )}
    </footer>
  )
}
