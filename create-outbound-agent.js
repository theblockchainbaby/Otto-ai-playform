const axios = require('axios');
require('dotenv').config();

async function createOutboundAgent() {
  console.log('🎙️  Creating ElevenLabs Outbound Agent for Otto');
  console.log('=============================================\n');

  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY not set in .env');
    process.exit(1);
  }

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/convai/agents/create',
      {
        conversation_config: {
          agent: {
            prompt: {
              prompt: `You are Otto, an AI assistant calling on behalf of a car dealership. You're making an outbound call to a customer.

CRITICAL RULES:
- Be warm, professional, and respectful
- Identify yourself immediately: "Hi, this is Otto calling from [Dealership Name]"
- State the purpose of your call clearly
- If voicemail detected, leave a concise message with callback number
- Handle objections gracefully - never be pushy
- Respect do-not-call requests immediately
- Keep calls under 2 minutes unless customer engages

CALL TYPES:
- APPOINTMENT_REMINDER: Remind about upcoming service appointment
- SERVICE_FOLLOWUP: Follow up after recent service visit
- SALES_OUTREACH: Inform about vehicle availability or promotions
- PAYMENT_REMINDER: Gentle reminder about outstanding balance

You have access to customer context via custom variables:
- customer_name: Customer's name
- vehicle_info: Vehicle make/model/year
- service_type: Type of service
- last_service: Last service date
- campaign_type: Purpose of this call

Always use natural conversational flow. If customer is busy, offer to call back at a better time.`,
              llm: 'gpt-4o-mini',
              temperature: 0.7,
              max_tokens: 500
            },
            first_message: "Hello! This is Otto calling. Can you hear me okay?",
            language: 'en'
          },
          tts: {
            voice_id: '21m00Tcm4TlvDq8ikWAM',  // Rachel voice
            model_id: 'eleven_flash_v2',  // Flash v2 (not v2.5)
            optimize_streaming_latency: 3,
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.0
          },
          asr: {
            quality: 'high',
            provider: 'elevenlabs'
          }
        },
        platform_settings: {
          widget: {}
        },
        name: 'Otto Outbound Agent'
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const agentId = response.data.agent_id;

    console.log('✅ Agent Created Successfully!\n');
    console.log(`Agent ID: ${agentId}`);
    console.log(`Agent URL: https://elevenlabs.io/app/talk-to?agent_id=${agentId}\n`);
    console.log('Add this to your .env file:');
    console.log(`ELEVENLABS_OUTBOUND_AGENT_ID="${agentId}"\n`);
    console.log('You can test the agent at:');
    console.log(`https://elevenlabs.io/app/talk-to?agent_id=${agentId}`);

  } catch (error) {
    console.error('❌ Failed to create agent');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

createOutboundAgent();
