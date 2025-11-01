// Google Sheets service for fetching user patrol stats
export class GoogleSheetsService {
  constructor() {
    // Use CSV export URL - requires sheet to be publicly accessible
    this.spreadsheetId = '12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8';
    this.sheetGid = '1245860458'; // Patrols_User_Totals
    this.csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=${this.sheetGid}`;
    // Alternative public sharing URL format
    this.publicCsvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&gid=${this.sheetGid}`;
  }

  /**
   * Fetch user patrol stats from Google Sheets using CSV export
   * @param {string} userId - Discord user ID
   * @returns {Promise<Object>} User stats object
   */
  async fetchUserStats(userId) {
    try {
      console.log('Fetching stats for Discord User ID:', userId);
      
      // Try multiple URL formats to work around CORS
      const urlsToTry = [
        this.csvUrl,
        this.publicCsvUrl,
        // Add CORS proxy as fallback
        `https://api.allorigins.win/raw?url=${encodeURIComponent(this.csvUrl)}`,
      ];
      
      for (let i = 0; i < urlsToTry.length; i++) {
        const url = urlsToTry[i];
        console.log(`Attempt ${i + 1}: Trying URL:`, url);
        
        try {
          const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'text/csv, text/plain, */*'
            }
          });
          
          if (response.ok) {
            const csvText = await response.text();
            console.log('CSV Response received successfully, length:', csvText.length);
            console.log('First 500 chars:', csvText.substring(0, 500));
            
            // Parse CSV data
            const rows = this.parseCSV(csvText);
            console.log('Parsed CSV rows:', rows.length);
            
            if (rows.length > 0) {
              console.log('Header row:', rows[0]);
              
              // Find user by UserID in column A (index 0)
              const userRow = rows.find(row => row[0] && row[0].toString() === userId.toString());
              
              if (userRow) {
                console.log('=== DETAILED DEBUG FOR USER STATS ===');
                console.log('Target User ID:', userId);
                console.log('Found user row:', userRow);
                console.log('Row length:', userRow.length);
                console.log('Full user row with indices:');
                userRow.forEach((cell, index) => {
                  console.log(`  Index ${index} (Column ${String.fromCharCode(65 + index)}): "${cell}"`);
                });
                
                const stats = {
                  patrolCount: userRow[2] || '0', // Column C - PatrolCount
                  totalLength: userRow[3] || '0', // Column D - TotalLength_Hours
                  fpsKills: userRow[4] || '0', // Column E - FPS_Kills_Total (Ground Kills)
                  shipKills: userRow[5] || '0', // Column F - Ship_Kills_Total (Pilot Kills)
                  crusades: userRow[6] || '0', // Column G - Crusades_Total
                  turretKills: userRow[7] || '0', // Column H - Turret_Kills_Total
                  quests: userRow[8] || '0', // Column I - Quest_Total
                  ledQuests: userRow[9] || '0', // Column J - Led_Completed_Quests
                  ledCrusades: userRow[10] || '0', // Column K - Led_Completed_Crusades
                };
                
                console.log('=== EXPECTED VALUES (from your spreadsheet) ===');
                console.log('Ground Kills should be: 98 (Column E)');
                console.log('Pilot Kills should be: 73 (Column F)');
                console.log('Total Hours should be: 0 (Column D)');
                console.log('Turret Kills should be: 2 (Column H)');
                console.log('Quests should be: 25 (Column I)');
                console.log('Led Quests should be: 4 (Column J)');
                console.log('Crusades should be: 5 (Column G)');
                console.log('Led Crusades should be: 0 (Column K)');
                
                console.log('=== ACTUAL EXTRACTED VALUES ===');
                console.log(`Ground Kills (fpsKills): Column E (${userRow[4]}) = ${stats.fpsKills}`);
                console.log(`Pilot Kills (shipKills): Column F (${userRow[5]}) = ${stats.shipKills}`);
                console.log(`Total Hours (totalLength): Column D (${userRow[3]}) = ${stats.totalLength}`);
                console.log(`Turret Kills (turretKills): Column H (${userRow[7]}) = ${stats.turretKills}`);
                console.log(`Quests: Column I (${userRow[8]}) = ${stats.quests}`);
                console.log(`Led Quests: Column J (${userRow[9]}) = ${stats.ledQuests}`);
                console.log(`Crusades: Column G (${userRow[6]}) = ${stats.crusades}`);
                console.log(`Led Crusades: Column K (${userRow[10]}) = ${stats.ledCrusades}`);
                console.log('Final extracted stats:', stats);
                console.log('=== END DEBUG ===');
                return stats;
              } else {
                console.log('User not found in spreadsheet, UserID:', userId);
                console.log('Available UserIDs (first 10):', rows.slice(1, 11).map(row => row[0]));
              }
            }
            
            // If we got a response but no data, continue to next URL
            break;
          }
        } catch (fetchError) {
          console.log(`Attempt ${i + 1} failed:`, fetchError.message);
          if (i === urlsToTry.length - 1) {
            throw fetchError;
          }
          // Continue to next URL
        }
      }
      
      console.log('All attempts failed, returning default stats');
      return this.getDefaultStats();
      
    } catch (error) {
      console.error('Error fetching user stats from Google Sheets:', error);
      console.log('IMPORTANT: Make sure the Google Sheet is publicly accessible!');
      console.log('Share settings should be: Anyone with the link can view');
      return this.getDefaultStats();
    }
  }

  /**
   * Parse CSV text into array of arrays
   * @param {string} csvText - Raw CSV text
   * @returns {Array} Array of row arrays
   */
  parseCSV(csvText) {
    const rows = [];
    const lines = csvText.split('\n');
    
    for (let line of lines) {
      if (line.trim()) {
        // Simple CSV parsing - handles basic comma separation
        const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
        rows.push(row);
      }
    }
    
    return rows;
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