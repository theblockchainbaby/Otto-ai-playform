const express = require('express');
const router = express.Router();
const OutboundCampaignService = require('../services/outboundCampaignService');
const ElevenLabsOutboundService = require('../services/elevenLabsOutboundService');
const WebSocket = require('ws');

const campaignService = new OutboundCampaignService();
const elevenLabsService = new ElevenLabsOutboundService(
  process.env.ELEVENLABS_API_KEY,
  process.env.ELEVENLABS_OUTBOUND_AGENT_ID
);

// Store active WebSocket connections for outbound calls
const activeOutboundCalls = new Map();

/**
 * Generate TwiML for outbound call - connects directly to ElevenLabs
 * Accepts both GET and POST from Twilio
 */
router.all('/twiml', async (req, res) => {
  const { customerId, customerName, campaignType, CallSid } = req.query;
  
  console.log(`📞 Generating TwiML for outbound call`);
  console.log(`   Customer: ${customerName}`);
  console.log(`   Campaign: ${campaignType}`);
  console.log(`   Call SID: ${CallSid}`);

  try {
    // Connect to our WebSocket proxy which will bridge to ElevenLabs
    const baseUrl = process.env.BASE_URL || 'https://ottoagent.net';
    const wsProtocol = baseUrl.includes('https') ? 'wss' : 'ws';
    const wsHost = baseUrl.replace('https://', '').replace('http://', '');
    const wsUrl = `${wsProtocol}://${wsHost}/api/twilio/outbound/media-stream`;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${wsUrl}">
            <Parameter name="customerName" value="${customerName || 'Customer'}" />
            <Parameter name="customerId" value="${customerId || ''}" />
            <Parameter name="campaignType" value="${campaignType || 'GENERAL'}" />
            <Parameter name="callSid" value="${CallSid || ''}" />
        </Stream>
    </Connect>
</Response>`;

    console.log('✅ TwiML generated - connecting to WebSocket proxy');
    
    res.type('text/xml');
    res.send(twiml);
    
  } catch (error) {
    console.error('❌ Error generating TwiML:', error);
    res.status(500).send('Error generating TwiML');
  }
});

/**
 * WebSocket endpoint for outbound call media streaming
 */
router.ws('/media-stream', async (ws, req) => {
  console.log('🔌 Outbound WebSocket connected');

  let callSid = null;
  let customerPhone = null;
  let customVariables = {};
  let elevenLabsWs = null;
  let streamSid = null;

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message);

      switch (msg.event) {
        case 'start':
          callSid = msg.start.callSid;
          streamSid = msg.start.streamSid;
          
          // Extract custom parameters from TwiML
          const customerName = msg.start.customParameters?.customerName || 'Customer';
          const customerId = msg.start.customParameters?.customerId || '';
          const campaignType = msg.start.customParameters?.campaignType || 'GENERAL';
          
          console.log(`📞 Outbound call started: ${callSid}`);
          console.log(`   Customer: ${customerName}`);
          console.log(`   Campaign: ${campaignType}`);

          // Get signed URL from ElevenLabs with custom variables
          // Note: Variable names must match exactly what's in the ElevenLabs agent configuration
          const signedUrl = await elevenLabsService.getOutboundSignedUrl({
            'Customer Name': customerName,
            'Dealership Name': 'Vacaville Mitsubishi',
            customer_id: customerId,
            campaign_type: campaignType
          });
          
          console.log(`✅ Got signed URL with variables: Customer Name="${customerName}"`);

          // Connect to ElevenLabs
          elevenLabsWs = new WebSocket(signedUrl);

          elevenLabsWs.on('open', () => {
            console.log('✅ Connected to ElevenLabs outbound agent');
            
            // Send initialization with custom variables
            const initMessage = {
              type: 'conversation_initiation_client_data',
              conversation_config_override: {
                agent: {
                  prompt: {
                    prompt: `You are Otto, an AI assistant for Vacaville Mitsubishi dealership. You are calling ${customerName}. Use their name naturally in conversation.`
                  },
                  first_message: `Hi ${customerName}, this is Otto with Vacaville Mitsubishi. I'm reaching out to help schedule your next service appointment. Do you have a quick minute?`
                }
              }
            };
            
            console.log(`📤 Sending custom first message with name: ${customerName}`);
            elevenLabsWs.send(JSON.stringify(initMessage));
          });

          // Handle audio from ElevenLabs (AI speaking) → send to Twilio
          elevenLabsWs.on('message', (data) => {
            try {
              const message = JSON.parse(data);

              if (message.type === 'audio') {
                // ElevenLabs sends PCM 16kHz, need to convert to mulaw 8kHz
                const pcmBuffer = Buffer.from(message.audio_event.audio_base_64, 'base64');
                const mulawBuffer = convertPcmToMulaw(pcmBuffer);

                // Send to Twilio
                const twilioMessage = {
                  event: 'media',
                  streamSid: streamSid,
                  media: {
                    payload: mulawBuffer.toString('base64')
                  }
                };
                ws.send(JSON.stringify(twilioMessage));
              }

              if (message.type === 'user_transcript') {
                console.log(`👤 Customer: ${message.user_transcript.transcript}`);
              }

              if (message.type === 'agent_response') {
                console.log(`🤖 Otto: ${message.agent_response.response}`);
              }

              if (message.type === 'conversation_end') {
                console.log('✅ ElevenLabs conversation ended');
                ws.close();
              }

            } catch (error) {
              console.error('Error processing ElevenLabs message:', error);
            }
          });

          elevenLabsWs.on('error', (error) => {
            console.error('❌ ElevenLabs WebSocket error:', error);
          });

          // Store connection
          activeOutboundCalls.set(callSid, {
            twilioWs: ws,
            elevenLabsWs: elevenLabsWs,
            startTime: new Date()
          });
          break;

        case 'media':
          // Customer audio from Twilio → forward to ElevenLabs
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
            // Convert mulaw 8kHz to PCM 16kHz
            const mulawBuffer = Buffer.from(msg.media.payload, 'base64');
            const pcmBuffer = convertMulawToPcm(mulawBuffer);

            const elevenLabsMessage = {
              user_audio_chunk: pcmBuffer.toString('base64')
            };
            elevenLabsWs.send(JSON.stringify(elevenLabsMessage));
          }
          break;

        case 'stop':
          console.log('📞 Outbound call ended:', callSid);
          
          if (elevenLabsWs) {
            elevenLabsWs.close();
          }
          
          activeOutboundCalls.delete(callSid);
          break;
      }
    } catch (error) {
      console.error('❌ Error handling Twilio message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Outbound WebSocket closed');
    if (elevenLabsWs) {
      elevenLabsWs.close();
    }
  });

  ws.on('error', (error) => {
    console.error('❌ Twilio WebSocket error:', error);
  });
});

/**
 * Status callback - track call status changes
 */
router.post('/status-callback', async (req, res) => {
  const { CallSid, CallStatus, CallDuration, AnsweredBy, To, From } = req.body;

  console.log(`📊 Call status: ${CallSid} - ${CallStatus}`);

  if (CallStatus === 'completed') {
    await campaignService.handleCallCompleted(CallSid, req.body);
  }

  res.sendStatus(200);
});

/**
 * AMD callback - answering machine detection results
 */
router.post('/amd-callback', async (req, res) => {
  const { CallSid, AnsweredBy } = req.body;

  console.log(`🤖 AMD Result: ${CallSid} - ${AnsweredBy}`);

  // AnsweredBy values: human, machine_start, machine_end_beep, machine_end_silence, machine_end_other, fax, unknown
  
  if (AnsweredBy === 'machine_start' || AnsweredBy.startsWith('machine_')) {
    console.log('📞 Voicemail detected - Otto will leave message');
    // Otto will automatically handle this based on its training
  } else if (AnsweredBy === 'human') {
    console.log('👤 Human answered - proceeding with conversation');
  }

  res.sendStatus(200);
});

/**
 * Recording callback - get recording URL when call completes
 */
router.post('/recording-callback', async (req, res) => {
  const { CallSid, RecordingUrl, RecordingSid, RecordingDuration } = req.body;

  console.log(`🎙️ Recording available: ${RecordingSid} (${RecordingDuration}s)`);
  console.log(`   URL: ${RecordingUrl}`);

  // Store recording URL in database
  try {
    await prisma.outboundCall.update({
      where: { callSid: CallSid },
      data: {
        recordingUrl: RecordingUrl,
        recordingSid: RecordingSid,
        recordingDuration: parseInt(RecordingDuration)
      }
    });
  } catch (error) {
    console.error('Error saving recording:', error);
  }

  res.sendStatus(200);
});

// ==================== Audio Conversion Functions ====================

// mulaw encoding/decoding tables
const MULAW_ENCODE = [
  0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3,
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7
];

const MULAW_DECODE = [
  -32124, -31100, -30076, -29052, -28028, -27004, -25980, -24956,
  -23932, -22908, -21884, -20860, -19836, -18812, -17788, -16764,
  -15996, -15484, -14972, -14460, -13948, -13436, -12924, -12412,
  -11900, -11388, -10876, -10364, -9852, -9340, -8828, -8316,
  -7932, -7676, -7420, -7164, -6908, -6652, -6396, -6140,
  -5884, -5628, -5372, -5116, -4860, -4604, -4348, -4092,
  -3900, -3772, -3644, -3516, -3388, -3260, -3132, -3004,
  -2876, -2748, -2620, -2492, -2364, -2236, -2108, -1980,
  -1884, -1820, -1756, -1692, -1628, -1564, -1500, -1436,
  -1372, -1308, -1244, -1180, -1116, -1052, -988, -924,
  -876, -844, -812, -780, -748, -716, -684, -652,
  -620, -588, -556, -524, -492, -460, -428, -396,
  -372, -356, -340, -324, -308, -292, -276, -260,
  -244, -228, -212, -196, -180, -164, -148, -132,
  -120, -112, -104, -96, -88, -80, -72, -64,
  -56, -48, -40, -32, -24, -16, -8, 0,
  32124, 31100, 30076, 29052, 28028, 27004, 25980, 24956,
  23932, 22908, 21884, 20860, 19836, 18812, 17788, 16764,
  15996, 15484, 14972, 14460, 13948, 13436, 12924, 12412,
  11900, 11388, 10876, 10364, 9852, 9340, 8828, 8316,
  7932, 7676, 7420, 7164, 6908, 6652, 6396, 6140,
  5884, 5628, 5372, 5116, 4860, 4604, 4348, 4092,
  3900, 3772, 3644, 3516, 3388, 3260, 3132, 3004,
  2876, 2748, 2620, 2492, 2364, 2236, 2108, 1980,
  1884, 1820, 1756, 1692, 1628, 1564, 1500, 1436,
  1372, 1308, 1244, 1180, 1116, 1052, 988, 924,
  876, 844, 812, 780, 748, 716, 684, 652,
  620, 588, 556, 524, 492, 460, 428, 396,
  372, 356, 340, 324, 308, 292, 276, 260,
  244, 228, 212, 196, 180, 164, 148, 132,
  120, 112, 104, 96, 88, 80, 72, 64,
  56, 48, 40, 32, 24, 16, 8, 0
];

function pcmToMulaw(sample) {
  const sign = sample < 0 ? 0x80 : 0x00;
  let magnitude = Math.abs(sample);
  magnitude = Math.min(magnitude, 32635);
  const exponent = MULAW_ENCODE[(magnitude >> 7) & 0xFF];
  const mantissa = (magnitude >> (exponent + 3)) & 0x0F;
  const mulaw = ~(sign | (exponent << 4) | mantissa);
  return mulaw & 0xFF;
}

function mulawToPcm(mulawByte) {
  return MULAW_DECODE[mulawByte];
}

function convertPcmToMulaw(pcmBuffer) {
  // PCM 16kHz 16-bit → downsample to 8kHz → convert to mulaw
  const pcm16bit = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);
  const downsampledLength = Math.floor(pcm16bit.length / 2);
  const mulawBuffer = Buffer.alloc(downsampledLength);

  for (let i = 0; i < downsampledLength; i++) {
    const sample = pcm16bit[i * 2]; // Downsample: take every 2nd sample
    mulawBuffer[i] = pcmToMulaw(sample);
  }

  return mulawBuffer;
}

function convertMulawToPcm(mulawBuffer) {
  // mulaw 8kHz → convert to PCM → upsample to 16kHz
  const upsampledLength = mulawBuffer.length * 2;
  const pcmBuffer = Buffer.alloc(upsampledLength * 2); // 16-bit samples
  const pcm16bit = new Int16Array(pcmBuffer.buffer);

  for (let i = 0; i < mulawBuffer.length; i++) {
    const sample = mulawToPcm(mulawBuffer[i]);
    pcm16bit[i * 2] = sample; // Upsample: duplicate samples
    pcm16bit[i * 2 + 1] = sample;
  }

  return pcmBuffer;
}

module.exports = router;
