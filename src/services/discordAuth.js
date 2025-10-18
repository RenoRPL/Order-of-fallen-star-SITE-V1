// Discord OAuth Configuration
// Updated: Production environment variables configured in Netlify
// Deployment triggered for environment variable update
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/callback`
const DISCORD_API_BASE = 'https://discord.com/api/v10'

export class DiscordAuthService {
  static generateAuthUrl() {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds',
      state: this.generateState()
    })
    
    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
  }

  static generateState() {
    const state = Math.random().toString(36).substring(2, 15)
    localStorage.setItem('discord_oauth_state', state)
    return state
  }

  static validateState(receivedState) {
    const storedState = localStorage.getItem('discord_oauth_state')
    console.log('State validation:', { stored: storedState, received: receivedState })
    
    if (!storedState) {
      console.warn('No stored state found in localStorage')
      return false
    }
    
    if (!receivedState) {
      console.warn('No state parameter received from Discord')
      return false
    }
    
    const isValid = storedState === receivedState
    
    // Only remove if validation is successful
    if (isValid) {
      localStorage.removeItem('discord_oauth_state')
    }
    
    return isValid
  }

  static async exchangeCodeForToken(code) {
    try {
      const response = await fetch('/.netlify/functions/discord-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: DISCORD_REDIRECT_URI
        })
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Token exchange error:', error)
      throw error
    }
  }

  static async getUserInfo(accessToken) {
    try {
      const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }

      return await response.json()
    } catch (error) {
      console.error('User info fetch error:', error)
      throw error
    }
  }

  static async getUserGuilds(accessToken) {
    try {
      const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user guilds')
      }

      return await response.json()
    } catch (error) {
      console.error('User guilds fetch error:', error)
      throw error
    }
  }

  static storeUserData(userData, tokenData) {
    const authData = {
      user: userData,
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    }
    
    localStorage.setItem('discord_auth', JSON.stringify(authData))
    return authData
  }

  static getUserData() {
    const stored = localStorage.getItem('discord_auth')
    if (!stored) return null

    const authData = JSON.parse(stored)
    
    // Check if token is expired
    if (Date.now() > authData.expiresAt) {
      localStorage.removeItem('discord_auth')
      return null
    }

    return authData
  }

  static logout() {
    localStorage.removeItem('discord_auth')
    localStorage.removeItem('discord_oauth_state')
  }

  static isAuthenticated() {
    return this.getUserData() !== null
  }
}
