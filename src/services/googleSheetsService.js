// Google Sheets service for fetching user patrol stats
export class GoogleSheetsService {
  constructor() {
    this.baseUrl = 'https://docs.google.com/spreadsheets/d/12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8/gviz/tq?';
    this.sheetGid = '1245860458'; // Patrols_User_Totals
  }

  /**
   * Fetch user patrol stats from Google Sheets
   * @param {string} userId - Discord user ID or username
   * @returns {Promise<Object>} User stats object
   */
  async fetchUserStats(userId) {
    try {
      // Query to find user by Discord ID or username
      const query = `SELECT * WHERE A CONTAINS '${userId}' OR B CONTAINS '${userId}'`;
      const url = `${this.baseUrl}gid=${this.sheetGid}&tq=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const text = await response.text();
      
      // Parse Google Sheets response (JSON-P format)
      const jsonData = this.parseGoogleSheetsResponse(text);
      
      if (jsonData && jsonData.table && jsonData.table.rows && jsonData.table.rows.length > 0) {
        const row = jsonData.table.rows[0];
        const cols = row.c;
        
        return {
          quests: this.getCellValue(cols[2]) || '0', // Column C - Quests
          crusades: this.getCellValue(cols[3]) || '0', // Column D - Crusades
          groundKills: this.getCellValue(cols[4]) || '0', // Column E - Ground Kills (FPS)
          pilotKills: this.getCellValue(cols[5]) || '0', // Column F - Pilot Kills (Ship)
          turretKills: this.getCellValue(cols[6]) || '0', // Column G - Turret Kills
          ledQuests: this.getCellValue(cols[7]) || '0', // Column H - Led Quests
          ledCrusades: this.getCellValue(cols[8]) || '0', // Column I - Led Crusades
        };
      }
      
      return this.getDefaultStats();
    } catch (error) {
      console.error('Error fetching user stats from Google Sheets:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Parse Google Sheets JSON-P response
   * @param {string} text - Response text
   * @returns {Object} Parsed JSON data
   */
  parseGoogleSheetsResponse(text) {
    try {
      // Remove the callback wrapper to get pure JSON
      const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error parsing Google Sheets response:', error);
      return null;
    }
  }

  /**
   * Extract cell value from Google Sheets cell object
   * @param {Object} cell - Cell object
   * @returns {string} Cell value
   */
  getCellValue(cell) {
    if (!cell) return '0';
    return cell.v !== null && cell.v !== undefined ? cell.v.toString() : '0';
  }

  /**
   * Get default stats when data is unavailable
   * @returns {Object} Default stats object
   */
  getDefaultStats() {
    return {
      quests: '0',
      crusades: '0',
      groundKills: '0',
      pilotKills: '0',
      turretKills: '0',
      ledQuests: '0',
      ledCrusades: '0',
    };
  }

  /**
   * Get formatted stat entries for cycling display
   * @param {Object} stats - User stats object
   * @returns {Array} Array of stat objects with label and value
   */
  getFormattedStats(stats) {
    return [
      { label: 'Quests', value: stats.quests },
      { label: 'Crusades', value: stats.crusades },
      { label: 'Ground Kills', value: stats.groundKills },
      { label: 'Pilot Kills', value: stats.pilotKills },
      { label: 'Turret Kills', value: stats.turretKills },
      { label: 'Led Quests', value: stats.ledQuests },
      { label: 'Led Crusades', value: stats.ledCrusades },
    ];
  }
}

// Create singleton instance
export const googleSheetsService = new GoogleSheetsService();