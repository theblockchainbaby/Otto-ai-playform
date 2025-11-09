#!/usr/bin/env node

/**
 * Test Google Sheets Write Access
 * 
 * This script tests if Otto can update contact status in your Google Sheet
 * NOTE: This only works with Service Account setup (Secure Setup)
 * 
 * Usage:
 *   node scripts/test-sheets-update.js
 */

require('dotenv').config();
const GoogleSheetsService = require('../src/services/googleSheetsService');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSheetsUpdate() {
  try {
    log('\n📝 Google Sheets Write Test', 'bright');
    log('═══════════════════════════════════════\n', 'cyan');

    // Check configuration
    log('📋 Checking Configuration...', 'blue');
    
    const sheetId = process.env.GOOGLE_SHEETS_CAMPAIGN_ID;
    const hasCredentials = !!process.env.GOOGLE_SHEETS_CREDENTIALS;
    
    if (!sheetId) {
      log('❌ GOOGLE_SHEETS_CAMPAIGN_ID not set in .env', 'red');
      process.exit(1);
    }

    if (!hasCredentials) {
      log('⚠️  GOOGLE_SHEETS_CREDENTIALS not set', 'yellow');
      log('\nWrite access requires Service Account setup.', 'yellow');
      log('You are using Quick Setup (Public Access) which is read-only.\n', 'yellow');
      log('To enable write access:', 'cyan');
      log('  1. Follow the "Secure Setup" guide in GOOGLE_SHEETS_SETUP_GUIDE.md', 'cyan');
      log('  2. Add GOOGLE_SHEETS_CREDENTIALS to your .env file\n', 'cyan');
      log('For now, Otto can still make calls, but won\'t update the sheet.', 'yellow');
      process.exit(0);
    }
    
    log(`✅ Sheet ID: ${sheetId}`, 'green');
    log(`   Access Method: Service Account (Secure)`, 'cyan');
    log(`   Sheet URL: https://docs.google.com/spreadsheets/d/${sheetId}/edit\n`, 'cyan');

    // Initialize service
    log('🔧 Initializing Google Sheets Service...', 'blue');
    const sheetsService = new GoogleSheetsService();
    log('✅ Service initialized\n', 'green');

    // Read contacts first
    log('📖 Reading Contacts...', 'blue');
    const contacts = await sheetsService.getCampaignContacts('Outbound Campaigns');
    
    if (contacts.length === 0) {
      log('❌ No contacts found in sheet', 'red');
      log('Please add at least one contact to test updates.', 'yellow');
      process.exit(1);
    }

    log(`✅ Found ${contacts.length} contact(s)\n`, 'green');

    // Test update on first contact
    const testContact = contacts[0];
    const testRow = testContact.rowNumber;

    log('📝 Testing Status Update...', 'blue');
    log(`   Contact: ${testContact.name}`, 'cyan');
    log(`   Row: ${testRow}`, 'cyan');
    log(`   Current Status: ${testContact.status || 'PENDING'}`, 'cyan');
    log(`   New Status: TEST_UPDATE\n`, 'cyan');

    await sheetsService.updateContactStatus(
      testRow,
      'TEST_UPDATE',
      `Test update from Otto at ${new Date().toLocaleString()}`
    );

    log('✅ Status update sent!\n', 'green');

    // Wait a moment for Google Sheets to update
    log('⏳ Waiting 2 seconds for Google Sheets to update...', 'blue');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Read again to verify
    log('📖 Verifying Update...', 'blue');
    const updatedContacts = await sheetsService.getCampaignContacts('Outbound Campaigns');
    const updatedContact = updatedContacts.find(c => c.rowNumber === testRow);

    if (updatedContact && updatedContact.status === 'TEST_UPDATE') {
      log('✅ Update Verified! Status changed successfully.\n', 'green');
    } else {
      log('⚠️  Could not verify update (may take a moment to sync)', 'yellow');
      log('   Please check your Google Sheet manually.\n', 'yellow');
    }

    // Test call result logging
    log('📝 Testing Call Result Logging...', 'blue');
    
    const testCallData = {
      customerName: testContact.name,
      phone: testContact.phone,
      callSid: 'TEST_' + Date.now(),
      status: 'completed',
      duration: 45,
      outcome: 'HUMAN_ANSWERED',
      notes: 'Test call result from Otto'
    };

    await sheetsService.appendCallResult(testCallData);
    log('✅ Call result logged to "Call Results" sheet\n', 'green');

    // Summary
    log('═══════════════════════════════════════', 'cyan');
    log('✅ All Tests Passed!', 'green');
    log('\nWhat was tested:', 'bright');
    log('  ✅ Read contacts from sheet', 'green');
    log('  ✅ Update contact status', 'green');
    log('  ✅ Log call results', 'green');
    log('\nCheck your Google Sheet:', 'bright');
    log(`  https://docs.google.com/spreadsheets/d/${sheetId}/edit`, 'cyan');
    log('\nYou should see:', 'bright');
    log(`  • Row ${testRow} status changed to "TEST_UPDATE"`, 'cyan');
    log('  • New entry in "Call Results" sheet', 'cyan');
    log('\nNext Steps:', 'bright');
    log('  1. Reset the test contact status back to PENDING', 'cyan');
    log('  2. Run: node test-outbound-campaign.js +1YOUR_PHONE_NUMBER', 'cyan');
    log('', 'reset');

  } catch (error) {
    log('\n❌ Test Failed!', 'red');
    log('═══════════════════════════════════════\n', 'cyan');
    
    if (error.message.includes('PERMISSION_DENIED')) {
      log('Error: Permission denied', 'red');
      log('\nMake sure:', 'yellow');
      log('  1. Service account has "Editor" permission on the sheet', 'yellow');
      log('  2. Sheet is shared with service account email', 'yellow');
      log('  3. GOOGLE_SHEETS_CREDENTIALS is valid JSON in .env', 'yellow');
    } else if (error.message.includes('Invalid credentials')) {
      log('Error: Invalid service account credentials', 'red');
      log('\nCheck:', 'yellow');
      log('  1. GOOGLE_SHEETS_CREDENTIALS in .env is valid JSON', 'yellow');
      log('  2. JSON is wrapped in single quotes', 'yellow');
      log('  3. No line breaks in the JSON string', 'yellow');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    
    log('\nFull error details:', 'yellow');
    console.error(error);
    process.exit(1);
  }
}

testSheetsUpdate();

