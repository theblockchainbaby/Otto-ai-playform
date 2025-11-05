import WebSocket from 'ws';

/**
 * Media Stream Proxy - Bridges Twilio Media Streams to ElevenLabs ConvAI
 * 
 * Twilio sends audio via Media Streams protocol (JSON messages with start, media, stop events)
 * This proxy converts those to ElevenLabs' WebSocket protocol
 */

export class MediaStreamProxy {
  private twilioWs: WebSocket | null = null;
  private elevenLabsWs: WebSocket | null = null;
  private streamSid: string = '';
  private callSid: string = '';

  constructor(
    private agentId: string,
    private apiKey: string
  ) {}

  /**
   * Handle incoming Twilio Media Stream WebSocket connection
   */
  handleTwilioConnection(ws: WebSocket, streamSid: string, callSid: string) {
    this.twilioWs = ws;
    this.streamSid = streamSid;
    this.callSid = callSid;

    console.log(`📱 Twilio Media Stream connected: ${streamSid}`);

    // Connect to ElevenLabs
    this.connectToElevenLabs();

    // Handle Twilio messages
    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        this.handleTwilioMessage(message);
      } catch (error) {
        console.error('Error parsing Twilio message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`📱 Twilio Media Stream closed: ${streamSid}`);
      if (this.elevenLabsWs) {
        this.elevenLabsWs.close();
      }
    });

    ws.on('error', (error) => {
      console.error('Twilio WebSocket error:', error);
    });
  }

  /**
   * Connect to ElevenLabs ConvAI WebSocket
   */
  private connectToElevenLabs() {
    const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation/ws?agent_id=${this.agentId}&xi-api-key=${this.apiKey}`;

    this.elevenLabsWs = new WebSocket(wsUrl);

    this.elevenLabsWs.on('open', () => {
      console.log(`🤖 Connected to ElevenLabs agent: ${this.agentId}`);
    });

    this.elevenLabsWs.on('message', (data: Buffer) => {
      // Forward ElevenLabs audio back to Twilio
      if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
        try {
          // ElevenLabs sends audio data, we need to convert it to Twilio Media format
          this.sendAudioToTwilio(data);
        } catch (error) {
          console.error('Error forwarding audio to Twilio:', error);
        }
      }
    });

    this.elevenLabsWs.on('close', () => {
      console.log('🤖 ElevenLabs connection closed');
      if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
        this.twilioWs.close();
      }
    });

    this.elevenLabsWs.on('error', (error) => {
      console.error('ElevenLabs WebSocket error:', error);
    });
  }

  /**
   * Handle messages from Twilio Media Stream
   */
  private handleTwilioMessage(message: any) {
    const { event, streamSid, media, start } = message;

    switch (event) {
      case 'start':
        console.log(`📞 Media stream started: ${streamSid}`);
        // Send initial message to ElevenLabs if needed
        break;

      case 'media':
        // Forward audio from Twilio to ElevenLabs
        if (media && media.payload && this.elevenLabsWs && this.elevenLabsWs.readyState === WebSocket.OPEN) {
          try {
            // Decode base64 audio from Twilio
            const audioBuffer = Buffer.from(media.payload, 'base64');
            this.elevenLabsWs.send(audioBuffer);
          } catch (error) {
            console.error('Error forwarding audio to ElevenLabs:', error);
          }
        }
        break;

      case 'stop':
        console.log(`📞 Media stream stopped: ${streamSid}`);
        if (this.elevenLabsWs) {
          this.elevenLabsWs.close();
        }
        break;

      default:
        console.log(`Unknown Twilio event: ${event}`);
    }
  }

  /**
   * Send audio from ElevenLabs back to Twilio
   */
  private sendAudioToTwilio(audioData: Buffer) {
    if (!this.twilioWs || this.twilioWs.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Convert audio to base64 for Twilio Media format
      const base64Audio = audioData.toString('base64');

      const mediaMessage = {
        event: 'media',
        streamSid: this.streamSid,
        media: {
          payload: base64Audio
        }
      };

      this.twilioWs.send(JSON.stringify(mediaMessage));
    } catch (error) {
      console.error('Error sending audio to Twilio:', error);
    }
  }
}

export default MediaStreamProxy;

