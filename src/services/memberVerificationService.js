// Service for checking Discord member verification in Member Log sheet
export class MemberVerificationService {
  constructor() {
    this.spreadsheetId = '12OiRHpEALj1hzXRxaXgBOWjHtmUT5hg2ztxIgr4J4y8';
    this.memberLogGid = '2052923864'; // Member Log sheet GID
    this.csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=${this.memberLogGid}`;
    this.publicCsvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&gid=${this.memberLogGid}`;
  }

  /**
   * Check if Discord user exists in Member Log and return their data
   * @param {string} discordId - Discord user ID
   * @returns {Promise<Object|null>} Member data or null if not found
   */
  async verifyDiscordMember(discordId) {
    try {
      console.log('Checking Discord member in Member Log for ID:', discordId);
      
      const urlsToTry = [
        this.csvUrl,
        this.publicCsvUrl,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(this.csvUrl)}`,
      ];
      
      for (let i = 0; i < urlsToTry.length; i++) {
        const url = urlsToTry[i];
        console.log(`Member Log attempt ${i + 1}: Trying URL:`, url);
        
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
            console.log('Member Log CSV received, length:', csvText.length);
            
            const rows = this.parseCSV(csvText);
            console.log('Member Log parsed rows:', rows.length);
            
            if (rows.length > 0) {
              console.log('Member Log header:', rows[0]);
              
              // Find user by UserID in column A (index 0)
              const memberRow = rows.find(row => row[0] && row[0].toString() === discordId.toString());
              
              if (memberRow) {
                console.log('Found member in Member Log:', memberRow);
                
                const memberData = {
                  discordId: memberRow[0], // Column A - UserID
                  username: memberRow[1] || 'Unknown', // Column B - Username (if available)
                  isVerified: this.parseVerificationStatus(memberRow[20]), // Column U - Verified (index 20)
                  joinDate: memberRow[2] || null, // Column C - Join date (if available)
                  rank: memberRow[3] || null, // Column D - Rank (if available)
                  // Add other relevant fields as needed
                };
                
                console.log('Member verification data:', memberData);
                return memberData;
              } else {
                console.log('Discord ID not found in Member Log:', discordId);
                return null;
              }
            }
            
            break;
          }
        } catch (fetchError) {
          console.log(`Member Log attempt ${i + 1} failed:`, fetchError.message);
          if (i === urlsToTry.length - 1) {
            throw fetchError;
          }
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Error checking Member Log:', error);
      return null;
    }
  }

  /**
   * Parse verification status from column U
   * @param {string} value - Value from Verified column
   * @returns {boolean} True if verified
   */
  parseVerificationStatus(value) {
    if (!value) return false;
    
    const normalizedValue = value.toString().toLowerCase().trim();
    return normalizedValue === 'true' || normalizedValue === 'yes' || normalizedValue === '1' || normalizedValue === 'verified';
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
        // Handle CSV with potential commas in quoted fields
        const row = this.parseCSVLine(line);
        rows.push(row);
      }
    }
    
    return rows;
  }

  /**
   * Parse a single CSV line handling quoted fields
   * @param {string} line - CSV line
   * @returns {Array} Array of cell values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  }

  /**
   * Update the Verified column for a user (requires Google Sheets API - placeholder for now)
   * @param {string} discordId - Discord user ID
   * @param {boolean} verified - Verification status
   * @returns {Promise<boolean>} Success status
   */
  async updateVerificationStatus(discordId, verified) {
    // This would require Google Sheets API with write permissions
    // For now, we'll just log the action
    console.log(`Would update verification for ${discordId} to ${verified}`);
    
    // TODO: Implement actual Google Sheets API update when write access is available
    // This would require:
    // 1. Google Sheets API credentials
    // 2. Service account or OAuth
    // 3. Write permissions to the spreadsheet
    
    return true; // Simulate success for now
  }
}

// Create singleton instance
export const memberVerificationService = new MemberVerificationService();