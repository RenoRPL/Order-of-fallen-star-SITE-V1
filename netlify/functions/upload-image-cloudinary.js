import fetch from 'node-fetch';

export const handler = async (event, context) => {
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
    
    // Create form data for Cloudinary upload using signed upload (no preset needed)
    const timestamp = Math.round(Date.now() / 1000);
    
    // Create signature for signed upload
    const crypto = await import('crypto');
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
    
    const formData = new URLSearchParams();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    
    console.log('Uploading to Cloudinary with signed upload');
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary signed upload failed:', response.status, errorText);
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
    console.log('Cloudinary upload successful:', result.secure_url);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl: result.secure_url,
        deleteHash: result.public_id,
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