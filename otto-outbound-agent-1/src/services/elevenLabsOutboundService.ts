import fetch from 'node-fetch';

class ElevenLabsOutboundService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  async initiateCall(agentId, customerNumber) {
    const response = await fetch(`${this.baseUrl}/calls/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        agent_id: agentId,
        customer_number: customerNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate call: ${response.statusText}`);
    }

    return response.json();
  }

  async processCallResponse(callSid) {
    const response = await fetch(`${this.baseUrl}/calls/${callSid}/status`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call status: ${response.statusText}`);
    }

    return response.json();
  }
}

export default ElevenLabsOutboundService;