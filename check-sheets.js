require('dotenv').config();
const axios = require('axios');

async function listSheets() {
  const spreadsheetId = '1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w';
  
  console.log('📊 Checking Google Sheet structure...\n');
  
  try {
    // Try to get sheet metadata
    const metaUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`;
    console.log('Sheet URL:', metaUrl);
    
    // Try different sheet names
    const sheetNames = ['Sheet1', 'lead_template', 'Leads', 'Contacts', 'Outbound Campaigns'];
    
    for (const sheetName of sheetNames) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
        console.log(`\nTrying sheet: "${sheetName}"...`);
        
        const response = await axios.get(csvUrl, { timeout: 5000 });
        const lines = response.data.split('\n');
        
        console.log(`✅ Found! (${lines.length} rows)`);
        console.log('First 3 rows:');
        lines.slice(0, 3).forEach((line, i) => {
          console.log(`  ${i}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
        });
        
      } catch (error) {
        console.log(`❌ Not found or error`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listSheets();
