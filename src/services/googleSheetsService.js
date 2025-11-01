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
                  patrolCount: userRow[2] || '0', // Column C - PatrolCount from CSV header
                  totalLength: userRow[3] || '0', // Column D - TotalLength from CSV header
                  fpsKills: userRow[4] || '0', // Column E - FPS_Kills_Total from CSV header
                  shipKills: userRow[5] || '0', // Column F - Ship_Kills_Total from CSV header  
                  crusades: userRow[6] || '0', // Column G - Crusades_Total from CSV header
                  turretKills: userRow[7] || '0', // Column H - Turret_Kills_Total from CSV header
                  quests: userRow[8] || '0', // Column I - Quest_Total from CSV header
                  ledQuests: userRow[9] || '0', // Column J - Led_Completed_Quests from CSV header
                  ledCrusades: userRow[10] || '0', // Column K - Led_Completed_Crusades from CSV header
                };
                
                console.log('=== ACTUAL CSV STRUCTURE ===');
                console.log('PatrolCount: Column C (index 2) =', userRow[2]);
                console.log('TotalLength: Column D (index 3) =', userRow[3]);
                console.log('FPS_Kills_Total: Column E (index 4) =', userRow[4]);
                console.log('Ship_Kills_Total: Column F (index 5) =', userRow[5]);
                console.log('Crusades_Total: Column G (index 6) =', userRow[6]);
                console.log('Turret_Kills_Total: Column H (index 7) =', userRow[7]);
                console.log('Quest_Total: Column I (index 8) =', userRow[8]);
                console.log('Led_Completed_Quests: Column J (index 9) =', userRow[9]);
                console.log('Led_Completed_Crusades: Column K (index 10) =', userRow[10]);
                
                console.log('=== EXTRACTED STATS VALUES ===');
                console.log(`Ground Kills (fpsKills): ${stats.fpsKills}`);
                console.log(`Pilot Kills (shipKills): ${stats.shipKills}`);
                console.log(`Total Hours (totalLength): ${stats.totalLength}`);
                console.log(`Turret Kills (turretKills): ${stats.turretKills}`);
                console.log(`Quests: ${stats.quests}`);
                console.log(`Led Quests: ${stats.ledQuests}`);
                console.log(`Crusades: ${stats.crusades}`);
                console.log(`Led Crusades: ${stats.ledCrusades}`);
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