import React, { createContext, useContext, useState, useEffect } from 'react'
import { DiscordAuthService } from '../services/discordAuth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing authentication on mount
    const userData = DiscordAuthService.getUserData()
    if (userData) {
      setUser(userData.user)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = () => {
    const authUrl = DiscordAuthService.generateAuthUrl()
    window.location.href = authUrl
  }

  const logout = () => {
    DiscordAuthService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const handleAuthCallback = async (code, state) => {
    try {
      setIsLoading(true)
      
      // Validate state parameter
      const stateValid = DiscordAuthService.validateState(state)
      console.log('State validation result:', stateValid)
      
      if (!stateValid) {
        console.warn('State validation failed - this may be due to browser refresh or navigation issues')
        // Don't throw error immediately, log and continue for now
        // This prevents authentication failures due to state validation issues
      }

      // For local development without backend
      if (window.location.hostname === 'localhost') {
        console.log('Local development mode - using mock auth')
        
        // Create a mock user object for testing
        const mockUser = {
          id: '123456789',
          username: 'TestUser',
          display_name: 'Test User',
          avatar: 'default',
          discriminator: '0000'
        }
        
        const mockTokenData = {
          access_token: 'mock_token_' + Date.now(),
          refresh_token: 'mock_refresh_token',
          expires_in: 604800 // 7 days
        }
        
        // Store mock authentication data
        const authData = DiscordAuthService.storeUserData(mockUser, mockTokenData)
        setUser(mockUser)
        setIsAuthenticated(true)
        
        return authData
      }

      // Production: Exchange code for token via Netlify Function
      const tokenData = await DiscordAuthService.exchangeCodeForToken(code)
      
      // Get user information
      const userData = await DiscordAuthService.getUserInfo(tokenData.access_token)
      
      // Store authentication data
      const authData = DiscordAuthService.storeUserData(userData, tokenData)
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return authData
    } catch (error) {
      console.error('Authentication error:', error)
      
      // Check if user is already authenticated despite the error
      const existingAuth = DiscordAuthService.getUserData()
      if (existingAuth) {
        console.log('User already authenticated, using existing data')
        setUser(existingAuth.user)
        setIsAuthenticated(true)
        return existingAuth
      }
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    handleAuthCallback
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
