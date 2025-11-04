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
    const { title, content, category = 'General', author = 'Unknown', tags = [] } = body

    // Validate required fields
    if (!title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          message: 'Title and content are required'
        })
      }
    }

    console.log(`Adding new codex entry: ${title}`)

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
    
    // Generate a unique ID for the entry
    const timestamp = new Date().toISOString()
    const entryId = `codex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Prepare the row data
    // Columns: A: ID, B: Title, C: Content, D: Category, E: Author, F: Date Created, G: Last Modified, H: Tags
    const rowData = [
      entryId,
      title,
      content,
      category || 'General',
      author || 'Unknown',
      timestamp,
      timestamp,
      Array.isArray(tags) ? tags.join(', ') : (tags || '')
    ]

    try {
      // First, check if the Codex sheet exists, if not create it
      try {
        await sheetsService.sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: `${codexSheetName}!A1:A1`,
        })
      } catch (sheetError) {
        if (sheetError.message.includes('not found') || sheetError.message.includes('does not exist')) {
          console.log('Codex sheet not found, creating it...')
          
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
          
          console.log('Codex sheet created with headers')
        } else {
          throw sheetError
        }
      }

      // Add the new entry to the sheet
      const appendResult = await sheetsService.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: `${codexSheetName}!A:H`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [rowData]
        }
      })

      console.log('Codex entry added successfully:', entryId)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          entryId: entryId,
          message: 'Codex entry added successfully',
          entry: {
            id: entryId,
            title: title,
            content: content,
            category: category,
            author: author,
            dateCreated: timestamp,
            lastModified: timestamp,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
          }
        })
      }

    } catch (sheetsError) {
      console.error('Error working with Google Sheets:', sheetsError)
      throw new Error(`Google Sheets error: ${sheetsError.message}`)
    }

  } catch (error) {
    console.error('Error adding codex entry:', error)
    
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