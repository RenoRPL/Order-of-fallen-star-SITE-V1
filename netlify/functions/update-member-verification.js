import { GoogleSheetsWriteService } from '../../src/services/googleSheetsWriteService.js'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

export async function handler(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { discordId, verified, rsiHandle, action } = JSON.parse(event.body)

    if (!discordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Discord ID is required' })
      }
    }

    // Log environment variables for debugging (without exposing sensitive data)
    console.log('Environment check:', {
      hasProjectId: !!process.env.GOOGLE_SHEETS_PROJECT_ID,
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      privateKeyLength: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length,
      privateKeyStart: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.substring(0, 30)
    })

    const writeService = new GoogleSheetsWriteService()

    // Handle different actions
    switch (action) {
      case 'test':
        // Test connection
        await writeService.testConnection()
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Google Sheets connection successful' 
          })
        }

      case 'get':
        // Get current verification status
        const status = await writeService.getVerificationStatus(discordId)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            data: status 
          })
        }

      case 'update':
      default:
        // Update verification status
        if (verified === undefined) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Verified status is required for update' })
          }
        }

        await writeService.updateVerificationStatus(discordId, verified, rsiHandle)
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: `Verification status updated for Discord ID: ${discordId}`,
            data: {
              discordId,
              verified,
              rsiHandle,
              timestamp: new Date().toISOString()
            }
          })
        }
    }

  } catch (error) {
    console.error('Member verification update error:', error)
    
    let errorMessage = 'Failed to update member verification'
    let statusCode = 500

    if (error.message.includes('not found')) {
      errorMessage = 'Discord user not found in Member Log'
      statusCode = 404
    } else if (error.message.includes('authentication')) {
      errorMessage = 'Google Sheets authentication failed'
      statusCode = 403
    } else if (error.message.includes('permission')) {
      errorMessage = 'Insufficient permissions for Google Sheets'
      statusCode = 403
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      })
    }
  }
}