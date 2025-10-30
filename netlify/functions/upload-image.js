const fetch = require('node-fetch')

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

  try {
    console.log('Image upload request received')
    console.log('Content-Type:', event.headers['content-type'])
    console.log('Body length:', event.body ? event.body.length : 0)
    
    // Parse JSON body (expecting base64 image data)
    const requestBody = JSON.parse(event.body || '{}')
    const { imageData, contentType } = requestBody

    if (!imageData) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'No image data provided' })
      }
    }

    console.log('Image data received, content type:', contentType)

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

    // Extract base64 data (remove data URL prefix if present)
    let base64Data = imageData
    if (imageData.includes(',')) {
      base64Data = imageData.split(',')[1]
    }

    console.log('Uploading to Imgur...')

    // Upload to Imgur
    const imgur_client_id = process.env.IMGUR_CLIENT_ID
    if (!imgur_client_id) {
      console.error('Missing IMGUR_CLIENT_ID environment variable')
      throw new Error('Imgur client ID not configured')
    }

    const imgurResponse = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${imgur_client_id}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Data,
        type: 'base64'
      })
    })

    const imgurResult = await imgurResponse.json()
    console.log('Imgur response status:', imgurResponse.status)
    console.log('Imgur response:', imgurResult)

    if (imgurResult.success) {
      console.log('Image uploaded successfully:', imgurResult.data.link)
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          success: true,
          url: imgurResult.data.link,
          deleteHash: imgurResult.data.deletehash
        })
      }
    } else {
      console.error('Imgur upload failed:', imgurResult)
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