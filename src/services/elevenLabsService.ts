import ElevenLabs from 'elevenlabs';
import fs from 'fs';
import path from 'path';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface GenerateSpeechOptions {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: string;
}

class ElevenLabsService {
  private client: any | null = null;
  private isDemo: boolean = false;

  // Otto - Custom AutoLux AI Agent (NEW)
  private readonly OTTO_AGENT_ID = 'agent_2201k8q07eheexe8j4vkt0b9vecb';

  // Professional automotive voice configurations
  private readonly VOICE_PROFILES = {
    // Professional female voice for customer service
    SARAH_PROFESSIONAL: {
      voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - professional female
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.2,
        use_speaker_boost: true
      }
    },
    // Warm male voice for sales
    MICHAEL_SALES: {
      voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam - confident male
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true
      }
    },
    // Calm voice for emergency situations
    ALEX_EMERGENCY: {
      voice_id: 'onwK4e9ZLuTAKqWW03F9', // Daniel - calm and reassuring
      voice_settings: {
        stability: 0.9,
        similarity_boost: 0.75,
        style: 0.1,
        use_speaker_boost: true
      }
    }
  };

  constructor() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey || apiKey === '' || apiKey === 'demo-key-for-testing' || apiKey === 'your_elevenlabs_api_key_here') {
      console.log('ElevenLabs API key not configured - voice features will use demo mode');
      this.isDemo = true;
    } else {
      console.log('ElevenLabs API key configured - voice features enabled');
      this.isDemo = false;
      // For now, we'll use the WebSocket connection directly in TwiML
      // The actual ElevenLabs client initialization can be done later
    }
  }

  /**
   * Generate speech from text using ElevenLabs
   */
  async generateSpeech(options: GenerateSpeechOptions): Promise<Buffer | string> {
    if (this.isDemo) {
      return this.getDemoAudioUrl(options.text);
    }

    if (!this.client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      const voiceProfile = this.getVoiceProfile(options.voice_id);
      
      const audioStream = await this.client.textToSpeech.convert({
        voice_id: voiceProfile.voice_id,
        text: options.text,
        model_id: options.model_id || 'eleven_multilingual_v2',
        voice_settings: options.voice_settings || voiceProfile.voice_settings,
        output_format: options.output_format || 'mp3_44100_128'
      });

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Generate speech and save to file
   */
  async generateSpeechToFile(options: GenerateSpeechOptions, outputPath: string): Promise<string> {
    const audioBuffer = await this.generateSpeech(options);
    
    if (typeof audioBuffer === 'string') {
      // Demo mode - return demo URL
      return audioBuffer;
    }

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write audio buffer to file
    fs.writeFileSync(outputPath, audioBuffer);
    return outputPath;
  }

  /**
   * Generate automotive-specific responses
   */
  async generateAutomotiveResponse(
    scenario: 'greeting' | 'sales' | 'service' | 'emergency' | 'appointment' | 'custom',
    customText?: string,
    customerName?: string
  ): Promise<Buffer | string> {
    let text = '';
    let voiceProfile = 'SARAH_PROFESSIONAL';

    switch (scenario) {
      case 'greeting':
        text = `Hello and thank you for calling AutoLux Intelligence, your premier luxury automotive destination. ${customerName ? `Hello ${customerName}, ` : ''}How may I assist you today?`;
        voiceProfile = 'SARAH_PROFESSIONAL';
        break;

      case 'sales':
        text = `Thank you for your interest in our luxury vehicle collection. ${customerName ? `${customerName}, ` : ''}I'd be delighted to help you find the perfect vehicle that matches your lifestyle and preferences. Would you like to hear about our current inventory or schedule a test drive?`;
        voiceProfile = 'MICHAEL_SALES';
        break;

      case 'service':
        text = `I understand you need assistance with your vehicle service. ${customerName ? `${customerName}, ` : ''}Our certified technicians are here to ensure your luxury vehicle receives the highest quality care. Can you please describe the issue you're experiencing?`;
        voiceProfile = 'SARAH_PROFESSIONAL';
        break;

      case 'emergency':
        text = `I understand this is an emergency situation and I'm here to help you immediately. ${customerName ? `${customerName}, ` : ''}Please stay calm. Can you confirm your current location so we can dispatch our roadside assistance team right away?`;
        voiceProfile = 'ALEX_EMERGENCY';
        break;

      case 'appointment':
        text = `I'd be happy to help you schedule your service appointment. ${customerName ? `${customerName}, ` : ''}Our service center offers convenient scheduling options to fit your busy lifestyle. What type of service does your vehicle need?`;
        voiceProfile = 'SARAH_PROFESSIONAL';
        break;

      case 'custom':
        text = customText || 'Thank you for calling AutoLux Intelligence. How may I assist you today?';
        voiceProfile = 'SARAH_PROFESSIONAL';
        break;
    }

    return await this.generateSpeech({
      text,
      voice_id: voiceProfile
    });
  }

  /**
   * Generate Twilio-compatible TwiML with ElevenLabs audio
   */
  async generateTwiMLWithVoice(
    scenario: 'greeting' | 'sales' | 'service' | 'emergency' | 'appointment' | 'custom',
    customText?: string,
    customerName?: string,
    gatherOptions?: {
      numDigits?: number;
      action?: string;
      timeout?: number;
    }
  ): Promise<string> {
    try {
      // Generate audio file
      const timestamp = Date.now();
      const audioFileName = `autolux_${scenario}_${timestamp}.mp3`;
      const audioPath = path.join(process.cwd(), 'public', 'audio', audioFileName);
      
      const audioFile = await this.generateSpeechToFile(
        {
          text: await this.getScenarioText(scenario, customText, customerName),
          voice_id: this.getScenarioVoice(scenario)
        },
        audioPath
      );

      // Generate TwiML
      const twilio = require('twilio');
      const twiml = new twilio.twiml.VoiceResponse();

      if (gatherOptions) {
        const gather = twiml.gather({
          numDigits: gatherOptions.numDigits || 1,
          action: gatherOptions.action || '/api/calls/twiml/process-input',
          method: 'POST',
          timeout: gatherOptions.timeout || 10
        });
        
        if (this.isDemo) {
          gather.say(await this.getScenarioText(scenario, customText, customerName));
        } else {
          gather.play(`${process.env.BASE_URL}/audio/${audioFileName}`);
        }
      } else {
        if (this.isDemo) {
          twiml.say(await this.getScenarioText(scenario, customText, customerName));
        } else {
          twiml.play(`${process.env.BASE_URL}/audio/${audioFileName}`);
        }
      }

      return twiml.toString();
    } catch (error) {
      console.error('Error generating TwiML with voice:', error);
      
      // Fallback to basic TwiML
      const twilio = require('twilio');
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say(await this.getScenarioText(scenario, customText, customerName));
      return twiml.toString();
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<any[]> {
    if (this.isDemo) {
      return [
        { voice_id: 'SARAH_PROFESSIONAL', name: 'Sarah - Professional Customer Service' },
        { voice_id: 'MICHAEL_SALES', name: 'Michael - Sales Representative' },
        { voice_id: 'ALEX_EMERGENCY', name: 'Alex - Emergency Response' }
      ];
    }

    if (!this.client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      const voices = await this.client.voices.getAll();
      return voices.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Private helper methods
  private getVoiceProfile(voiceId?: string) {
    if (!voiceId || !this.VOICE_PROFILES[voiceId as keyof typeof this.VOICE_PROFILES]) {
      return this.VOICE_PROFILES.SARAH_PROFESSIONAL;
    }
    return this.VOICE_PROFILES[voiceId as keyof typeof this.VOICE_PROFILES];
  }

  private async getScenarioText(scenario: string, customText?: string, customerName?: string): Promise<string> {
    // This would normally call generateAutomotiveResponse, but simplified for TwiML
    switch (scenario) {
      case 'greeting':
        return `Hello and thank you for calling AutoLux Intelligence. ${customerName ? `Hello ${customerName}, ` : ''}How may I assist you today?`;
      case 'sales':
        return `Thank you for your interest in our luxury vehicles. ${customerName ? `${customerName}, ` : ''}I'd be delighted to help you find the perfect vehicle.`;
      case 'service':
        return `I understand you need vehicle service assistance. ${customerName ? `${customerName}, ` : ''}Our certified technicians are here to help.`;
      case 'emergency':
        return `I understand this is an emergency. ${customerName ? `${customerName}, ` : ''}Please stay calm while I connect you with roadside assistance.`;
      case 'appointment':
        return `I'd be happy to help schedule your appointment. ${customerName ? `${customerName}, ` : ''}What type of service do you need?`;
      default:
        return customText || 'Thank you for calling AutoLux Intelligence. How may I assist you today?';
    }
  }

  /**
   * Start a conversation with Otto agent
   */
  async startOttoConversation(customerName?: string, callContext?: any): Promise<any> {
    // For now, always return demo response since we're using WebSocket connection directly
    return {
      conversation_id: 'demo-conversation-' + Date.now(),
      agent_id: this.OTTO_AGENT_ID,
      status: 'active',
      message: `Hello ${customerName || 'valued customer'}, this is Otto from AutoLux. How can I assist you today?`
    };

    try {
      // Initialize conversation with Otto
      const conversation = await this.client.conversationalAI.createConversation({
        agent_id: this.OTTO_AGENT_ID,
        // Add customer context if available
        ...(customerName && {
          context: {
            customer_name: customerName,
            business: 'AutoLux Premium Automotive',
            ...callContext
          }
        })
      });

      return conversation;
    } catch (error) {
      console.error('Failed to start Otto conversation:', error);
      throw error;
    }
  }

  /**
   * Send message to Otto and get response
   */
  async sendMessageToOtto(conversationId: string, message: string): Promise<any> {
    if (this.isDemo) {
      return {
        response: this.getDemoOttoResponse(message),
        audio_url: `https://demo-audio-url.com/otto-response?msg=${encodeURIComponent(message)}`,
        conversation_id: conversationId
      };
    }

    if (!this.client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      const response = await this.client.conversationalAI.sendMessage({
        conversation_id: conversationId,
        message: message
      });

      return response;
    } catch (error) {
      console.error('Failed to send message to Otto:', error);
      throw error;
    }
  }

  /**
   * Generate TwiML for Otto agent phone integration
   */
  generateOttoTwiML(customerName?: string, callContext?: any): string {
    const greeting = customerName
      ? `Hello ${customerName}, this is Otto from AutoLux Premium Automotive.`
      : 'Hello, this is Otto from AutoLux Premium Automotive.';

    // Use ElevenLabs Conversational AI with proper WebSocket URL
    if (!this.isDemo && process.env.ELEVENLABS_API_KEY) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://api.elevenlabs.io/v1/convai/conversation/ws">
            <Parameter name="agent_id" value="${this.OTTO_AGENT_ID}" />
            <Parameter name="authorization" value="Bearer ${process.env.ELEVENLABS_API_KEY}" />
        </Stream>
    </Connect>
</Response>`;
    }

    // Demo mode with better voice quality
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Matthew-Neural">${greeting} How can I assist you with your automotive needs today?</Say>
    <Gather input="speech" action="/api/twilio/otto/response" method="POST" speechTimeout="5" speechModel="phone_call">
        <Say voice="Polly.Matthew-Neural">Please tell me how I can help you with your vehicle today.</Say>
    </Gather>
</Response>`;
  }

  /**
   * Get demo response from Otto for testing
   */
  private getDemoOttoResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('emergency') || lowerMessage.includes('breakdown') || lowerMessage.includes('towing')) {
      return "I understand you're experiencing an emergency. I'm immediately connecting you to our roadside assistance team. Can you please tell me your current location and describe the issue with your vehicle?";
    }

    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('service')) {
      return "I'd be happy to help you schedule a service appointment. What type of service do you need, and what days work best for you? We have availability this week and next.";
    }

    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('vehicle') || lowerMessage.includes('car')) {
      return "Excellent! I can help you find the perfect vehicle. What type of vehicle are you looking for? We have a premium selection of luxury vehicles including Mercedes-Benz, BMW, Audi, and more.";
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('financing')) {
      return "I can provide you with pricing information and financing options. We offer competitive rates and flexible payment plans. Would you like me to connect you with our finance specialist?";
    }

    return "Thank you for contacting AutoLux. I'm here to help with any automotive needs you may have. Whether it's sales, service, or emergency assistance, I can connect you with the right specialist. How can I assist you today?";
  }

  private getScenarioVoice(scenario: string): string {
    switch (scenario) {
      case 'sales':
        return 'MICHAEL_SALES';
      case 'emergency':
        return 'ALEX_EMERGENCY';
      default:
        return 'SARAH_PROFESSIONAL';
    }
  }

  private getDemoAudioUrl(text: string): string {
    // In demo mode, return a placeholder URL
    return `https://demo-audio-url.com/tts?text=${encodeURIComponent(text)}`;
  }
}

export default new ElevenLabsService();
