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
      
      // If sheet doesn't exist, create it with a sample entry
      if (sheetError.message.includes('not found') || 
          sheetError.message.includes('does not exist') || 
          sheetError.message.includes('Unable to parse range')) {
        
        console.log('Creating Codex sheet with sample data...')
        
        try {
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
          
          // Add headers and sample data
          const headers = [
            'ID', 'Title', 'Content', 'Category', 'Author', 'Date Created', 'Last Modified', 'Tags'
          ]
          
          const sampleEntry = [
            'codex_sample_1',
            'Welcome to the Order of the Fallen Star Codex',
            'This is the official codex of the Order of the Fallen Star. Here you will find our laws, procedures, history, and important organizational documents.\n\nThis system allows authorized administrators to:\n- Add new documents and entries\n- Edit existing content\n- Organize content by categories\n- Tag documents for easy searching\n\nAll members can browse and search through the codex to find the information they need.',
            'Introduction',
            'Order Administration',
            new Date().toISOString(),
            new Date().toISOString(),
            'introduction, welcome, getting-started, administration'
          ]
          
          await sheetsService.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: `${codexSheetName}!A1:H2`,
            valueInputOption: 'RAW',
            resource: {
              values: [headers, sampleEntry]
            }
          })
          
          console.log('Codex sheet created successfully with sample data')
          
          // Return the sample data
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify([{
              id: sampleEntry[0],
              title: sampleEntry[1],
              content: sampleEntry[2],
              category: sampleEntry[3],
              author: sampleEntry[4],
              dateCreated: sampleEntry[5],
              lastModified: sampleEntry[6],
              tags: sampleEntry[7].split(',').map(tag => tag.trim())
            }])
          }
          
        } catch (createError) {
          console.error('Failed to create Codex sheet:', createError)
          // Return empty array instead of error
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify([])
          }
        }
      }
      
      // For other errors, return empty array
      console.error('Unknown sheet error:', sheetError)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      }
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