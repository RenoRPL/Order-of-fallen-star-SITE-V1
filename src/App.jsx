import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import ContentManagement from './pages/ContentManagement'

export default function App() {
  const [showDevModal, setShowDevModal] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAccessSubmit = () => {
    if (accessCode === '7270') {
      setIsAuthenticated(true)
      setShowDevModal(false)
    } else {
      alert('Invalid access code')
      setAccessCode('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAccessSubmit()
    }
  }

  return (
    <Router>
      <Routes>
        {/* Admin Content Management Route */}
        <Route path="/admin/content" element={<ContentManagement />} />
        
        {/* Main Site Route */}
        <Route path="/" element={
          isAuthenticated ? (
            <Home />
          ) : (
            <div className="container">
              {/* Developer Access Icon */}
              <div 
                className="dev-access-icon" 
                onClick={() => setShowDevModal(true)}
                title="Developer Access"
              >
                ⚙️
              </div>

              <h1 className="title">
                Order of the Fallen Star
              </h1>
              <p className="subtitle">
                This site is currently under construction.
              </p>
              <p className="description">
                Check back soon or follow us on Discord and Spectrum for updates.
              </p>

              <div className="buttons">
                <a
                  href="https://discord.gg/3dhZ38nbNZ"
                  target="_blank"
                  className="button primary"
                >
                  Join Our Discord
                </a>
                <a
                  href="https://robertsspaceindustries.com/en/orgs/FALLSTR"
                  target="_blank"
                  className="button secondary"
                >
                  Visit Spectrum
                </a>
              </div>

              {/* Developer Access Modal */}
              {showDevModal && (
                <div className="dev-modal-overlay" onClick={() => setShowDevModal(false)}>
                  <div className="dev-modal" onClick={(e) => e.stopPropagation()}>
                    <h3>Developer Access</h3>
                    <p>Enter access code:</p>
                    <input 
                      type="password" 
                      placeholder="Enter code..."
                      className="dev-input"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                    <div className="dev-modal-buttons">
                      <button className="dev-btn cancel" onClick={() => setShowDevModal(false)}>
                        Cancel
                      </button>
                      <button className="dev-btn enter" onClick={handleAccessSubmit}>
                        Enter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        } />
      </Routes>
    </Router>
  );
}
