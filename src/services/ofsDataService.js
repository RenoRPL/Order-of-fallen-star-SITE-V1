// Service to fetch data from OFS Google Sheets
const MEMBER_LOG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=2052923864&single=true&output=csv'
const PATROLS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=1963239464&single=true&output=csv'

class OFSDataService {
  static async fetchCSV(url) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`)
      }
      const csvText = await response.text()
      return this.parseCSV(csvText)
    } catch (error) {
      console.error('Error fetching CSV:', error)
      throw error
    }
  }

  static parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []

    const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim())
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length === headers.length) {
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.replace(/"/g, '').trim() || ''
        })
        data.push(row)
      }
    }

    return data
  }

  static parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  static async getMemberData(discordId) {
    try {
      const members = await this.fetchCSV(MEMBER_LOG_URL)
      return members.find(member => member['User ID'] === discordId) || null
    } catch (error) {
      console.error('Error fetching member data:', error)
      return null
    }
  }

  static async getPatrolData(discordId) {
    try {
      const patrols = await this.fetchCSV(PATROLS_URL)
      return patrols.filter(patrol => 
        patrol['Patrol Leader ID'] === discordId || 
        patrol['Player ID'] === discordId
      )
    } catch (error) {
      console.error('Error fetching patrol data:', error)
      return []
    }
  }

  static async getAllMemberData() {
    try {
      return await this.fetchCSV(MEMBER_LOG_URL)
    } catch (error) {
      console.error('Error fetching all member data:', error)
      return []
    }
  }

  static async getAllPatrolData() {
    try {
      return await this.fetchCSV(PATROLS_URL)
    } catch (error) {
      console.error('Error fetching all patrol data:', error)
      return []
    }
  }

  static calculateTimeInService(joinDate) {
    if (!joinDate || joinDate === '#NUM!' || joinDate === '') return 'Unknown'
    
    try {
      const join = new Date(joinDate)
      const now = new Date()
      const diffTime = Math.abs(now - join)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const years = Math.floor(diffDays / 365)
      const months = Math.floor((diffDays % 365) / 30)
      const days = diffDays % 30
      
      if (years > 0) {
        return `${years}y ${months}m`
      } else if (months > 0) {
        return `${months}m ${days}d`
      } else {
        return `${days} days`
      }
    } catch (error) {
      return 'Unknown'
    }
  }

  static formatPatrolStats(patrols) {
    const stats = {
      totalPatrols: 0,
      patrolsLed: 0,
      totalQuests: 0,
      totalFPSKills: 0,
      totalShipKills: 0,
      totalCrusades: 0
    }

    patrols.forEach(patrol => {
      if (patrol['Patrol Leader ID'] && patrol['Player ID']) {
        stats.totalPatrols++
        
        if (patrol['Patrol Leader ID'] === patrol['Player ID']) {
          stats.patrolsLed++
        }
        
        const quests = parseInt(patrol['Quest']) || 0
        const fpsKills = parseInt(patrol['Fps kills']) || 0
        const shipKills = parseInt(patrol['Ship kills']) || 0
        const crusades = parseInt(patrol['Crusades']) || 0
        
        stats.totalQuests += quests
        stats.totalFPSKills += fpsKills
        stats.totalShipKills += shipKills
        stats.totalCrusades += crusades
      }
    })

    return stats
  }
}

export default OFSDataService
