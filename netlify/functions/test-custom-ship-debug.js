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
    console.log('Test function started')
    console.log('Environment check:', {
      hasGoogleSheetsClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasGoogleSheetsPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      hasGoogleSheetsProjectId: !!process.env.GOOGLE_SHEETS_PROJECT_ID,
      hasGoogleSpreadsheetId: !!process.env.GOOGLE_SPREADSHEET_ID
    })

    // Try to import the service
    const { googleSheetsWriteService } = await import('../../src/services/googleSheetsWriteService.js')
    console.log('Service imported successfully')

    // Try to initialize
    await googleSheetsWriteService.initialize()
    console.log('Service initialized successfully')

    // Test basic functionality
    const requestBody = JSON.parse(event.body || '{}')
    const { discordId } = requestBody

    if (discordId) {
      console.log('Testing findUserRow for:', discordId)
      const rowIndex = await googleSheetsWriteService.findUserRow(discordId)
      console.log('findUserRow result:', rowIndex)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Test completed successfully',
        debug: 'Check logs for details'
      })
    }

  } catch (error) {
    console.error('Test function error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Test failed',
        details: error.message,
        errorType: error.name
      })
    }
  }
}