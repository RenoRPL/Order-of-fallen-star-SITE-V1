import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Roster from './pages/Roster'
import Codex from './pages/Codex'
import Primarchs from './pages/Primarchs'
import ContentManagement from './pages/ContentManagement'
import TermsPrivacy from './pages/TermsPrivacy'
import AuthCallback from './pages/AuthCallback'
import { AuthProvider } from './contexts/AuthContext'

function SplashPage() {
  const navigate = useNavigate()
  const [skipSplash, setSkipSplash] = useState(false)

  useEffect(() => {
    // Check if user has chosen to skip splash page
    const shouldSkip = localStorage.getItem('skipSplash') === 'true'
    if (shouldSkip) {
      navigate('/home')
    }
  }, [navigate])

  const handleEnter = () => {
    if (skipSplash) {
      localStorage.setItem('skipSplash', 'true')
    }
    navigate('/home')
  }

  return (
    <div className="container">
      <h1 className="title">
        Order of the Fallen Star
      </h1>
      <p className="subtitle">
        Welcome to our Order
      </p>
      <p className="description">
        A Star Citizen organization dedicated to honor, duty, and exploration among the stars.
      </p>

      <button className="button primary enter-button" onClick={handleEnter}>
        Enter Order of the Fallen Star
      </button>

      <div className="skip-splash-container">
        <label className="skip-splash-label">
          <input
            type="checkbox"
            checked={skipSplash}
            onChange={(e) => setSkipSplash(e.target.checked)}
            className="skip-splash-checkbox"
          />
          <span>Skip splash page next time</span>
        </label>
      </div>
    </div>
  )
}

export default function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Content Management Route */}
          <Route path="/admin/content" element={<ContentManagement />} />
          
          {/* Terms of Service and Privacy Policy Route */}
          <Route path="/terms-privacy" element={<TermsPrivacy />} />
          
          {/* Discord Auth Callback Route */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Profile Route */}
          <Route path="/profile" element={<Profile />} />
          
          {/* Individual Profile Route with Discord ID */}
          <Route path="/profile/:discordId" element={<Profile />} />
          
          {/* Roster Route */}
          <Route path="/roster" element={<Roster />} />
          
          {/* Codex Route */}
          <Route path="/codex" element={<Codex />} />
          
          {/* Primarchs Route */}
          <Route path="/primarchs" element={<Primarchs />} />
          
          {/* Home Page Route */}
          <Route path="/home" element={<Home />} />
          
          {/* Splash Page Route */}
          <Route path="/" element={<SplashPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
