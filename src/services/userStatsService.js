import OFSDataService from './ofsDataService'

class UserStatsService {
  static async getUserStats(discordId) {
    if (!discordId) {
      return {
        rank: 'Unknown',
        role: 'Unknown',
        path: 'Unknown',
        orgName: null,
        rankIcon: null
      }
    }

    try {
      // Fetch member data from the Google Sheets
      const memberData = await OFSDataService.getMemberData(discordId)
      
      if (!memberData) {
        console.log('No member data found for user:', discordId)
        return {
          rank: 'Recruit',
          role: 'Member',
          path: 'Unknown',
          orgName: null,
          rankIcon: null
        }
      }

      // Extract rank, role, path, and org name from the member data
      // Based on your format: Member Log: gid=2052923864, (Rank:C), (Role:D), (Path:R), (Username:B)
      const rank = memberData['Rank'] || memberData['rank'] || 'Recruit'
      const role = memberData['Role'] || memberData['role'] || 'Member'
      const path = memberData['R'] || memberData['r'] || memberData['Path'] || 'Unknown'
      const orgName = memberData['B'] || memberData['b'] || memberData['Username'] || null

      // Get rank icon from Ranks sheet
      const rankName = this.formatRank(rank)
      console.log('Looking up rank:', rankName)
      
      const rankData = await OFSDataService.getRankData(rankName)
      console.log('Rank data found:', rankData)
      
      let rankIcon = null
      if (rankData) {
        const rawIconUrl = rankData['Rank icon'] || rankData['Rank Icon'] || rankData['C'] || rankData['rank icon']
        console.log('Raw icon URL:', rawIconUrl)
        rankIcon = this.convertGoogleDriveUrl(rawIconUrl)
        console.log('Converted icon URL:', rankIcon)
      }

      return {
        rank: rankName,
        role: this.formatRole(role),
        path: this.formatPath(path),
        orgName: orgName,
        rankIcon: rankIcon
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        rank: 'Unknown',
        role: 'Unknown',
        path: 'Unknown',
        orgName: null,
        rankIcon: null
      }
    }
  }

  static formatRank(rank) {
    // Map rank codes to display names
    const rankMap = {
      'A': 'Primarch',
      'B': 'Champion',
      'C': 'Knight',
      'D': 'Squire',
      'E': 'Recruit'
    }
    
    return rankMap[rank] || rank || 'Recruit'
  }

  static formatRole(role) {
    // Map role codes to display names
    const roleMap = {
      'A': 'Command',
      'B': 'Combat',
      'C': 'Pilot',
      'D': 'Support',
      'E': 'Member'
    }
    
    return roleMap[role] || role || 'Member'
  }

  static formatPath(path) {
    // Map path codes to display names
    const pathMap = {
      'A': 'Command',
      'B': 'Tactical',
      'C': 'Support',
      'D': 'Specialist',
      'E': 'Explorer'
    }
    
    return pathMap[path] || path || 'Unknown'
  }

  static convertGoogleDriveUrl(url) {
    if (!url) {
      console.log('No URL provided for conversion')
      return null
    }
    
    console.log('Converting URL:', url)
    
    // Convert Google Drive share URLs to direct image URLs
    // Try multiple formats for better compatibility
    
    let fileId = null
    
    // Format 1: /file/d/FILE_ID/view
    let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (match) {
      fileId = match[1]
    }
    
    // Format 2: id=FILE_ID
    if (!fileId) {
      match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
      if (match) {
        fileId = match[1]
      }
    }
    
    if (fileId) {
      // Try the thumbnail format first (more reliable for public files)
      const convertedUrl = `https://lh3.googleusercontent.com/d/${fileId}=s75-c`
      console.log('Converted to thumbnail format:', convertedUrl)
      return convertedUrl
    }
    
    console.log('Could not extract file ID, returning original URL')
    return url
  }

  static async getUserProfile(discordId) {
    try {
      const [memberData, patrolData, stats] = await Promise.all([
        OFSDataService.getMemberData(discordId),
        OFSDataService.getPatrolData(discordId),
        this.getUserStats(discordId)
      ])

      return {
        memberData,
        patrolData,
        stats,
        formattedStats: {
          ...stats,
          path: stats.path
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }
}

export default UserStatsService
