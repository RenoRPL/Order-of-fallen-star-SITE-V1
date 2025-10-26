import OFSDataService from './ofsDataService'

class UserStatsService {
  static async getUserStats(discordId) {
    console.log('getUserStats called with discordId:', discordId)
    
    if (!discordId) {
      console.log('No discordId provided')
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
      console.log('Fetching member data for:', discordId)
      const memberData = await OFSDataService.getMemberData(discordId)
      console.log('Member data result:', memberData)
      
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
      console.log('Available columns in member data:', Object.keys(memberData))
      
      const rank = memberData['Rank'] || memberData['rank'] || 'Recruit'
      const role = memberData['Role'] || memberData['role'] || 'Member'
      const path = memberData['R'] || memberData['r'] || memberData['Role Path'] || memberData['role path'] || memberData['Path'] || memberData['path'] || 'Unknown'
      const orgName = memberData['B'] || memberData['b'] || memberData['Username'] || memberData['username'] || null

      console.log('Extracted data - Rank:', rank, 'Role:', role, 'Path:', path, 'OrgName:', orgName)

      // Get rank icon from local assets instead of Google Drive
      const rankName = this.formatRank(rank)
      console.log('Looking up rank:', rankName)
      
      // Use local rank icon from /Ranks folder
      const rankIcon = `/Ranks/${rankName}.png`
      console.log('Using local rank icon:', rankIcon)

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
