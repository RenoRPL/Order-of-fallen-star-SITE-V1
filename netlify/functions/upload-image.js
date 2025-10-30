const FormData = require('form-data')
const fetch = require('node-fetch')

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

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

  try {
    // Parse the multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1]
    if (!boundary) {
      throw new Error('No boundary found in content-type header')
    }

    // Extract the image data from the body
    const body = Buffer.from(event.body, 'base64')
    const parts = body.toString('binary').split(`--${boundary}`)
    
    let imageData = null
    let contentType = null

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data; name="image"')) {
        // Extract filename and content type
        const filenameMatch = part.match(/filename="([^"]*)"/)
        const contentTypeMatch = part.match(/Content-Type: ([^\r\n]*)/)
        
        if (contentTypeMatch) {
          contentType = contentTypeMatch[1]
        }

        // Find the start of the binary data (after double CRLF)
        const dataStart = part.indexOf('\r\n\r\n') + 4
        if (dataStart > 3) {
          const dataEnd = part.lastIndexOf('\r\n')
          imageData = Buffer.from(part.slice(dataStart, dataEnd), 'binary')
        }
        break
      }
    }

    if (!imageData) {
      throw new Error('No image data found in request')
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(contentType)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.' })
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageData.length > maxSize) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'File too large. Maximum size is 5MB.' })
      }
    }

    // Upload to Imgur
    const imgur_client_id = process.env.IMGUR_CLIENT_ID
    if (!imgur_client_id) {
      throw new Error('Imgur client ID not configured')
    }

    const formData = new FormData()
    formData.append('image', imageData.toString('base64'))
    formData.append('type', 'base64')

    const imgurResponse = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${imgur_client_id}`,
        ...formData.getHeaders()
      },
      body: formData
    })

    const imgurResult = await imgurResponse.json()

    if (imgurResult.success) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          success: true,
          url: imgurResult.data.link,
          deleteHash: imgurResult.data.deletehash // Store this for potential deletion
        })
      }
    } else {
      throw new Error(`Imgur upload failed: ${imgurResult.data?.error || 'Unknown error'}`)
    }

  } catch (error) {
    console.error('Image upload error:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to upload image. Please try again.'
      })
    }
  }
}