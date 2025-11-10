#!/usr/bin/env node

/**
 * Sales Campaign Caller
 * Calls all contacts from Google Sheets sales list
 */

// Force clean environment
delete process.env.TWILIO_OUTBOUND_NUMBER;
delete process.env.TWILIO_PHONE_NUMBER;

// Load .env fresh
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse .env manually
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes and comments
      value = value.replace(/^["'](.*)["'].*$/, '$1');
      
      if (key === 'TWILIO_OUTBOUND_NUMBER' || key === 'TWILIO_PHONE_NUMBER') {
        process.env[key] = value;
      }
    }
  }
});

// Now load other env vars with dotenv
require('dotenv').config();

const GoogleSheetsService = require('./src/services/googleSheetsService');
const TwilioOutboundService = require('./src/services/twilioOutboundService');

// Configuration
const DELAY_BETWEEN_CALLS = 30000; // 30 seconds between calls
const SHEET_NAME = 'Sheet1'; // Update this if your sheet has a different name
const CAMPAIGN_TYPE = 'SALES_OUTREACH';

async function runSalesCampaign() {
  console.log('📞 Otto Sales Campaign');
  console.log('==========================\n');
  
  const twilioService = new TwilioOutboundService();
  const sheetsService = new GoogleSheetsService();
  
  console.log('✅ TwilioService initialized with:', twilioService.outboundNumber);
  console.log('');
  
  try {
    console.log('📊 Loading contacts from Google Sheets...');
    const contacts = await sheetsService.getCampaignContacts(SHEET_NAME);
    
    console.log(`\n✅ Found ${contacts.length} contacts to call\n`);
    console.log('Contacts:');
    contacts.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} - ${c.phone}`);
    });
    console.log('');
    
    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question(`\n🔔 Ready to call ${contacts.length} customers?\n   Type 'yes' to start campaign: `, resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Campaign cancelled');
      process.exit(0);
    }
    
    console.log('\n📞 Starting sales campaign...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      console.log(`\n[${i + 1}/${contacts.length}] Calling ${contact.name} at ${contact.phone}...`);
      
      try {
        const result = await twilioService.makeOutboundCall({
          toNumber: contact.phone,
          customerName: contact.name,
          customerId: `campaign-${Date.now()}-${i}`,
          campaignType: CAMPAIGN_TYPE,
          recordCall: true
        });
        
        console.log(`   ✅ Call initiated: ${result.callSid}`);
        successCount++;
        
        // Wait before next call (except for last contact)
        if (i < contacts.length - 1) {
          console.log(`   ⏳ Waiting ${DELAY_BETWEEN_CALLS / 1000} seconds before next call...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CALLS));
        }
        
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n\n📊 Campaign Complete!');
    console.log('====================');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📞 Total: ${contacts.length}`);
    console.log('\n💡 Check call recordings and statuses in Twilio dashboard');
    console.log('   https://console.twilio.com/us1/monitor/logs/calls\n');
    
  } catch (error) {
    console.error('❌ Campaign Error:', error.message);
    process.exit(1);
  }
}

// Run the campaign
runSalesCampaign();
