export async function handler(event, context) {
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

    // For now, just return success without actually updating Google Sheets
    // This will help us test if the function deployment is working
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        discordId,
        shipValue,
        message: 'Ship selection function is working (test mode)',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Error in ship selection update:', error)
    
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