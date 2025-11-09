#!/usr/bin/env node

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
        console.log(`Setting ${key} = ${value}`);
        process.env[key] = value;
      }
    }
  }
});

console.log('\n🔍 After manual load:');
console.log('TWILIO_OUTBOUND_NUMBER:', process.env.TWILIO_OUTBOUND_NUMBER);
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
console.log('');

// Now load other env vars with dotenv
require('dotenv').config();

const GoogleSheetsService = require('./src/services/googleSheetsService');
const TwilioOutboundService = require('./src/services/twilioOutboundService');

async function makeTestCall() {
  console.log('📞 Otto Outbound Test Call');
  console.log('==========================\n');
  
  const twilioService = new TwilioOutboundService();
  
  console.log('✅ TwilioService initialized with:', twilioService.outboundNumber);
  console.log('');
  
  const sheetsService = new GoogleSheetsService();
  
  try {
    console.log('📊 Loading contacts from Google Sheets...');
    const contacts = await sheetsService.getCampaignContacts('Sheet1');
    
    const contact = contacts[0];
    console.log(`\n✅ Found contact: ${contact.name} (${contact.phone})\n`);
    
    console.log('📞 Initiating call via Twilio...\n');
    
    const result = await twilioService.makeOutboundCall({
      toNumber: contact.phone,
      customerName: contact.name,
      customerId: 'test-' + Date.now(),
      campaignType: 'TEST_CALL',
      recordCall: true
    });

    console.log('✅ Call initiated successfully!');
    console.log(`   Call SID: ${result.callSid}`);
    console.log(`   From: ${result.from}`);
    console.log(`   To: ${result.to}`);
    console.log(`\n📱 Otto is now calling ${contact.name} at ${contact.phone}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeTestCall();
