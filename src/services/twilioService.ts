import twilio from 'twilio';

class TwilioService {
  private client: twilio.Twilio;
  private phoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = twilio(accountSid, authToken);
  }

  async makeCall(to: string, callbackUrl?: string): Promise<any> {
    try {
      const call = await this.client.calls.create({
        to: to,
        from: this.phoneNumber,
        url: callbackUrl || `${process.env.BASE_URL}/api/calls/twiml/outbound`,
        record: true,
        recordingStatusCallback: `${process.env.BASE_URL}/api/calls/recording-status`,
      });

      return {
        sid: call.sid,
        status: call.status,
        direction: call.direction,
        to: call.to,
        from: call.from,
      };
    } catch (error) {
      console.error('Error making call:', error);
      throw new Error('Failed to initiate call');
    }
  }

  async sendSMS(to: string, message: string): Promise<any> {
    try {
      const sms = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: to,
      });

      return {
        sid: sms.sid,
        status: sms.status,
        to: sms.to,
        from: sms.from,
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async getCallDetails(callSid: string): Promise<any> {
    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        sid: call.sid,
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
        direction: call.direction,
        to: call.to,
        from: call.from,
      };
    } catch (error) {
      console.error('Error fetching call details:', error);
      throw new Error('Failed to fetch call details');
    }
  }

  async getCallRecordings(callSid: string): Promise<any[]> {
    try {
      const recordings = await this.client.recordings.list({
        callSid: callSid,
      });

      return recordings.map(recording => ({
        sid: recording.sid,
        uri: recording.uri,
        duration: recording.duration,
        dateCreated: recording.dateCreated,
      }));
    } catch (error) {
      console.error('Error fetching recordings:', error);
      throw new Error('Failed to fetch call recordings');
    }
  }

  generateTwiML(message: string): string {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say(message);
    return twiml.toString();
  }

  generateGatherTwiML(message: string, action: string, numDigits: number = 1): string {
    const twiml = new twilio.twiml.VoiceResponse();
    const gather = twiml.gather({
      numDigits: numDigits,
      action: action,
      method: 'POST',
    });
    gather.say(message);
    return twiml.toString();
  }
}

export default new TwilioService();
