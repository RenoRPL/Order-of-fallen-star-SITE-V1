import jwt from 'jsonwebtoken'

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: ''
    }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  try {
    // Get Discord ID from request body instead of JWT token
    const requestBody = JSON.parse(event.body || '{}')
    const { customShipImage, discordId } = requestBody

    console.log('Request received:', {
      method: event.httpMethod,
      body: event.body,
      parsedBody: requestBody,
      discordId,
      customShipImage: customShipImage ? 'provided' : 'not provided'
    })

    if (!discordId) {
      console.error('Missing Discord ID in request')
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Discord ID is required' })
      }
    }

    // Import the service dynamically to handle environment variables
    const { googleSheetsWriteService } = await import('../../src/services/googleSheetsWriteService.js')

    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET':
        // Get current custom ship image
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

      case 'POST':
      case 'PUT':
        // Update custom ship image
        try {
          if (customShipImage !== undefined) {
            await googleSheetsWriteService.updateCustomShipImage(discordId, customShipImage)
            console.log('Custom ship image updated successfully for Discord ID:', discordId)
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Custom ship image updated successfully'
            })
          }
        } catch (error) {
          console.error('Error updating custom ship image:', error)
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            discordId,
            customShipImage: customShipImage ? 'provided' : 'not provided'
          })
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: 'Failed to update custom ship image',
              details: error.message
            })
          }
        }

      case 'DELETE':
        // Remove custom ship image
        try {
          await googleSheetsWriteService.updateCustomShipImage(discordId, '')
          console.log('Custom ship image removed successfully for Discord ID:', discordId)
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Custom ship image removed successfully'
            })
          }
        } catch (error) {
          console.error('Error removing custom ship image:', error)
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: 'Failed to remove custom ship image' 
            })
          }
        }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }

  } catch (error) {
    console.error('Custom ship image API error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      }
    }

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