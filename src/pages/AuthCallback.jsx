import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './AuthCallback.css'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { handleAuthCallback } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)

  useEffect(() => {
    const processAuth = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`Discord OAuth error: ${error}`)
        }

        if (!code || !state) {
          throw new Error('Missing required OAuth parameters')
        }

        await handleAuthCallback(code, state)
        setStatus('success')
        
        console.log('Authentication successful, redirecting to home...')
        
        // Redirect to home after successful auth
        setTimeout(() => {
          console.log('Navigating to home page')
          navigate('/', { replace: true })
        }, 1500)
        
      } catch (err) {
        console.error('Authentication error:', err)
        setError(err.message)
        setStatus('error')
        
        // Redirect to home after error
        setTimeout(() => {
          navigate('/')
        }, 5000)
      }
    }

    processAuth()
  }, [searchParams, handleAuthCallback, navigate])

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        {status === 'processing' && (
          <div className="auth-status processing">
            <div className="spinner"></div>
            <h2>Authenticating with Discord...</h2>
            <p>Please wait while we complete your sign-in.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-status success">
            <div className="success-icon">✓</div>
            <h2>Authentication Successful!</h2>
            <p>Welcome to Order of the Fallen Star. Redirecting you now...</p>
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="continue-btn"
              style={{
                marginTop: '1rem',
                padding: '0.8rem 2rem',
                background: 'linear-gradient(45deg, #39b9ff, #00d4ff)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Continue to Home
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="auth-status error">
            <div className="error-icon">✗</div>
            <h2>Authentication Failed</h2>
            <p>{error}</p>
            <p>You will be redirected to the home page shortly.</p>
          </div>
        )}
      </div>
    </div>
  )
}
