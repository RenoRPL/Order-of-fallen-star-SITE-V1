import { MemberVerificationService } from '../../src/services/memberVerificationService.js'

// Headers for CORS and RSI scraping
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { rsiHandle, discordId } = JSON.parse(event.body)

    if (!rsiHandle || !discordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'RSI handle and Discord ID are required',
          verified: false 
        })
      }
    }

    console.log(`Verifying RSI handle: ${rsiHandle} for Discord ID: ${discordId}`)

    // Step 1: Check if user exists in our Discord Member Log database
    const memberData = await verifyDiscordMember(discordId)
    if (!memberData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Discord member not found in Order of the Fallen Star Member Log. Please ensure you are a registered Discord member.',
          verified: false 
        })
      }
    }

    console.log('Discord member found:', memberData)

    // Step 2: Scrape RSI profile to verify organization membership
    const rsiData = await scrapeRSIProfile(rsiHandle)
    if (!rsiData.success) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: rsiData.error,
          verified: false 
        })
      }
    }

    // Step 3: Verify they're in Order of the Fallen Star
    const isInOFS = verifyOFSMembership(rsiData.profile)
    if (!isInOFS) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'RSI account is not a member of Order of the Fallen Star organization',
          verified: false,
          rsiProfile: rsiData.profile
        })
      }
    }

    // Success! Return verified profile data and update verification status
    try {
      // Update the member's verification status in the spreadsheet
      const memberService = new MemberVerificationService()
      await memberService.updateVerificationStatus(discordId, true)
      console.log('Updated member verification status to true')
    } catch (updateError) {
      console.warn('Failed to update verification status:', updateError.message)
      // Don't fail the whole process if we can't update the sheet
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        verified: true,
        rsiProfile: rsiData.profile,
        memberData: memberData,
        message: `RSI account successfully verified! Welcome ${rsiData.profile.handle}, ${rsiData.profile.organizationRank || 'Member'} of Order of the Fallen Star.`
      })
    }

  } catch (error) {
    console.error('RSI verification error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error during verification',
        verified: false 
      })
    }
  }
}

// Check if Discord user exists in our Member Log database
async function verifyDiscordMember(discordId) {
  try {
    const memberService = new MemberVerificationService()
    const memberData = await memberService.verifyDiscordMember(discordId)
    
    if (memberData) {
      console.log('Discord member verification successful:', {
        discordId: memberData.discordId,
        username: memberData.username,
        isVerified: memberData.isVerified,
        rank: memberData.rank
      })
      return memberData
    }
    
    console.log('Discord member not found in Member Log for ID:', discordId)
    return null
    
  } catch (error) {
    console.error('Discord member verification error:', error)
    return null
  }
}

// Scrape RSI citizen profile
async function scrapeRSIProfile(handle) {
  try {
    const url = `https://robertsspaceindustries.com/citizens/${handle}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { 
          success: false, 
          error: `RSI citizen "${handle}" not found. Please check the handle spelling.` 
        }
      }
      return { 
        success: false, 
        error: `Failed to fetch RSI profile (${response.status})` 
      }
    }

    const html = await response.text()
    
    // Extract profile data using regex patterns
    const profile = extractProfileData(html, handle)
    
    if (!profile.handle) {
      return { 
        success: false, 
        error: 'Could not parse RSI profile data' 
      }
    }

    return { success: true, profile }

  } catch (error) {
    console.error('RSI scraping error:', error)
    return { 
      success: false, 
      error: 'Failed to access RSI website. Please try again later.' 
    }
  }
}

// Extract profile data from HTML
function extractProfileData(html, handle) {
  const profile = {
    handle: handle,
    mainOrganization: null,
    organizationRank: null,
    citizenRecord: null,
    enlisted: null,
    location: null
  }

  try {
    // Extract main organization
    const orgMatch = html.match(/MAIN ORGANIZATION[\s\S]*?<a[^>]*href="\/orgs\/([^"]*)"[^>]*>\s*([^<]+)<\/a>/i)
    if (orgMatch) {
      profile.mainOrganization = orgMatch[2].trim()
      profile.organizationSID = orgMatch[1].trim()
    }

    // Extract organization rank
    const rankMatch = html.match(/Organization rank\s*([^<\s]+)/i)
    if (rankMatch) {
      profile.organizationRank = rankMatch[1].trim()
    }

    // Extract citizen record
    const recordMatch = html.match(/UEE Citizen Record[#\s]*([^\s<]+)/i)
    if (recordMatch && recordMatch[1] !== 'n/a') {
      profile.citizenRecord = recordMatch[1].trim()
    }

    // Extract enlisted date
    const enlistedMatch = html.match(/Enlisted\s*([^<]+)/i)
    if (enlistedMatch) {
      profile.enlisted = enlistedMatch[1].trim()
    }

    // Extract location
    const locationMatch = html.match(/Location\s*([^<]+)/i)
    if (locationMatch) {
      profile.location = locationMatch[1].trim()
    }

    console.log('Extracted profile:', profile)
    return profile

  } catch (error) {
    console.error('Profile parsing error:', error)
    return profile
  }
}

// Verify Order of the Fallen Star membership
function verifyOFSMembership(profile) {
  if (!profile.mainOrganization) {
    return false
  }

  // Check for exact organization name match
  const orgName = profile.mainOrganization.toLowerCase()
  const validOrgNames = [
    'order of the fallen star',
    'fallen star',
    'ofs'
  ]

  // Check organization SID
  const validSIDs = ['FALLSTR', 'fallstr']
  
  const hasValidName = validOrgNames.some(name => orgName.includes(name))
  const hasValidSID = profile.organizationSID && validSIDs.includes(profile.organizationSID)

  return hasValidName || hasValidSID
}