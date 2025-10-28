import { GoogleSheetsWriteService } from '../../src/services/googleSheetsWriteService.js'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

export async function handler(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    console.log('=== DIAGNOSTIC FUNCTION STARTED ===')
    
    // Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.GOOGLE_SHEETS_PROJECT_ID,
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      privateKeyLength: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length,
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
    }
    
    console.log('Environment check:', envCheck)
    
    // Try to initialize the service
    const writeService = new GoogleSheetsWriteService()
    console.log('Service created successfully')
    
    // Test basic initialization
    try {
      await writeService.initialize()
      console.log('Service initialized successfully')
      
      // Try to find a test user row
      const testDiscordId = '527694877773922324'
      console.log('Testing user lookup for:', testDiscordId)
      
      const rowIndex = await writeService.findUserRow(testDiscordId)
      console.log('User row found at index:', rowIndex)
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          environment: envCheck,
          userRowIndex: rowIndex,
          message: 'All tests passed successfully'
        })
      }
      
    } catch (initError) {
      console.error('Initialization error:', initError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Initialization failed',
          details: initError.message,
          environment: envCheck
        })
      }
    }
    
  } catch (error) {
    console.error('Diagnostic function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Diagnostic function failed',
        details: error.message,
        stack: error.stack
      })
    }
  }
}