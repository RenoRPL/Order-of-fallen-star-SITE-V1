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
    
    // Create form data for Cloudinary upload
    const formData = new URLSearchParams();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    
    // Try multiple preset names in case the user named it differently
    const presetNames = ['ml_default', 'unsigned', 'default', 'upload'];
    let lastPresetError = null;
    
    for (const presetName of presetNames) {
      try {
        const tempFormData = new URLSearchParams();
        tempFormData.append('file', `data:image/jpeg;base64,${base64Data}`);
        tempFormData.append('upload_preset', presetName);
        
        console.log(`Trying Cloudinary preset: ${presetName}`);
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: tempFormData
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Cloudinary upload successful with preset: ${presetName}`);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              imageUrl: result.secure_url,
              deleteHash: result.public_id,
              service: 'cloudinary',
              preset: presetName
            })
          };
        } else {
          const errorText = await response.text();
          lastPresetError = errorText;
          console.warn(`Preset ${presetName} failed:`, errorText);
          continue;
        }
      } catch (error) {
        lastPresetError = error.message;
        console.warn(`Preset ${presetName} error:`, error);
        continue;
      }
    }
    
    // All presets failed
    console.error('All Cloudinary presets failed. Last error:', lastPresetError);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Upload failed',
        details: `All presets failed. Last error: ${lastPresetError}. Please create an unsigned upload preset in Cloudinary settings.`
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