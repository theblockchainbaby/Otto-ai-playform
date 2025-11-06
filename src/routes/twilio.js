const express = require('express');
const twilio = require('twilio');
const WebSocket = require('ws');

const router = express.Router();

// NOTE: WebSocket support is enabled on the main app in server.js
// DO NOT call expressWs(router) here - it will conflict with the main app setup

// Twilio Media Stream configuration
const TWILIO_SAMPLE_RATE = 8000; // 8kHz
const TWILIO_CHUNK_SIZE = 160; // 20ms chunks at 8kHz mulaw = 160 bytes
const CHUNK_INTERVAL_MS = 20; // Send chunk every 20ms

// μ-law encoding lookup table (for PCM to μ-law conversion)
const MULAW_BIAS = 0x84;
const MULAW_MAX = 0x1FFF;
const mulawCompressTable = [
  0,0,1,1,2,2,2,2,3,3,3,3,3,3,3,3,
  4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
  5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
  5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7
];

// Convert 16-bit PCM sample to μ-law
function pcmToMulaw(pcmSample) {
  // Clamp to 16-bit signed range
  let sample = Math.max(-32768, Math.min(32767, pcmSample));
  
  // Get sign and magnitude
  const sign = (sample >> 8) & 0x80;
  if (sign) sample = -sample;
  if (sample > MULAW_MAX) sample = MULAW_MAX;
  
  sample = sample + MULAW_BIAS;
  const exponent = mulawCompressTable[(sample >> 7) & 0xFF];
  const mantissa = (sample >> (exponent + 3)) & 0x0F;
  const mulawByte = ~(sign | (exponent << 4) | mantissa);
  
  return mulawByte & 0xFF;
}

// Twilio webhook endpoint - Otto incoming calls
router.post('/otto/incoming', async (req, res) => {
  try {
    const { From, To, CallSid, CallerName } = req.body;

    console.log('🔊🔊🔊 OTTO INCOMING CALL 🔊🔊🔊');
    console.log('From:', From);
    console.log('To:', To);
    console.log('CallSid:', CallSid);
    console.log('CallerName:', CallerName);

    // Recognize customer by phone number (if database is available)
    if (req.app.locals.prisma && From) {
      try {
        const customer = await req.app.locals.prisma.customer.findFirst({
          where: { phone: From },
          include: {
            vehicles: { take: 3, orderBy: { createdAt: 'desc' } },
            appointments: { take: 3, orderBy: { createdAt: 'desc' } }
          }
        });

        if (customer) {
          console.log(`✅ Customer recognized: ${customer.firstName} ${customer.lastName}`);
        } else {
          console.log(`ℹ️  Unknown caller: ${From}`);
        }
      } catch (dbError) {
        console.error('❌ Database error (non-fatal):', dbError.message);
      }
    }

    // Create TwiML response
    const voiceResponse = new twilio.twiml.VoiceResponse();
    const connect = voiceResponse.connect();
    
    // Connect to media stream proxy
    const host = process.env.HOST || req.get('host');
    connect.stream({
      url: `wss://${host}/api/twilio/media-stream`
    });

    console.log('📤📤📤 SENDING TWIML 📤📤📤');
    console.log('TwiML:', voiceResponse.toString());
    
    res.type('text/xml');
    res.send(voiceResponse.toString());
    console.log('✅✅✅ TWIML SENT ✅✅✅');
  } catch (error) {
    console.error('❌ Error in /api/twilio/otto/incoming:', error);

    const response = new twilio.twiml.VoiceResponse();
    response.say('Hello, this is Otto from AutoLux. We are experiencing technical difficulties. Please call back shortly.');

    res.type('text/xml');
    res.send(response.toString());
  }
});

// Test WebSocket endpoint
router.ws('/test', (ws, req) => {
  console.log('🧪 Test WebSocket connection established');
  ws.send('WebSocket connection successful!');
  ws.on('message', (msg) => {
    console.log('🧪 Received test message:', msg.toString());
    ws.send(`Echo: ${msg}`);
  });
  ws.on('close', () => {
    console.log('🧪 Test WebSocket closed');
  });
});

// Express-WS route for media stream (preferred method for Render)
console.log('🔧 Registering WebSocket route: /media-stream');
router.ws('/media-stream', (twilioWs, req) => {
  console.log('📱📱📱 WEBSOCKET CONNECTION ESTABLISHED 📱📱📱');
  console.log('📍 Request URL:', req.url);
  console.log('📍 Request headers:', JSON.stringify(req.headers, null, 2));
  handleMediaStreamConnection(twilioWs, req);
});
console.log('✅ WebSocket route registered');

// WebSocket handler for media stream
function handleMediaStreamConnection(twilioWs, request) {
  console.log('📱📱📱 MEDIA STREAM HANDLER STARTED 📱📱📱');
  console.log('WebSocket readyState:', twilioWs.readyState);
  console.log('WebSocket protocol:', twilioWs.protocol);
  
  let callSid = null;
  let streamSid = null;
  let elevenLabsWs = null;
  const agentId = process.env.OTTO_AGENT_ID || 'agent_2201k8q07eheexe8j4vkt0b9vecb';
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
  
  console.log('🔑 Agent ID:', agentId);
  console.log('🔑 API Key present:', !!elevenLabsKey);

  // Function to convert PCM to ulaw and send to Twilio
  function sendAudioInChunks(base64Audio) {
    try {
      // Decode base64 to buffer (ElevenLabs sends PCM 16-bit @ 16kHz)
      const pcmBuffer = Buffer.from(base64Audio, 'base64');
      
      console.log(`🎵 Processing ${pcmBuffer.length} bytes PCM`);
      
      // Downsample from 16kHz to 8kHz (simple decimation - take every other sample)
      const samples16k = [];
      for (let i = 0; i < pcmBuffer.length; i += 2) {
        samples16k.push(pcmBuffer.readInt16LE(i));
      }
      
      const samples8k = [];
      for (let i = 0; i < samples16k.length; i += 2) {
        samples8k.push(samples16k[i]);
      }
      
      console.log(`🔽 Downsampled from ${samples16k.length} to ${samples8k.length} samples`);
      
      // Convert to ulaw
      const ulawBuffer = Buffer.alloc(samples8k.length);
      for (let i = 0; i < samples8k.length; i++) {
        ulawBuffer[i] = pcmToMulaw(samples8k[i]);
      }
      
      console.log(`🎚️  Converted to ${ulawBuffer.length} bytes ulaw @ 8kHz`);
      console.log(`📦 Sending in ${TWILIO_CHUNK_SIZE}-byte chunks`);
      
      let offset = 0;
      let chunkCount = 0;

      // Split into chunks and send with timing
      const sendNextChunk = () => {
        if (offset >= ulawBuffer.length) {
          console.log(`✅ Sent ${chunkCount} ulaw chunks to Twilio`);
          return;
        }

        // Extract chunk
        const chunkEnd = Math.min(offset + TWILIO_CHUNK_SIZE, ulawBuffer.length);
        const chunk = ulawBuffer.slice(offset, chunkEnd);
        const base64Chunk = chunk.toString('base64');

        // Send to Twilio
        if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
          twilioWs.send(JSON.stringify({
            event: 'media',
            streamSid: streamSid,
            media: {
              payload: base64Chunk
            }
          }));
          chunkCount++;
        }

        offset = chunkEnd;

        // Schedule next chunk (20ms intervals for real-time audio)
        if (offset < ulawBuffer.length) {
          setTimeout(sendNextChunk, CHUNK_INTERVAL_MS);
        }
      };

      // Start sending chunks
      sendNextChunk();

    } catch (error) {
      console.error('❌ Error processing audio:', error);
      console.error(error.stack);
    }
  }

  twilioWs.on('message', async (message) => {
    try {
      const msg = JSON.parse(message.toString());
      console.log('📨 Received Twilio message:', msg.event);

      switch (msg.event) {
        case 'connected':
          console.log('✅✅✅ TWILIO CONNECTED EVENT ✅✅✅');
          break;

        case 'start':
          callSid = msg.start.callSid;
          streamSid = msg.start.streamSid;
          console.log('📞 Media stream started for', callSid);
          console.log('📊 Media format:', msg.start.mediaFormat);

          // Get signed URL from ElevenLabs
          try {
            console.log('🔑 Getting signed URL for agent', agentId);
            const signedUrlResponse = await fetch(
              `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
              {
                method: 'GET',
                headers: {
                  'xi-api-key': elevenLabsKey
                }
              }
            );

            if (!signedUrlResponse.ok) {
              throw new Error(`Failed to get signed URL: ${signedUrlResponse.statusText}`);
            }

            const { signed_url } = await signedUrlResponse.json();
            console.log('✅ Got signed URL for', callSid);

            // Connect to ElevenLabs
            console.log('🤖 Connecting to ElevenLabs...');
            elevenLabsWs = new WebSocket(signed_url);

            elevenLabsWs.on('open', () => {
              console.log('🤖 Connected to ElevenLabs for', callSid);
              console.log('🎙️  Audio streaming ready - requesting PCM 8kHz');
              
              // Send initial handshake - request PCM at 8kHz (we'll convert to ulaw)
              elevenLabsWs.send(JSON.stringify({
                type: 'conversation_initiation_client_data',
                conversation_config_override: {
                  agent: {
                    audio: {
                      encoding: 'pcm_16000',
                      output_format: 'pcm_16000'
                    }
                  }
                }
              }));
              console.log('🤝 Sent handshake to ElevenLabs requesting PCM 16kHz');
            });

            elevenLabsWs.on('message', (data) => {
              try {
                const elevenLabsMsg = JSON.parse(data.toString());
                
                console.log(`📨 ElevenLabs message type: ${elevenLabsMsg.type}`);
                
                // Handle ping events
                if (elevenLabsMsg.type === 'ping') {
                  const pongMessage = {
                    type: 'pong',
                    event_id: elevenLabsMsg.ping_event.event_id
                  };
                  elevenLabsWs.send(JSON.stringify(pongMessage));
                  console.log('🏓 Pong sent to ElevenLabs');
                }
                
                // Handle audio events
                if (elevenLabsMsg.type === 'audio' && elevenLabsMsg.audio_event && elevenLabsMsg.audio_event.audio_base_64) {
                  const audioData = elevenLabsMsg.audio_event.audio_base_64;
                  console.log('📨 ElevenLabs audio received:', audioData.length, 'bytes base64');
                  
                  // Decode to see actual binary size
                  const decoded = Buffer.from(audioData, 'base64');
                  console.log('📊 Decoded size:', decoded.length, 'bytes');
                  console.log('📊 First 10 bytes:', Array.from(decoded.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
                  
                  // Split and send in chunks with timing
                  sendAudioInChunks(audioData);
                }

                // Log transcripts
                if (elevenLabsMsg.type === 'user_transcript') {
                  console.log('👤 User:', elevenLabsMsg.user_transcription_event.user_transcript);
                }
                
                if (elevenLabsMsg.type === 'agent_response') {
                  console.log('🤖 Otto:', elevenLabsMsg.agent_response_event.agent_response);
                }

              } catch (error) {
                console.error('❌ Error parsing ElevenLabs message:', error);
              }
            });

            elevenLabsWs.on('error', (error) => {
              console.error('🤖 ElevenLabs error for', callSid, ':', error.message);
            });

            elevenLabsWs.on('close', (code, reason) => {
              console.log(`🤖 ElevenLabs closed for ${callSid} - Code: ${code}, Reason: ${reason || 'none'}`);
            });

          } catch (error) {
            console.error('❌ Error setting up ElevenLabs connection for', callSid, ':', error.message);
            twilioWs.close();
          }
          break;

        case 'media':
          // Forward caller audio to ElevenLabs (already in small chunks from Twilio)
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN && msg.media && msg.media.payload) {
            elevenLabsWs.send(JSON.stringify({
              user_audio_chunk: msg.media.payload
            }));
          }
          break;

        case 'stop':
          console.log('📞 Media stream stopped for', callSid);
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
            elevenLabsWs.close();
          }
          break;
      }

    } catch (error) {
      console.error('❌ Error processing Twilio message:', error);
    }
  });

  twilioWs.on('error', (error) => {
    console.error('❌❌❌ TWILIO WEBSOCKET ERROR ❌❌❌');
    console.error('Error:', error);
  });

  twilioWs.on('close', (code, reason) => {
    console.log('📱📱📱 TWILIO CONNECTION CLOSED 📱📱📱');
    console.log('CallSid:', callSid);
    console.log('Close code:', code);
    console.log('Close reason:', reason ? reason.toString() : 'none');
    if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
      elevenLabsWs.close();
    }
  });
}

// Export both router and handleMediaStreamConnection
module.exports = router;
module.exports.handleMediaStreamConnection = handleMediaStreamConnection;

