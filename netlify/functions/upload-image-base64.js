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

    // Check image size (base64 is ~33% larger than original)
    const imageSizeBytes = (imageData.length * 3) / 4;
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit for Google Sheets

    if (imageSizeBytes > maxSizeBytes) {
      return {
        statusCode: 413,
        headers,
        body: JSON.stringify({ 
          error: 'Image too large',
          message: 'Please use an image smaller than 2MB when using direct storage'
        })
      };
    }

    // Return the base64 data URL directly
    // This will be stored in Google Sheets and displayed as data URL
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl: imageData, // Return the data URL directly
        deleteHash: null,
        service: 'base64'
      })
    };

  } catch (error) {
    console.error('Error processing base64 image:', error);
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