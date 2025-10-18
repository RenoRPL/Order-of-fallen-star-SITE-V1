exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { code, redirect_uri } = JSON.parse(event.body)
    
    if (!code || !redirect_uri) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      }
    }

    // Discord OAuth token exchange
    const discordResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        scope: 'identify guilds'
      })
    })

    if (!discordResponse.ok) {
      const errorData = await discordResponse.text()
      console.error('Discord API Error:', errorData)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to exchange code for token' })
      }
    }

    const tokenData = await discordResponse.json()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify(tokenData)
    }

  } catch (error) {
    console.error('Token exchange error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
