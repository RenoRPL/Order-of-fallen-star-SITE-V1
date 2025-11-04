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
    const { discordId } = body

    // Validate required fields
    if (!discordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required field',
          message: 'discordId is required'
        })
      }
    }

    console.log(`Admin check request for Discord ID: ${discordId}`)

    // Use CSV approach to read admin whitelist (gid=1724779249)
    const spreadsheetId = '12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8'
    const adminSheetGid = '1724779249'
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${adminSheetGid}`
    
    console.log(`Fetching admin whitelist from CSV URL: ${csvUrl}`)
    
    // Fetch admin data via CSV
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch admin data: ${response.status} ${response.statusText}`)
    }
    
    const csvText = await response.text()
    console.log('CSV Response length:', csvText.length)
    
    // Parse CSV data
    const rows = csvText.split('\n').map(row => 
      row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
    )
    
    if (rows.length === 0) {
      console.log('No admin data found')
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          isAdmin: false,
          message: 'Admin whitelist not found'
        })
      }
    }

    // Skip header row and check if Discord ID exists in column B
    const admins = rows.slice(1).filter(row => row.length >= 2) // Skip header row and filter valid rows
    const isAdmin = admins.some(row => {
      const adminDiscordId = row[1] // Column B (Discord ID)
      return adminDiscordId && adminDiscordId.toString().trim() === discordId.toString().trim()
    })

    console.log(`Admin check result for ${discordId}: ${isAdmin}`)

    if (isAdmin) {
      // Find admin details
      const adminRecord = admins.find(row => 
        row[1] && row[1].toString().trim() === discordId.toString().trim()
      )
      const adminName = adminRecord ? adminRecord[0] : 'Unknown' // Column A (Name)
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          isAdmin: true,
          adminName: adminName,
          message: 'Admin access granted'
        })
      }
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          isAdmin: false,
          message: 'Not an admin'
        })
      }
    }

  } catch (error) {
    console.error('Admin check error:', error)
    
    // Return a detailed error for debugging
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