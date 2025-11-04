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

  try {
    console.log('Testing codex connection...')

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
          message: 'Failed to load Google Sheets service',
          details: importError.message
        })
      }
    }
    
    const sheetsService = new GoogleSheetsWriteService()
    
    try {
      await sheetsService.initialize()
      console.log('Google Sheets service initialized successfully')
    } catch (initError) {
      console.error('Failed to initialize Google Sheets service:', initError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Initialization error',
          message: 'Failed to initialize Google Sheets service',
          details: initError.message
        })
      }
    }

    const spreadsheetId = sheetsService.spreadsheetId
    const codexSheetName = 'Codex'
    
    console.log(`Testing access to spreadsheet: ${spreadsheetId}`)

    try {
      // First, get all sheets in the spreadsheet
      const spreadsheetMetadata = await sheetsService.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      })
      
      const existingSheets = spreadsheetMetadata.data.sheets.map(sheet => sheet.properties.title)
      console.log('Existing sheets:', existingSheets)
      
      const codexSheetExists = existingSheets.includes(codexSheetName)
      console.log(`Codex sheet exists: ${codexSheetExists}`)
      
      if (!codexSheetExists) {
        console.log('Creating Codex sheet...')
        
        // Create the Codex sheet with headers
        const addSheetRequest = {
          spreadsheetId: spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: codexSheetName,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 8
                  }
                }
              }
            }]
          }
        }
        
        await sheetsService.sheets.spreadsheets.batchUpdate(addSheetRequest)
        console.log('Codex sheet created successfully')
        
        // Add headers to the new sheet
        const headers = [
          'ID', 'Title', 'Content', 'Category', 'Author', 'Date Created', 'Last Modified', 'Tags'
        ]
        
        await sheetsService.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: `${codexSheetName}!A1:H1`,
          valueInputOption: 'RAW',
          resource: {
            values: [headers]
          }
        })
        
        console.log('Headers added to Codex sheet')
        
        // Add a sample entry
        const sampleEntry = [
          'codex_sample_1',
          'Welcome to the Codex',
          'This is a sample entry in the Order of the Fallen Star Codex. This system allows admins to add, edit, and manage organizational documents.\n\nYou can:\n- Add new documents\n- Edit existing content\n- Organize by categories\n- Search through content\n- Tag documents for easy finding',
          'Introduction',
          'System Administrator',
          new Date().toISOString(),
          new Date().toISOString(),
          'welcome, introduction, getting-started'
        ]
        
        await sheetsService.sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: `${codexSheetName}!A:H`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [sampleEntry]
          }
        })
        
        console.log('Sample entry added to Codex sheet')
      }
      
      // Try to read data from the sheet
      const response = await sheetsService.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${codexSheetName}!A:H`,
      })
      
      const codexData = response.data.values || []
      console.log(`Found ${codexData.length} rows in Codex sheet`)
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Codex connection test successful',
          details: {
            spreadsheetId: spreadsheetId,
            sheetExists: codexSheetExists,
            existingSheets: existingSheets,
            rowCount: codexData.length,
            hasData: codexData.length > 1 // More than just headers
          }
        })
      }
      
    } catch (sheetError) {
      console.error('Error accessing sheets:', sheetError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Sheet access error',
          message: sheetError.message,
          details: sheetError.toString()
        })
      }
    }

  } catch (error) {
    console.error('General error in test:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'General error',
        message: error.message,
        details: error.toString()
      })
    }
  }
}