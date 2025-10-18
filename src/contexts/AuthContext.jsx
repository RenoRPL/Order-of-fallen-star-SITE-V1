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
      if (!DiscordAuthService.validateState(state)) {
        throw new Error('Invalid state parameter')
      }

      // Exchange code for token
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
