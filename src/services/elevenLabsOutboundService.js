const axios = require('axios');
const WebSocket = require('ws');

class ElevenLabsOutboundService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.apiBase = 'https://api.elevenlabs.io/v1';
    this.outboundAgentId = process.env.ELEVENLABS_OUTBOUND_AGENT_ID;
  }

  /**
   * Create a new ElevenLabs conversational AI agent for outbound calls
   */
  async createOutboundAgent(config) {
    try {
      const response = await axios.post(
        `${this.apiBase}/convai/agents`,
        {
          name: config.name || 'Otto Outbound Agent',
          first_message: config.firstMessage || 'Hello! This is Otto calling from the dealership.',
          language: 'en',
          voice_id: config.voiceId || 'pNInz6obpgDQGcFmaJgB',
          prompt: config.prompt,
          tools: config.tools || [],
          conversation_config: {
            turn_timeout: 1.5,
            enable_backchannel: true,
            interruption_sensitivity: 0.5
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ ElevenLabs outbound agent created:', response.data.agent_id);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating outbound agent:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get signed WebSocket URL for outbound conversation
   */
  async getOutboundSignedUrl(customVariables = {}) {
    try {
      // ElevenLabs expects variables in a specific format
      const params = {
        agent_id: this.outboundAgentId
      };
      
      // Add custom variables with exact key names
      if (customVariables['Customer Name']) {
        params['Customer Name'] = customVariables['Customer Name'];
      }
      if (customVariables['Dealership Name']) {
        params['Dealership Name'] = customVariables['Dealership Name'];
      }
      
      console.log('🔧 Requesting signed URL with params:', params);
      
      const response = await axios.get(
        `${this.apiBase}/convai/conversation/get_signed_url`,
        {
          params,
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      console.log('✅ Got signed URL with variables embedded');
      return response.data.signed_url;
    } catch (error) {
      console.error('❌ Error getting signed URL:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Initiate outbound conversation
   * Returns a promise that resolves with conversation results
   */
  async startOutboundConversation(config) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🤖 Starting ElevenLabs outbound conversation');
        
        // Get signed URL with custom variables
        const signedUrl = await this.getOutboundSignedUrl({
          customer_name: config.customerName,
          customer_id: config.customerId,
          campaign_type: config.campaignType
        });

        // Connect to ElevenLabs WebSocket
        const elevenLabsWs = new WebSocket(signedUrl);
        
        const conversationData = {
          agentResponses: [],
          userTranscripts: [],
          audioChunks: [],
          startTime: new Date(),
          endTime: null,
          outcome: null
        };

        elevenLabsWs.on('open', () => {
          console.log('✅ Connected to ElevenLabs for outbound call');
          
          // Send initial handshake with audio config
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
        });

        elevenLabsWs.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            switch (message.type) {
              case 'conversation_initiation_metadata':
                console.log('📞 Conversation initiated');
                break;

              case 'audio':
                if (message.audio_event?.audio_base_64) {
                  conversationData.audioChunks.push(message.audio_event.audio_base_64);
                }
                break;

              case 'user_transcript':
                const userText = message.user_transcription_event?.user_transcript;
                if (userText) {
                  console.log('👤 Customer:', userText);
                  conversationData.userTranscripts.push({
                    timestamp: new Date(),
                    text: userText
                  });
                }
                break;

              case 'agent_response':
                const agentText = message.agent_response_event?.agent_response;
                if (agentText) {
                  console.log('🤖 Otto:', agentText);
                  conversationData.agentResponses.push({
                    timestamp: new Date(),
                    text: agentText
                  });
                }
                break;

              case 'ping':
                // Respond to keepalive
                elevenLabsWs.send(JSON.stringify({
                  type: 'pong',
                  event_id: message.ping_event.event_id
                }));
                break;

              case 'conversation_end':
                console.log('🏁 Conversation ended by ElevenLabs');
                conversationData.endTime = new Date();
                conversationData.outcome = 'COMPLETED';
                break;
            }
          } catch (error) {
            console.error('❌ Error parsing ElevenLabs message:', error);
          }
        });

        elevenLabsWs.on('close', (code, reason) => {
          console.log(`🤖 ElevenLabs connection closed - Code: ${code}, Reason: ${reason || 'none'}`);
          conversationData.endTime = conversationData.endTime || new Date();
          conversationData.outcome = conversationData.outcome || 'DISCONNECTED';
          
          resolve(conversationData);
        });

        elevenLabsWs.on('error', (error) => {
          console.error('❌ ElevenLabs WebSocket error:', error);
          reject(error);
        });

        // Store WebSocket reference for external audio injection
        conversationData.elevenLabsWs = elevenLabsWs;
        
        // Return immediately with WebSocket for Twilio integration
        if (config.returnWebSocket) {
          resolve({ elevenLabsWs, conversationData });
        }

      } catch (error) {
        console.error('❌ Error starting outbound conversation:', error);
        reject(error);
      }
    });
  }

  /**
   * Get conversation history/transcript
   */
  async getConversationTranscript(conversationId) {
    try {
      const response = await axios.get(
        `${this.apiBase}/convai/conversations/${conversationId}`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching conversation:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = ElevenLabsOutboundService;
