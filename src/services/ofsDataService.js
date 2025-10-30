// Service to fetch data from OFS Google Sheets
const MEMBER_LOG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=2052923864&single=true&output=csv'
const PATROLS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=1963239464&single=true&output=csv'
const RANKS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=1671642684&single=true&output=csv'
const PATROL_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=1245860458&single=true&output=csv'
const PATHS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=1288322893&single=true&output=csv'
const WHAT_WE_OFFER_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=1449801333&single=true&output=csv'
const SHIP_REGISTRY_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdOU0QnP7yNSblFlVbYOyG1van4dlnt2Xy5v9flJpgLu5OMZDQgLdy_bOgV97Dm2HdYHPKsrXz_b2o/pub?gid=1333995409&single=true&output=csv'

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

  static async getPatrolStats(discordId) {
    try {
      const patrolStats = await this.fetchCSV(PATROL_STATS_URL)
      return patrolStats.find(stats => stats.UserID === discordId) || null
    } catch (error) {
      console.error('Error fetching patrol stats:', error)
      return null
    }
  }

  static async getRankData(rankName) {
    try {
      const ranks = await this.fetchCSV(RANKS_URL)
      return ranks.find(rank => rank['Rank Name'] === rankName) || null
    } catch (error) {
      console.error('Error fetching rank data:', error)
      return null
    }
  }

  static async getAllRanks() {
    try {
      return await this.fetchCSV(RANKS_URL)
    } catch (error) {
      console.error('Error fetching all ranks:', error)
      return []
    }
  }

  static async getAllPaths() {
    try {
      const pathsData = await this.fetchCSV(PATHS_URL)
      
      // Transform the data to match our expected format
      return pathsData.map(path => ({
        title: path['Path Name'] || path.A || '',
        subtitle: path['Path Info'] || path.C || '',
        description: path['Path Body'] || path.D || '',
        image: `/Role Path/${path['Path Name'] || path.A || 'default'}.jpg`,
        heroImage: `/Role Path/${path['Path Name'] || path.A || 'default'} - Hero.png`
      })).filter(path => path.title) // Filter out empty rows
    } catch (error) {
      console.error('Error fetching paths:', error)
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
      totalCrusades: 0,
      currentQuests: [],
      completedQuests: []
    }

    const questsMap = new Map()

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

        // Track quest progress
        const questName = patrol['Patrol Name'] || 'Unknown Quest'
        const questCompleted = patrol['Quest Completed'] === '2025-10-17 22:48:14' || patrol['Quest Completed']
        
        if (!questsMap.has(questName)) {
          questsMap.set(questName, {
            name: questName,
            description: patrol['Patrol Description'] || '',
            completed: questCompleted,
            lastActivity: patrol['Patrol Start Time'],
            image: patrol['Patrol Image'] || ''
          })
        }
      }
    })

    // Separate current and completed quests
    questsMap.forEach(quest => {
      if (quest.completed) {
        stats.completedQuests.push(quest)
      } else {
        stats.currentQuests.push(quest)
      }
    })

    return stats
  }

  static async getTotalPatrolCount() {
    try {
      const patrolStats = await this.fetchCSV(PATROL_STATS_URL)
      let totalCount = 0
      
      patrolStats.forEach(user => {
        const patrolCount = parseInt(user.PatrolCount) || 0
        totalCount += patrolCount
      })
      
      return totalCount
    } catch (error) {
      console.error('Error fetching total patrol count:', error)
      return 0
    }
  }

  static async getActiveMemberCount() {
    try {
      const memberLog = await this.fetchCSV(MEMBER_LOG_URL)
      let activeCount = 0
      
      memberLog.forEach(member => {
        // Check if member has a rank (not empty/null)
        const rank = member.RankC || member.Rank || ''
        if (rank.trim() !== '') {
          activeCount++
        }
      })
      
      return activeCount
    } catch (error) {
      console.error('Error fetching active member count:', error)
      return 0
    }
  }

  static async getWhatWeOffer() {
    try {
      const offerData = await this.fetchCSV(WHAT_WE_OFFER_URL)
      const features = []
      
      offerData.forEach(item => {
        const name = item.Name || ''
        const info = item.Info || ''
        
        if (name.trim() !== '' && info.trim() !== '') {
          features.push({
            title: name,
            description: info
          })
        }
      })
      
      return features
    } catch (error) {
      console.error('Error fetching What We Offer data:', error)
      return []
    }
  }

  static convertImgurUrl(url) {
    if (!url) return url
    
    // Convert imgur.com URLs to direct i.imgur.com URLs
    if (url.includes('imgur.com/') && !url.includes('i.imgur.com')) {
      const imgurId = url.split('/').pop()
      // Try common image extensions
      const extensions = ['jpg', 'png', 'gif', 'jpeg', 'webp']
      // Default to jpg if no extension is specified
      return `https://i.imgur.com/${imgurId}.jpg`
    }
    
    return url
  }

  static async getShipRegistry() {
    try {
      const shipData = await this.fetchCSV(SHIP_REGISTRY_URL)
      const ships = []
      
      shipData.forEach(ship => {
        const model = ship['Ship Model'] || ship.A || ''
        const make = ship['Make'] || ship['Ship Make'] || ship.B || ''
        const imageUrl = ship['Image URL'] || ship.C || ''
        
        if (model.trim() !== '' && make.trim() !== '') {
          ships.push({
            model: model.trim(),
            make: make.trim(),
            imageUrl: this.convertImgurUrl(imageUrl.trim()),
            fullName: `${make.trim()} ${model.trim()}`,
            value: `${make.toLowerCase().replace(/\s+/g, '-')}-${model.toLowerCase().replace(/\s+/g, '-')}`
          })
        }
      })
      
      // Sort ships by make then model for better organization
      ships.sort((a, b) => {
        if (a.make !== b.make) {
          return a.make.localeCompare(b.make)
        }
        return a.model.localeCompare(b.model)
      })
      
      console.log('Loaded ships from registry:', ships.length)
      
      // If no ships loaded from registry, provide fallback ships
      if (ships.length === 0) {
        console.warn('No ships loaded from registry, using fallback ships')
        return this.getFallbackShips()
      }
      
      return ships
    } catch (error) {
      console.error('Error fetching Ship Registry data:', error)
      console.log('Using fallback ships due to error')
      return this.getFallbackShips()
    }
  }

  static getFallbackShips() {
    return [
      { model: 'Avenger Titan', make: 'Aegis', imageUrl: '', fullName: 'Aegis Avenger Titan', value: 'aegis-avenger-titan' },
      { model: 'Gladius', make: 'Aegis', imageUrl: '', fullName: 'Aegis Gladius', value: 'aegis-gladius' },
      { model: 'Sabre', make: 'Aegis', imageUrl: '', fullName: 'Aegis Sabre', value: 'aegis-sabre' },
      { model: 'Vanguard Warden', make: 'Aegis', imageUrl: '', fullName: 'Aegis Vanguard Warden', value: 'aegis-vanguard-warden' },
      { model: 'Arrow', make: 'Anvil', imageUrl: '', fullName: 'Anvil Arrow', value: 'anvil-arrow' },
      { model: 'F7C Hornet', make: 'Anvil', imageUrl: '', fullName: 'Anvil F7C Hornet', value: 'anvil-f7c-hornet' },
      { model: 'Hawk', make: 'Anvil', imageUrl: '', fullName: 'Anvil Hawk', value: 'anvil-hawk' },
      { model: 'Hurricane', make: 'Anvil', imageUrl: '', fullName: 'Anvil Hurricane', value: 'anvil-hurricane' },
      { model: 'Terrapin', make: 'Anvil', imageUrl: '', fullName: 'Anvil Terrapin', value: 'anvil-terrapin' },
      { model: 'MPUV Cargo', make: 'Argo', imageUrl: '', fullName: 'Argo MPUV Cargo', value: 'argo-cargo' },
      { model: 'Mercury Star Runner', make: 'Crusader', imageUrl: '', fullName: 'Crusader Mercury Star Runner', value: 'crusader-mercury-star-runner' },
      { model: 'Nomad', make: 'Crusader', imageUrl: '', fullName: 'Crusader Nomad', value: 'crusader-nomad' },
      { model: 'Buccaneer', make: 'Drake', imageUrl: '', fullName: 'Drake Buccaneer', value: 'drake-buccaneer' },
      { model: 'Caterpillar', make: 'Drake', imageUrl: '', fullName: 'Drake Caterpillar', value: 'drake-caterpillar' },
      { model: 'Cutlass Black', make: 'Drake', imageUrl: '', fullName: 'Drake Cutlass Black', value: 'drake-cutlass-black' },
      { model: 'Herald', make: 'Drake', imageUrl: '', fullName: 'Drake Herald', value: 'drake-herald' },
      { model: '300i', make: 'Origin', imageUrl: '', fullName: 'Origin 300i', value: 'origin-300i' },
      { model: '325a', make: 'Origin', imageUrl: '', fullName: 'Origin 325a', value: 'origin-325a' },
      { model: '350r', make: 'Origin', imageUrl: '', fullName: 'Origin 350r', value: 'origin-350r' },
      { model: '600i', make: 'Origin', imageUrl: '', fullName: 'Origin 600i', value: 'origin-600i' },
      { model: '890 Jump', make: 'Origin', imageUrl: '', fullName: 'Origin 890 Jump', value: 'origin-890-jump' },
      { model: 'Aurora MR', make: 'RSI', imageUrl: '', fullName: 'RSI Aurora MR', value: 'rsi-aurora-mr' },
      { model: 'Constellation Andromeda', make: 'RSI', imageUrl: '', fullName: 'RSI Constellation Andromeda', value: 'rsi-constellation-andromeda' },
      { model: 'Mantis', make: 'RSI', imageUrl: '', fullName: 'RSI Mantis', value: 'rsi-mantis' },
      { model: 'Freelancer', make: 'MISC', imageUrl: '', fullName: 'MISC Freelancer', value: 'misc-freelancer' },
      { model: 'Prospector', make: 'MISC', imageUrl: '', fullName: 'MISC Prospector', value: 'misc-prospector' },
      { model: 'Starfarer', make: 'MISC', imageUrl: '', fullName: 'MISC Starfarer', value: 'misc-starfarer' },
      { model: 'Defender', make: 'Banu', imageUrl: '', fullName: 'Banu Defender', value: 'banu-defender' },
      { model: 'Prowler', make: 'Esperia', imageUrl: '', fullName: 'Esperia Prowler', value: 'esperia-prowler' },
      { model: 'Scythe', make: 'Vanduul', imageUrl: '', fullName: 'Vanduul Scythe', value: 'vanduul-scythe' }
    ].sort((a, b) => {
      if (a.make !== b.make) {
        return a.make.localeCompare(b.make)
      }
      return a.model.localeCompare(b.model)
    })
  }
}

export default OFSDataService
