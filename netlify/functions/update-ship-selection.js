import { GoogleSheetsWriteService } from '../../src/services/googleSheetsWriteService.js'

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
      })
    }
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}')
    const { discordId, shipValue, action = 'update' } = body

    // Validate required fields
    if (!discordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required field',
          message: 'discordId is required'
        })
      }
    }

    console.log(`Ship ${action} request for Discord ID: ${discordId}, Ship: ${shipValue}`)

    // Initialize Google Sheets service
    const writeService = new GoogleSheetsWriteService()

    let result
    if (action === 'get') {
      // Get current ship selection
      result = await writeService.getShipSelection(discordId)
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          discordId,
          shipValue: result,
          message: result ? 'Ship selection retrieved successfully' : 'No ship selection found'
        })
      }
    } else {
      // Update ship selection
      if (shipValue === undefined) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Missing required field',
            message: 'shipValue is required for update action'
          })
        }
      }

      result = await writeService.updateShipSelection(discordId, shipValue)
      
      if (result) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            discordId,
            shipValue,
            message: 'Ship selection updated successfully in Member Log'
          })
        }
      } else {
        throw new Error('Failed to update ship selection')
      }
    }

  } catch (error) {
    console.error('Error in ship selection update:', error)
    
    // Handle specific error types
    if (error.message.includes('not found in Member Log')) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'User not found',
          message: error.message,
          discordId: body?.discordId
        })
      }
    }

    if (error.message.includes('Missing') && error.message.includes('environment variable')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Configuration error',
          message: 'Google Sheets service not properly configured'
        })
      }
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      })
    }
  }
}