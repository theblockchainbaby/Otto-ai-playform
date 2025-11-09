require('dotenv').config();
const GoogleSheetsService = require('./src/services/googleSheetsService');

async function testGoogleSheets() {
  console.log('🧪 Testing Google Sheets Access');
  console.log('================================\n');
  
  const sheetsService = new GoogleSheetsService();
  
  console.log('Sheet ID:', sheetsService.spreadsheetId);
  console.log('Access Mode:', sheetsService.usePublicAccess ? 'Public (Read-Only)' : 'Private (Full Access)');
  console.log('');
  
  try {
    console.log('📊 Fetching contacts from sheet...\n');
    
    const contacts = await sheetsService.getCampaignContacts('Sheet1');
    
    console.log(`✅ Successfully loaded ${contacts.length} contacts!\n`);
    
    if (contacts.length > 0) {
      console.log('📋 Sample contacts:');
      contacts.slice(0, 3).forEach((contact, i) => {
        console.log(`\n${i + 1}. ${contact.name}`);
        console.log(`   Phone: ${contact.phone}`);
        console.log(`   Email: ${contact.email}`);
        console.log(`   Status: ${contact.status}`);
        if (contact.customFields.vehicleYear) {
          console.log(`   Vehicle: ${contact.customFields.vehicleYear} ${contact.customFields.vehicleMake} ${contact.customFields.vehicleModel}`);
        }
      });
      
      if (contacts.length > 3) {
        console.log(`\n... and ${contacts.length - 3} more contacts`);
      }
    } else {
      console.log('⚠️  No contacts found in sheet.');
      console.log('   Make sure the sheet has data in the following format:');
      console.log('   Name | Phone | Email | Status | ... ');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the sheet is public (Share → Anyone with link)');
    console.log('2. Verify the sheet ID is correct in .env');
    console.log('3. Check that Sheet1 exists or use correct sheet name');
  }
}

testGoogleSheets();
