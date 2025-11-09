#!/usr/bin/env node

/**
 * Test Script for Otto AI Outbound Calling System
 * 
 * This script tests the outbound calling functionality by:
 * 1. Creating a test campaign
 * 2. Making a test call to your phone number
 * 3. Monitoring the call status
 * 
 * Usage:
 *   node test-outbound-campaign.js YOUR_PHONE_NUMBER
 * 
 * Example:
 *   node test-outbound-campaign.js +15551234567
 */

// Load environment variables with explicit path
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const OutboundCampaignService = require('./src/services/outboundCampaignService');
const TwilioOutboundService = require('./src/services/twilioOutboundService');

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

async function testOutboundCall() {
  try {
    // Get phone number from command line
    const phoneNumber = process.argv[2];
    
    if (!phoneNumber) {
      log('❌ Error: Please provide a phone number', 'red');
      log('Usage: node test-outbound-campaign.js +15551234567', 'yellow');
      process.exit(1);
    }

    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      log('❌ Error: Phone number must include country code (e.g., +1 for US)', 'red');
      process.exit(1);
    }

    log('\n🚀 Otto AI Outbound Calling Test', 'bright');
    log('═══════════════════════════════════════\n', 'cyan');

    // Check environment variables
    log('📋 Checking Configuration...', 'blue');

    // Debug: Print all env vars
    console.log('DEBUG - Environment variables:');
    console.log('ELEVENLABS_OUTBOUND_AGENT_ID:', process.env.ELEVENLABS_OUTBOUND_AGENT_ID);
    console.log('TWILIO_OUTBOUND_NUMBER:', process.env.TWILIO_OUTBOUND_NUMBER);
    console.log('BASE_URL:', process.env.BASE_URL);

    const requiredEnvVars = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_OUTBOUND_NUMBER',
      'ELEVENLABS_API_KEY',
      'ELEVENLABS_OUTBOUND_AGENT_ID',
      'BASE_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
      process.exit(1);
    }

    log('✅ All environment variables configured', 'green');
    log(`   Twilio Number: ${process.env.TWILIO_OUTBOUND_NUMBER}`, 'cyan');
    log(`   ElevenLabs Agent: ${process.env.ELEVENLABS_OUTBOUND_AGENT_ID}`, 'cyan');
    log(`   Base URL: ${process.env.BASE_URL}\n`, 'cyan');

    // Initialize services
    log('🔧 Initializing Services...', 'blue');
    const twilioService = new TwilioOutboundService();
    log('✅ Services initialized\n', 'green');

    // Make test call
    log('📞 Initiating Test Call...', 'blue');
    log(`   To: ${phoneNumber}`, 'cyan');
    log(`   From: ${process.env.TWILIO_OUTBOUND_NUMBER}`, 'cyan');
    log(`   Campaign: TEST_CALL\n`, 'cyan');

    const callConfig = {
      toNumber: phoneNumber,
      customerName: 'Test Customer',
      customerId: 'test-001',
      campaignType: 'GENERAL',
      recordCall: true
    };

    const callResult = await twilioService.makeOutboundCall(callConfig);

    log('✅ Call Initiated Successfully!', 'green');
    log(`   Call SID: ${callResult.callSid}`, 'cyan');
    log(`   Status: ${callResult.status}`, 'cyan');
    log(`   To: ${callResult.to}`, 'cyan');
    log(`   From: ${callResult.from}\n`, 'cyan');

    // Monitor call status
    log('📊 Monitoring Call Status...', 'blue');
    log('   (Press Ctrl+C to stop monitoring)\n', 'yellow');

    let previousStatus = '';
    const monitorInterval = setInterval(async () => {
      try {
        const details = await twilioService.getCallDetails(callResult.callSid);
        
        if (details.status !== previousStatus) {
          previousStatus = details.status;
          
          const statusEmoji = {
            'queued': '⏳',
            'ringing': '📞',
            'in-progress': '🗣️',
            'completed': '✅',
            'busy': '📵',
            'no-answer': '❌',
            'failed': '❌',
            'canceled': '🚫'
          };

          const emoji = statusEmoji[details.status] || '📊';
          log(`${emoji} Status: ${details.status.toUpperCase()}`, 'cyan');

          if (details.answeredBy) {
            log(`   Answered By: ${details.answeredBy}`, 'yellow');
          }

          // If call completed, show final details
          if (['completed', 'busy', 'no-answer', 'failed', 'canceled'].includes(details.status)) {
            clearInterval(monitorInterval);
            
            log('\n📋 Final Call Details:', 'bright');
            log('═══════════════════════════════════════', 'cyan');
            log(`   Call SID: ${details.sid}`, 'cyan');
            log(`   Status: ${details.status}`, 'cyan');
            log(`   Duration: ${details.duration || 0} seconds`, 'cyan');
            log(`   Answered By: ${details.answeredBy || 'N/A'}`, 'cyan');
            log(`   Start Time: ${details.startTime || 'N/A'}`, 'cyan');
            log(`   End Time: ${details.endTime || 'N/A'}`, 'cyan');
            log(`   Price: ${details.price || 'N/A'} ${details.priceUnit || ''}`, 'cyan');

            // Try to get recording
            if (details.status === 'completed') {
              log('\n🎙️  Fetching Call Recording...', 'blue');
              
              // Wait a few seconds for recording to be ready
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              try {
                const recording = await twilioService.getCallRecording(callResult.callSid);
                
                if (recording) {
                  log('✅ Recording Available:', 'green');
                  log(`   URL: ${recording.url}`, 'cyan');
                  log(`   Duration: ${recording.duration} seconds`, 'cyan');
                } else {
                  log('⚠️  Recording not yet available (may take a few minutes)', 'yellow');
                }
              } catch (error) {
                log('⚠️  Could not fetch recording', 'yellow');
              }
            }

            log('\n✅ Test Complete!', 'green');
            log('═══════════════════════════════════════\n', 'cyan');
            process.exit(0);
          }
        }
      } catch (error) {
        log(`❌ Error monitoring call: ${error.message}`, 'red');
        clearInterval(monitorInterval);
        process.exit(1);
      }
    }, 2000); // Check every 2 seconds

  } catch (error) {
    log(`\n❌ Test Failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n👋 Test interrupted by user', 'yellow');
  process.exit(0);
});

// Run the test
testOutboundCall();

