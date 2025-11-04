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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      })
    }
  }

  try {
    console.log('Fetching codex entries from Google Sheets')

    // Use CSV approach to read codex data from a dedicated sheet
    // For now, we'll create a new sheet called "Codex" in the same spreadsheet
    const spreadsheetId = '12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8'
    
    // Let's try to get the Codex sheet - we'll need to create a sheet with specific columns:
    // A: ID, B: Title, C: Content, D: Category, E: Author, F: Date Created, G: Last Modified, H: Tags
    const codexSheetName = 'Codex'
    
    // Import Google Sheets service dynamically to read from the Codex sheet
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

    // Try to read from the Codex sheet
    let codexData
    try {
      const response = await sheetsService.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${codexSheetName}!A:H`, // All columns from A to H
      })
      
      codexData = response.data.values || []
    } catch (sheetError) {
      console.log('Codex sheet not found or error reading:', sheetError.message)
      
      // If sheet doesn't exist, return empty array
      if (sheetError.message.includes('not found') || sheetError.message.includes('does not exist')) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        }
      }
      
      throw sheetError
    }
    
    if (!codexData || codexData.length === 0) {
      console.log('No codex data found')
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      }
    }

    // Skip header row and parse the data
    const entries = codexData.slice(1).map((row, index) => {
      // Handle rows that might have fewer columns
      const [id, title, content, category, author, dateCreated, lastModified, tags] = row
      
      return {
        id: id || `entry_${index + 1}`,
        title: title || 'Untitled Document',
        content: content || '',
        category: category || 'General',
        author: author || 'Unknown',
        dateCreated: dateCreated || new Date().toISOString(),
        lastModified: lastModified || new Date().toISOString(),
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      }
    }).filter(entry => entry.title && entry.content) // Only include entries with title and content

    console.log(`Found ${entries.length} codex entries`)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(entries)
    }

  } catch (error) {
    console.error('Error fetching codex entries:', error)
    
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