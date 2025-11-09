#!/bin/bash

# Quick Test - Create ElevenLabs Outbound Agent

echo "🎙️  Creating ElevenLabs Outbound Agent for Otto"
echo "============================================="
echo ""

ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY}"

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "❌ ELEVENLABS_API_KEY not set"
    exit 1
fi

echo "📝 Creating outbound agent with system prompt..."

# Create agent
AGENT_RESPONSE=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are Otto, an AI assistant calling on behalf of a car dealership. You'\''re making an outbound call to a customer.\n\nCRITICAL RULES:\n- Be warm, professional, and respectful\n- Identify yourself immediately: \"Hi, this is Otto calling from [Dealership Name]\"\n- State the purpose of your call clearly\n- If voicemail detected, leave a concise message with callback number\n- Handle objections gracefully - never be pushy\n- Respect do-not-call requests immediately\n- Keep calls under 2 minutes unless customer engages\n\nCALL TYPES:\n- APPOINTMENT_REMINDER: Remind about upcoming service appointment\n- SERVICE_FOLLOWUP: Follow up after recent service visit\n- SALES_OUTREACH: Inform about vehicle availability or promotions\n- PAYMENT_REMINDER: Gentle reminder about outstanding balance\n\nYou have access to customer context via custom variables:\n- customer_name: Customer'\''s name\n- vehicle_info: Vehicle make/model/year\n- service_type: Type of service\n- last_service: Last service date\n- campaign_type: Purpose of this call\n\nAlways use natural conversational flow. If customer is busy, offer to call back at a better time.",
          "llm": "gpt-4o-mini",
          "temperature": 0.7,
          "max_tokens": 500
        },
        "first_message": "Hello! This is Otto calling. Can you hear me okay?",
        "language": "en"
      },
      "tts": {
        "voice_id": "21m00Tcm4TlvDq8ikWAM",
        "model_id": "eleven_turbo_v2_5",
        "optimize_streaming_latency": 3,
        "stability": 0.7,
        "similarity_boost": 0.8,
        "style": 0.0
      },
      "asr": {
        "quality": "high",
        "provider": "elevenlabs"
      }
    },
    "platform_settings": {
      "widget": {}
    },
    "name": "Otto Outbound Agent"
  }')

# Extract agent ID
AGENT_ID=$(echo "$AGENT_RESPONSE" | jq -r '.agent_id // empty')

if [ -z "$AGENT_ID" ]; then
    echo "❌ Failed to create agent"
    echo "$AGENT_RESPONSE" | jq .
    exit 1
fi

echo ""
echo "✅ Agent Created Successfully!"
echo ""
echo "Agent ID: $AGENT_ID"
echo "Agent URL: https://elevenlabs.io/app/talk-to?agent_id=$AGENT_ID"
echo ""
echo "Add this to your .env file:"
echo "ELEVENLABS_OUTBOUND_AGENT_ID=\"$AGENT_ID\""
echo ""
echo "You can test the agent at:"
echo "https://elevenlabs.io/app/talk-to?agent_id=$AGENT_ID"
