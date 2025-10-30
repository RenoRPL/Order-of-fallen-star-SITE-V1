const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { imageData } = JSON.parse(event.body);
    
    if (!imageData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    // Check if Cloudinary is configured
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      console.error('Cloudinary not configured - CLOUDINARY_URL environment variable missing');
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'Image upload service not configured',
          message: 'Administrator needs to configure Cloudinary service'
        })
      };
    }

    // Extract cloudinary config from URL
    const url = new URL(cloudinaryUrl);
    const cloudName = url.hostname.split('.')[0];
    const apiKey = url.username;
    const apiSecret = url.password;

    // Convert base64 to Buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Create form data for Cloudinary upload
    const formData = new URLSearchParams();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    formData.append('upload_preset', 'ml_default'); // You'll need to create this preset in Cloudinary
    
    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Upload failed',
          details: errorText
        })
      };
    }

    const result = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl: result.secure_url,
        deleteHash: result.public_id, // Can be used to delete the image later
        service: 'cloudinary'
      })
    };

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};