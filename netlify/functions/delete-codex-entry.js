export async function handler(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
      })
    }
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}')
    const { id } = body

    // Validate required fields
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required field',
          message: 'ID is required'
        })
      }
    }

    console.log(`Deleting codex entry: ${id}`)

    // Import Google Sheets service dynamically
    let GoogleSheetsWriteService
    try {
      const module = await import('../../src/services/googleSheetsWriteService.js')
      GoogleSheetsWriteService = module.GoogleSheetsWriteService
    } catch (importError) {
      console.error('Failed to import GoogleSheetsWriteService:', importError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Service import error',
          message: 'Failed to load Google Sheets service'
        })
      }
    }
    
    const sheetsService = new GoogleSheetsWriteService()
    await sheetsService.initialize()

    const spreadsheetId = sheetsService.spreadsheetId
    const codexSheetName = 'Codex'
    
    try {
      // First, get all data to find the row with the matching ID
      const response = await sheetsService.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${codexSheetName}!A:H`,
      })
      
      const allData = response.data.values || []
      
      if (allData.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Entry not found',
            message: 'No codex entries found'
          })
        }
      }

      // Find the row with the matching ID (column A)
      let targetRowIndex = -1
      let entryTitle = 'Unknown'
      for (let i = 1; i < allData.length; i++) { // Skip header row
        if (allData[i][0] === id) {
          targetRowIndex = i + 1 // Convert to 1-based index for Sheets API
          entryTitle = allData[i][1] || 'Unknown' // Get title for confirmation
          break
        }
      }

      if (targetRowIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Entry not found',
            message: `Codex entry with ID ${id} not found`
          })
        }
      }

      // Get the sheet ID to perform the delete operation
      const spreadsheetMetadata = await sheetsService.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      })
      
      let sheetId = null
      for (const sheet of spreadsheetMetadata.data.sheets) {
        if (sheet.properties.title === codexSheetName) {
          sheetId = sheet.properties.sheetId
          break
        }
      }

      if (sheetId === null) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Sheet not found',
            message: 'Codex sheet not found'
          })
        }
      }

      // Delete the row using batchUpdate
      const deleteRequest = {
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: targetRowIndex - 1, // Convert to 0-based index
                endIndex: targetRowIndex // End index is exclusive
              }
            }
          }]
        }
      }

      const deleteResult = await sheetsService.sheets.spreadsheets.batchUpdate(deleteRequest)

      console.log('Codex entry deleted successfully:', id)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          entryId: id,
          entryTitle: entryTitle,
          message: 'Codex entry deleted successfully'
        })
      }

    } catch (sheetsError) {
      console.error('Error working with Google Sheets:', sheetsError)
      
      if (sheetsError.message.includes('not found') || sheetsError.message.includes('does not exist')) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error: 'Sheet not found',
            message: 'Codex sheet does not exist'
          })
        }
      }
      
      throw new Error(`Google Sheets error: ${sheetsError.message}`)
    }

  } catch (error) {
    console.error('Error deleting codex entry:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}