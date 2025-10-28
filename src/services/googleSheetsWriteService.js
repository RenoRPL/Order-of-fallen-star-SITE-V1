import { GoogleAuth } from 'google-auth-library'
import { google } from 'googleapis'

export class GoogleSheetsWriteService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8'
    this.memberLogSheetName = 'Member Log' // Sheet name, not GID
    this.auth = null
    this.sheets = null
  }

  /**
   * Initialize Google Sheets API authentication
   */
  async initialize() {
    try {
      // Debug log environment variables (without exposing sensitive data)
      console.log('Environment check:', {
        hasProjectId: !!process.env.GOOGLE_SHEETS_PROJECT_ID,
        hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
        projectId: process.env.GOOGLE_SHEETS_PROJECT_ID,
        clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL
      })

      // Validate required environment variables
      if (!process.env.GOOGLE_SHEETS_PROJECT_ID) {
        throw new Error('Missing GOOGLE_SHEETS_PROJECT_ID environment variable')
      }
      if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
        throw new Error('Missing GOOGLE_SHEETS_CLIENT_EMAIL environment variable')
      }
      if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
        throw new Error('Missing GOOGLE_SHEETS_PRIVATE_KEY environment variable')
      }

      // Process private key - handle different newline formats
      let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
      if (privateKey) {
        // Replace literal \n with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n')
        
        // Clean up any extra whitespace
        privateKey = privateKey.trim()
        
        // Ensure proper formatting with correct line breaks
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
          throw new Error('Private key format is invalid - missing BEGIN marker')
        }
        
        if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
          throw new Error('Private key format is invalid - missing END marker')
        }
        
        // Split into lines and rejoin with proper newlines to ensure clean formatting
        const lines = privateKey.split('\n').map(line => line.trim()).filter(line => line)
        privateKey = lines.join('\n')
        
        console.log('Private key processed, length:', privateKey.length)
        console.log('Private key starts with:', privateKey.substring(0, 50))
        console.log('Private key ends with:', privateKey.substring(privateKey.length - 50))
      }

      // Create auth instance with service account credentials
      this.auth = new GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
          private_key: privateKey,
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })

      // Create sheets client
      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
      
      console.log('Google Sheets API initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error)
      throw new Error(`Google Sheets authentication failed: ${error.message}`)
    }
  }

  /**
   * Find the row index for a Discord user ID
   * @param {string} discordId - Discord user ID
   * @returns {Promise<number|null>} Row index (1-based) or null if not found
   */
  async findUserRow(discordId) {
    try {
      if (!this.sheets) await this.initialize()

      // Get all data from column A (User IDs)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.memberLogSheetName}!A:A`,
      })

      const values = response.data.values || []
      
      // Find the row with matching Discord ID
      for (let i = 0; i < values.length; i++) {
        if (values[i][0] && values[i][0].toString() === discordId.toString()) {
          return i + 1 // Return 1-based row index
        }
      }

      return null // User not found
    } catch (error) {
      console.error('Error finding user row:', error)
      throw error
    }
  }

  /**
   * Update verification status for a user
   * @param {string} discordId - Discord user ID
   * @param {boolean} verified - Verification status
   * @param {string} rsiHandle - RSI handle (optional)
   * @returns {Promise<boolean>} Success status
   */
  async updateVerificationStatus(discordId, verified, rsiHandle = null) {
    try {
      if (!this.sheets) await this.initialize()

      // Find the user's row
      const rowIndex = await this.findUserRow(discordId)
      if (!rowIndex) {
        throw new Error(`Discord user ${discordId} not found in Member Log`)
      }

      console.log(`Updating verification for Discord ID ${discordId} at row ${rowIndex}`)

      // Prepare updates
      const updates = []

      // Update Column U (Verified) - column index 21 (U)
      updates.push({
        range: `${this.memberLogSheetName}!U${rowIndex}`,
        values: [[verified ? 'TRUE' : 'FALSE']]
      })

      // If RSI handle provided, update a specific column (adjust as needed)
      if (rsiHandle) {
        // Assuming column V is for RSI Handle - adjust as needed
        updates.push({
          range: `${this.memberLogSheetName}!V${rowIndex}`,
          values: [[rsiHandle]]
        })
      }

      // Add timestamp of verification
      const timestamp = new Date().toISOString()
      updates.push({
        range: `${this.memberLogSheetName}!W${rowIndex}`, // Assuming column W for timestamp
        values: [[timestamp]]
      })

      // Batch update all changes
      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      })

      console.log(`Successfully updated verification status for ${discordId}`)
      return true

    } catch (error) {
      console.error('Error updating verification status:', error)
      throw error
    }
  }

  /**
   * Get current verification status for a user
   * @param {string} discordId - Discord user ID
   * @returns {Promise<Object|null>} User verification data
   */
  async getVerificationStatus(discordId) {
    try {
      if (!this.sheets) await this.initialize()

      const rowIndex = await this.findUserRow(discordId)
      if (!rowIndex) {
        return null
      }

      // Get verification data from the user's row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.memberLogSheetName}!A${rowIndex}:Z${rowIndex}`, // Get full row
      })

      const row = response.data.values?.[0] || []
      
      return {
        discordId: row[0] || null,
        username: row[1] || null, // Assuming column B is username
        verified: row[20] === 'TRUE' || row[20] === 'true', // Column U (index 20)
        rsiHandle: row[21] || null, // Column V (index 21)
        verificationTimestamp: row[22] || null, // Column W (index 22)
        rowIndex: rowIndex
      }

    } catch (error) {
      console.error('Error getting verification status:', error)
      throw error
    }
  }

  /**
   * Test the connection and permissions
   * @returns {Promise<boolean>} Connection success
   */
  async testConnection() {
    try {
      if (!this.sheets) await this.initialize()

      // Try to read the sheet metadata
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        includeGridData: false
      })

      console.log('Connection test successful. Sheet title:', response.data.properties.title)
      return true

    } catch (error) {
      console.error('Connection test failed:', error)
      throw error
    }
  }
}

// Create singleton instance
export const googleSheetsWriteService = new GoogleSheetsWriteService()