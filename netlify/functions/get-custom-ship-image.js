exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const requestBody = JSON.parse(event.body || '{}')
    const { discordId } = requestBody

    if (!discordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Discord ID is required' })
      }
    }

    // Import the service dynamically to handle environment variables
    const { googleSheetsWriteService } = await import('../../src/services/googleSheetsWriteService.js')

    // Get custom ship image (this is a read-only operation for public viewing)
    try {
      const customShipImage = await googleSheetsWriteService.getCustomShipImage(discordId)
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          customShipImage: customShipImage || ''
        })
      }
    } catch (error) {
      console.error('Error getting custom ship image:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to get custom ship image' 
        })
      }
    }

  } catch (error) {
    console.error('Get custom ship image API error:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      })
    }
  }
}