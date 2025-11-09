# ElevenLabs Agent Configuration Fix

## Problem
The agent is saying "Customer Name" instead of the actual customer name because ElevenLabs Conversational AI doesn't support dynamic variable substitution in the first message template when using WebSocket connections.

## Solution
Update the agent configuration at https://elevenlabs.io/app/conversational-ai

### Agent Settings to Change

**Agent ID**: `agent_8401k9gvthgyepjth51ya2sfh2k2`

**First Message** (remove template variables):
```
Hi, this is Otto with Vacaville Mitsubishi. I'm reaching out about scheduling your next service appointment. Do you have a quick minute to chat?
```

**System Prompt** (updated to handle name naturally):
```
You are Otto, a friendly and professional AI assistant for Vacaville Mitsubishi dealership. 

You're making outbound calls to existing customers to help schedule service appointments.

IMPORTANT: After your initial greeting, politely confirm who you're speaking with by saying something like "Am I speaking with [customer name from conversation]?" or "Is this [name]?" - wait for them to confirm before proceeding.

Your goals:
1. Greet the customer warmly
2. Confirm their identity naturally in conversation
3. Explain you're calling to schedule their next service appointment
4. Ask about their vehicle and service needs
5. Offer convenient appointment times
6. Confirm all details before ending

Be conversational, patient, and helpful. If they're busy, offer to call back at a better time.
```

## Alternative Approach (If Variables Must Work)
If we absolutely need to pass the customer name in the first message, we would need to:
1. Create a separate ElevenLabs agent for EACH customer (not scalable)
2. Use ElevenLabs REST API to create dynamic agents on-the-fly
3. OR accept that the agent will confirm the name naturally in conversation

## Recommended Solution
Use the generic first message above and have Otto confirm the customer's name naturally during the conversation. This is actually more professional since:
- It's more natural (like a real person calling)
- Verifies you're speaking to the right person
- Allows for wrong numbers or voicemail detection
- Works reliably without variable substitution issues
