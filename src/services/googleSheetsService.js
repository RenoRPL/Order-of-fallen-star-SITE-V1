// Google Sheets service for fetching user patrol stats
export class GoogleSheetsService {
  constructor() {
    this.baseUrl = 'https://docs.google.com/spreadsheets/d/12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8/gviz/tq?';
    this.sheetGid = '1245860458'; // Patrols_User_Totals
    this.headers = {
      'Accept': 'text/plain',
    };
  }

  /**
   * Fetch user patrol stats from Google Sheets
   * @param {string} userId - Discord user ID or username
   * @returns {Promise<Object>} User stats object
   */
  async fetchUserStats(userId) {
    try {
      // Query to find user by exact Discord ID in Column A (UserID)
      const query = `SELECT * WHERE A = '${userId}'`;
      const url = `${this.baseUrl}gid=${this.sheetGid}&tq=${encodeURIComponent(query)}`;
      
      console.log('Fetching stats for Discord User ID:', userId);
      console.log('Query URL:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      
      console.log('Raw response text:', text.substring(0, 500) + '...');
      
      // Parse Google Sheets response (JSON-P format)
      const jsonData = this.parseGoogleSheetsResponse(text);
      console.log('Parsed JSON data:', jsonData);
      
      if (jsonData && jsonData.table && jsonData.table.rows && jsonData.table.rows.length > 0) {
        const row = jsonData.table.rows[0];
        const cols = row.c;
        
        console.log('Found matching row, raw columns:', cols);
        console.log('Column A (UserID):', this.getCellValue(cols[0]));
        console.log('Column B (DisplayName):', this.getCellValue(cols[1]));
        
        const stats = {
          patrolCount: this.getCellValue(cols[2]) || '0', // Column C - PatrolCount
          totalLength: this.getCellValue(cols[3]) || '0', // Column D - TotalLength
          fpsKills: this.getCellValue(cols[4]) || '0', // Column E - FPS_Kills_Total
          shipKills: this.getCellValue(cols[5]) || '0', // Column F - Ship_Kills_Total
          crusades: this.getCellValue(cols[6]) || '0', // Column G - Crusades_Total
          turretKills: this.getCellValue(cols[7]) || '0', // Column H - Turret_Kills_Total
          quests: this.getCellValue(cols[8]) || '0', // Column I - Quest_Total
          ledQuests: this.getCellValue(cols[9]) || '0', // Column J - Led_Completed_Quests
          ledCrusades: this.getCellValue(cols[10]) || '0', // Column K - Led_Completed_Crusades
        };
        
        console.log('Extracted stats:', stats);
        return stats;
      } else {
        console.log('No matching rows found for UserID:', userId);
        console.log('Available data structure:', jsonData);
        
        // Try alternative query with string conversion
        const altQuery = `SELECT * WHERE A = "${userId}"`;
        const altUrl = `${this.baseUrl}gid=${this.sheetGid}&tq=${encodeURIComponent(altQuery)}`;
        
        console.log('Trying alternative query:', altUrl);
        
        const altResponse = await fetch(altUrl);
        const altText = await altResponse.text();
        const altJsonData = this.parseGoogleSheetsResponse(altText);
        
        console.log('Alternative query result:', altJsonData);
        
        if (altJsonData && altJsonData.table && altJsonData.table.rows && altJsonData.table.rows.length > 0) {
          const row = altJsonData.table.rows[0];
          const cols = row.c;
          
          const stats = {
            patrolCount: this.getCellValue(cols[2]) || '0',
            totalLength: this.getCellValue(cols[3]) || '0',
            fpsKills: this.getCellValue(cols[4]) || '0',
            shipKills: this.getCellValue(cols[5]) || '0',
            crusades: this.getCellValue(cols[6]) || '0',
            turretKills: this.getCellValue(cols[7]) || '0',
            quests: this.getCellValue(cols[8]) || '0',
            ledQuests: this.getCellValue(cols[9]) || '0',
            ledCrusades: this.getCellValue(cols[10]) || '0',
          };
          
          console.log('Alternative query extracted stats:', stats);
          return stats;
        }
      }
      
      console.log('No matching data found, returning default stats');
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
      patrolCount: '0',
      totalLength: '0',
      fpsKills: '0',
      shipKills: '0',
      crusades: '0',
      turretKills: '0',
      quests: '0',
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
      { label: 'Patrols', value: stats.patrolCount },
      { label: 'Total Hours', value: stats.totalLength },
      { label: 'Ground Kills', value: stats.fpsKills },
      { label: 'Ship Kills', value: stats.shipKills },
      { label: 'Crusades', value: stats.crusades },
      { label: 'Turret Kills', value: stats.turretKills },
      { label: 'Quests', value: stats.quests },
      { label: 'Led Quests', value: stats.ledQuests },
      { label: 'Led Crusades', value: stats.ledCrusades },
    ];
  }
}

// Create singleton instance
export const googleSheetsService = new GoogleSheetsService();