import OFSDataService from './ofsDataService'

class UserStatsService {
  static async getUserStats(discordId) {
    if (!discordId) {
      return {
        rank: 'Unknown',
        role: 'Unknown',
        points: 0
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
          points: 0
        }
      }

      // Extract rank and role from the member data
      // Based on your format: Member Log: gid=2052923864, (Rank:C) and (Role:D)
      const rank = memberData['Rank'] || memberData['rank'] || 'Recruit'
      const role = memberData['Role'] || memberData['role'] || 'Member'
      
      // Calculate points from patrol stats if available
      const patrolStats = await OFSDataService.getPatrolStats(discordId)
      let points = 0
      
      if (patrolStats) {
        // Calculate points based on activities
        const quests = parseInt(patrolStats['Total Quests']) || 0
        const fpsKills = parseInt(patrolStats['Total FPS Kills']) || 0
        const shipKills = parseInt(patrolStats['Total Ship Kills']) || 0
        const crusades = parseInt(patrolStats['Total Crusades']) || 0
        
        // Point calculation formula (you can adjust these values)
        points = (quests * 50) + (fpsKills * 10) + (shipKills * 25) + (crusades * 100)
      }

      return {
        rank: this.formatRank(rank),
        role: this.formatRole(role),
        points: points
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        rank: 'Unknown',
        role: 'Unknown',
        points: 0
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

  static formatPoints(points) {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`
    }
    return points.toString()
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
          points: this.formatPoints(stats.points)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }
}

export default UserStatsService
