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
    const { id, title, content, category, author, tags, imageUrl } = body

    // Validate required fields
    if (!id || !title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          message: 'ID, title, and content are required'
        })
      }
    }

    console.log(`Updating codex entry: ${id}`)

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
        range: `${codexSheetName}!A:I`,
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
      for (let i = 1; i < allData.length; i++) { // Skip header row
        if (allData[i][0] === id) {
          targetRowIndex = i + 1 // Convert to 1-based index for Sheets API
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

      // Get the existing data for this row
      const existingRow = allData[targetRowIndex - 1] // Convert back to 0-based for array access
      const originalDateCreated = existingRow[5] || new Date().toISOString()
      
      // Prepare the updated row data
      // Columns: A: ID, B: Title, C: Content, D: Category, E: Author, F: Date Created, G: Last Modified, H: Tags, I: Image URL
      const updatedRowData = [
        id, // Keep the original ID
        title,
        content,
        category || existingRow[3] || 'General',
        author || existingRow[4] || 'Unknown',
        originalDateCreated, // Keep original creation date
        new Date().toISOString(), // Update last modified
        Array.isArray(tags) ? tags.join(', ') : (tags || existingRow[7] || ''),
        imageUrl !== undefined ? imageUrl : (existingRow[8] || '')
      ]

      // Update the specific row
      const updateResult = await sheetsService.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${codexSheetName}!A${targetRowIndex}:I${targetRowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [updatedRowData]
        }
      })

      console.log('Codex entry updated successfully:', id)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          entryId: id,
          message: 'Codex entry updated successfully',
          entry: {
            id: id,
            title: title,
            content: content,
            category: category || existingRow[3] || 'General',
            author: author || existingRow[4] || 'Unknown',
            dateCreated: originalDateCreated,
            lastModified: updatedRowData[6],
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
            imageUrl: updatedRowData[8]
          }
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
    console.error('Error updating codex entry:', error)
    
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