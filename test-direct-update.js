// Direct test script for Google Sheets update
import { GoogleSheetsWriteService } from '../src/services/googleSheetsWriteService.js'

async function testDirectUpdate() {
  try {
    console.log('=== Direct Google Sheets Update Test ===')
    
    const writeService = new GoogleSheetsWriteService()
    
    // Test Discord ID from the user's report
    const discordId = '527694877773922324'
    const rsiHandle = 'TestRSIHandle123'
    
    console.log('Testing update for Discord ID:', discordId)
    
    // Initialize the service
    await writeService.initialize()
    console.log('✅ Service initialized successfully')
    
    // Find the user row
    const rowIndex = await writeService.findUserRow(discordId)
    console.log('✅ User found at row:', rowIndex)
    
    if (!rowIndex) {
      throw new Error('User not found in Member Log')
    }
    
    // Update verification status
    await writeService.updateVerificationStatus(discordId, true, rsiHandle)
    console.log('✅ Verification status updated successfully')
    
    // Get the updated status to verify
    const status = await writeService.getVerificationStatus(discordId)
    console.log('✅ Updated status:', status)
    
    console.log('=== Test completed successfully! ===')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  }
}

// Run the test
testDirectUpdate()