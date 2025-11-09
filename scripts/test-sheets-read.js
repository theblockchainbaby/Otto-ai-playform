#!/usr/bin/env node

/**
 * Test Google Sheets Read Access
 * 
 * This script tests if Otto can read contacts from your Google Sheet
 * 
 * Usage:
 *   node scripts/test-sheets-read.js
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

async function testSheetsRead() {
  try {
    log('\n📊 Google Sheets Read Test', 'bright');
    log('═══════════════════════════════════════\n', 'cyan');

    // Check configuration
    log('📋 Checking Configuration...', 'blue');
    
    const sheetId = process.env.GOOGLE_SHEETS_CAMPAIGN_ID;
    const hasCredentials = !!process.env.GOOGLE_SHEETS_CREDENTIALS;
    
    if (!sheetId) {
      log('❌ GOOGLE_SHEETS_CAMPAIGN_ID not set in .env', 'red');
      process.exit(1);
    }
    
    log(`✅ Sheet ID: ${sheetId}`, 'green');
    log(`   Access Method: ${hasCredentials ? 'Service Account (Secure)' : 'Public Access (Quick)'}`, 'cyan');
    log(`   Sheet URL: https://docs.google.com/spreadsheets/d/${sheetId}/edit\n`, 'cyan');

    // Initialize service
    log('🔧 Initializing Google Sheets Service...', 'blue');
    const sheetsService = new GoogleSheetsService();
    log('✅ Service initialized\n', 'green');

    // Read contacts
    log('📖 Reading Contacts from "Outbound Campaigns" sheet...', 'blue');
    const contacts = await sheetsService.getCampaignContacts('Outbound Campaigns');
    
    if (contacts.length === 0) {
      log('⚠️  No contacts found!', 'yellow');
      log('\nPossible reasons:', 'yellow');
      log('  1. Sheet "Outbound Campaigns" doesn\'t exist', 'yellow');
      log('  2. Sheet is empty (no data rows)', 'yellow');
      log('  3. Sheet is not publicly accessible (if using Quick Setup)', 'yellow');
      log('  4. Service account doesn\'t have access (if using Secure Setup)\n', 'yellow');
      log('Please check your Google Sheet and try again.', 'yellow');
      process.exit(1);
    }

    log(`✅ Successfully read ${contacts.length} contact(s)!\n`, 'green');

    // Display contacts
    log('📋 Contact List:', 'bright');
    log('═══════════════════════════════════════\n', 'cyan');

    contacts.forEach((contact, index) => {
      log(`Contact #${index + 1}:`, 'bright');
      log(`   Name: ${contact.name}`, 'cyan');
      log(`   Phone: ${contact.phone}`, 'cyan');
      log(`   Email: ${contact.email || 'N/A'}`, 'cyan');
      log(`   Status: ${contact.status || 'PENDING'}`, 'cyan');
      log(`   Row: ${contact.rowNumber}`, 'cyan');
      
      // Validate phone number
      if (!contact.phone.startsWith('+')) {
        log(`   ⚠️  WARNING: Phone number should include country code (e.g., +1)`, 'yellow');
      }
      
      log('', 'reset');
    });

    log('═══════════════════════════════════════', 'cyan');
    log('✅ Test Passed! Otto can read your Google Sheet.', 'green');
    log('\nNext Steps:', 'bright');
    log('  1. Run: node scripts/test-sheets-update.js (if using Service Account)', 'cyan');
    log('  2. Run: node test-outbound-campaign.js +1YOUR_PHONE_NUMBER', 'cyan');
    log('', 'reset');

  } catch (error) {
    log('\n❌ Test Failed!', 'red');
    log('═══════════════════════════════════════\n', 'cyan');
    
    if (error.message.includes('404')) {
      log('Error: Sheet not found or not accessible', 'red');
      log('\nQuick Setup:', 'yellow');
      log('  1. Make sure sheet is publicly viewable', 'yellow');
      log('  2. Share → Anyone with the link → Viewer', 'yellow');
      log('\nSecure Setup:', 'yellow');
      log('  1. Share sheet with service account email', 'yellow');
      log('  2. Check GOOGLE_SHEETS_CREDENTIALS in .env', 'yellow');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      log('Error: Permission denied', 'red');
      log('\nMake sure:', 'yellow');
      log('  1. Sheet is shared with service account (Secure Setup)', 'yellow');
      log('  2. OR sheet is publicly viewable (Quick Setup)', 'yellow');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    
    log('\nFull error details:', 'yellow');
    console.error(error);
    process.exit(1);
  }
}

testSheetsRead();

