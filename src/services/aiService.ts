import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AIAnalysisResult {
  intent: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  suggestedResponse?: string;
  requiresHumanAttention: boolean;
  extractedInfo?: {
    customerName?: string;
    vehicleInfo?: string;
    contactInfo?: string;
    appointmentRequest?: boolean;
    emergencyType?: string;
  };
}

export interface AIResponseResult {
  response: string;
  confidence: number;
  shouldAutoSend: boolean;
  suggestedActions?: string[];
}

class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'demo-key-for-testing') {
      console.warn('OpenAI API key not configured - AI features will use mock responses');
      this.openai = null as any; // Will use mock responses
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  private isDemo(): boolean {
    return !this.openai || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key-for-testing';
  }

  async generateCallSummary(transcript: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that summarizes automotive dealership phone calls. 
            Create a concise summary that includes:
            - Customer's main interest/inquiry
            - Vehicle(s) discussed
            - Next steps or follow-up actions
            - Key concerns or objections
            Keep it professional and under 200 words.`
          },
          {
            role: 'user',
            content: `Please summarize this call transcript: ${transcript}`
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Unable to generate summary';
    } catch (error) {
      console.error('Error generating call summary:', error);
      throw new Error('Failed to generate call summary');
    }
  }

  async analyzeSentiment(text: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the sentiment of the following text and respond with only one word: 
            "positive", "negative", or "neutral". Consider the context of automotive sales.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      });

      const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim();
      return ['positive', 'negative', 'neutral'].includes(sentiment || '') ? sentiment! : 'neutral';
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 'neutral';
    }
  }

  async generateLeadFollowUp(leadData: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for automotive sales. Generate a personalized follow-up 
            message for a lead. Keep it professional, friendly, and focused on the customer's interests.
            Include specific vehicle details if available. Limit to 150 words.`
          },
          {
            role: 'user',
            content: `Generate a follow-up message for this lead: ${JSON.stringify(leadData)}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Thank you for your interest. Please let us know if you have any questions.';
    } catch (error) {
      console.error('Error generating follow-up:', error);
      throw new Error('Failed to generate follow-up message');
    }
  }

  async transcribeAudio(audioUrl: string): Promise<string> {
    if (this.isDemo()) {
      return this.getDemoTranscription();
    }

    try {
      // For real implementation, you would:
      // 1. Download the audio file from audioUrl
      // 2. Convert to supported format if needed
      // 3. Use OpenAI Whisper API for transcription

      console.log('Transcribing audio from:', audioUrl);

      // Placeholder for actual Whisper API call:
      // const response = await this.openai.audio.transcriptions.create({
      //   file: fs.createReadStream(audioFilePath),
      //   model: "whisper-1",
      //   language: "en",
      //   response_format: "text"
      // });
      // return response;

      return 'Real-time transcription requires OpenAI API key and audio file processing';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  // Real-time call analysis for live calls
  async analyzeCallInRealTime(transcript: string, callContext?: any): Promise<{
    sentiment: string;
    keywords: string[];
    urgency: string;
    suggestedActions: string[];
    customerSatisfaction: number;
    escalationRequired: boolean;
  }> {
    if (this.isDemo()) {
      return this.getDemoCallAnalysis(transcript);
    }

    try {
      const prompt = `
Analyze this live call transcript in real-time for AutoLux Intelligence automotive dealership:

Transcript: "${transcript}"
${callContext ? `Call Context: ${JSON.stringify(callContext)}` : ''}

Provide real-time analysis in JSON format:
{
    "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
    "suggestedActions": ["action1", "action2"],
    "customerSatisfaction": 1-10,
    "escalationRequired": true/false
}

Focus on:
- Current customer mood and satisfaction
- Key topics being discussed
- Any issues or concerns raised
- Opportunities for upselling or cross-selling
- Need for supervisor intervention
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 400
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error analyzing call in real-time:', error);
      return this.getDemoCallAnalysis(transcript);
    }
  }

  // Generate agent assistance during live calls
  async generateAgentAssistance(
    transcript: string,
    customerContext?: any,
    callObjective?: string
  ): Promise<{
    suggestedResponse: string;
    talkingPoints: string[];
    warnings: string[];
    opportunities: string[];
    nextSteps: string[];
  }> {
    if (this.isDemo()) {
      return this.getDemoAgentAssistance(transcript, callObjective);
    }

    try {
      const contextInfo = customerContext ? `
Customer Information:
- Name: ${customerContext.firstName} ${customerContext.lastName}
- Vehicle History: ${customerContext.vehicles?.map((v: any) => `${v.year} ${v.make} ${v.model}`).join(', ') || 'None'}
- Previous Interactions: ${customerContext.calls?.length || 0} calls, ${customerContext.appointments?.length || 0} appointments
- Service History: ${customerContext.serviceRequests?.length || 0} service requests
      ` : '';

      const prompt = `
You are an AI assistant helping a sales/service agent during a live call at AutoLux Intelligence luxury automotive dealership.

Current Call Transcript: "${transcript}"
Call Objective: ${callObjective || 'General customer service'}
${contextInfo}

Provide real-time agent assistance in JSON format:
{
    "suggestedResponse": "What the agent should say next",
    "talkingPoints": ["point1", "point2", "point3"],
    "warnings": ["warning1", "warning2"],
    "opportunities": ["opportunity1", "opportunity2"],
    "nextSteps": ["step1", "step2"]
}

Guidelines:
- Suggest professional, helpful responses
- Identify sales opportunities (vehicle features, financing, trade-ins)
- Flag potential issues or concerns
- Recommend follow-up actions
- Maintain luxury automotive service standards
- Be concise and actionable
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error generating agent assistance:', error);
      return this.getDemoAgentAssistance(transcript, callObjective);
    }
  }

  // Analyze incoming message for intent, sentiment, and urgency
  async analyzeMessage(content: string, channel: string, customerContext?: any): Promise<AIAnalysisResult> {
    // Return demo response if API key not configured
    if (this.isDemo()) {
      return this.getDemoAnalysis(content, channel);
    }

    try {
      const contextInfo = customerContext ? `
Customer Context:
- Name: ${customerContext.firstName} ${customerContext.lastName}
- Email: ${customerContext.email}
- Phone: ${customerContext.phone}
- Recent vehicles: ${customerContext.vehicles?.map((v: any) => `${v.year} ${v.make} ${v.model}`).join(', ') || 'None'}
- Recent appointments: ${customerContext.appointments?.length || 0}
- Recent service requests: ${customerContext.serviceRequests?.length || 0}
      ` : '';

      const prompt = `
You are an AI assistant for AutoLux Intelligence, a luxury automotive dealership and call center. Analyze this customer message:

Channel: ${channel}
Message: "${content}"
${contextInfo}

Provide analysis in this exact JSON format:
{
    "intent": "brief description of what customer wants",
    "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
    "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
    "category": "SALES_INQUIRY|SERVICE_REQUEST|EMERGENCY|APPOINTMENT|COMPLAINT|INFORMATION|FOLLOW_UP",
    "requiresHumanAttention": true/false,
    "extractedInfo": {
        "customerName": "if mentioned",
        "vehicleInfo": "any vehicle details mentioned",
        "contactInfo": "any contact info provided",
        "appointmentRequest": true/false,
        "emergencyType": "if emergency, what type"
    }
}

Guidelines:
- Mark as CRITICAL urgency for emergencies, breakdowns, accidents
- Mark as HIGH urgency for urgent service needs, angry customers
- Mark requiresHumanAttention=true for complex issues, complaints, emergencies
- Extract any vehicle information (make, model, year, VIN, etc.)
- Identify if customer is requesting an appointment
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const analysis = JSON.parse(responseText) as AIAnalysisResult;

      return analysis;
    } catch (error) {
      console.error('Error analyzing message:', error);
      // Return default analysis if AI fails
      return {
        intent: 'Unable to analyze',
        sentiment: 'NEUTRAL',
        urgency: 'MEDIUM',
        category: 'INFORMATION',
        requiresHumanAttention: true,
        extractedInfo: {}
      };
    }
  }

  // Generate intelligent response to customer message
  async generateResponse(
    content: string,
    analysis: AIAnalysisResult,
    customerContext?: any,
    channel: string = 'EMAIL'
  ): Promise<AIResponseResult> {
    // Return demo response if API key not configured
    if (this.isDemo()) {
      return this.getDemoResponse(content, analysis, channel);
    }

    try {
      const contextInfo = customerContext ? `
Customer Information:
- Name: ${customerContext.firstName} ${customerContext.lastName}
- Email: ${customerContext.email}
- Phone: ${customerContext.phone}
- Recent vehicles: ${customerContext.vehicles?.map((v: any) => `${v.year} ${v.make} ${v.model}`).join(', ') || 'None'}
- Recent appointments: ${customerContext.appointments?.length || 0} appointments
- Recent service requests: ${customerContext.serviceRequests?.length || 0} service requests
- Customer since: ${new Date(customerContext.createdAt).getFullYear()}
      ` : '';

      const businessHours = `
Business Hours:
- Monday-Friday: 8:00 AM - 8:00 PM
- Saturday: 9:00 AM - 6:00 PM
- Sunday: 10:00 AM - 5:00 PM
- Emergency Roadside: 24/7
      `;

      const prompt = `
You are an AI customer service representative for AutoLux Intelligence, a luxury automotive dealership specializing in premium vehicles (Mercedes-Benz, BMW, Audi, Lexus, Porsche, etc.) with comprehensive roadside assistance.

Customer Message: "${content}"
Channel: ${channel}
Analysis: ${JSON.stringify(analysis)}
${contextInfo}
${businessHours}

Generate a professional, helpful response following these guidelines:

1. **Tone**: Professional, warm, luxury-focused
2. **Brand Voice**: Premium automotive expertise, exceptional service
3. **Personalization**: Use customer name if available
4. **Channel Appropriate**:
   - EMAIL: Detailed, formal
   - SMS: Concise, friendly
   - CHAT: Conversational, quick

5. **Response Types**:
   - EMERGENCY: Immediate assistance, escalation info
   - SALES_INQUIRY: Vehicle information, appointment scheduling
   - SERVICE_REQUEST: Service options, scheduling
   - APPOINTMENT: Availability, confirmation
   - COMPLAINT: Empathy, resolution steps
   - INFORMATION: Helpful details, next steps

6. **Always Include**:
   - Relevant contact information
   - Next steps or call-to-action
   - Emergency number for urgent issues: (555) 911-AUTO

7. **Auto-Send Criteria**:
   - Simple information requests
   - Appointment confirmations
   - Standard service inquiries
   - Non-emergency situations

Provide response in this JSON format:
{
    "response": "your professional response",
    "confidence": 0.0-1.0,
    "shouldAutoSend": true/false,
    "suggestedActions": ["action1", "action2"]
}

Set shouldAutoSend=false for emergencies, complaints, or complex issues requiring human review.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(responseText) as AIResponseResult;

      return result;
    } catch (error) {
      console.error('Error generating response:', error);
      // Return safe default response
      return {
        response: "Thank you for contacting AutoLux Intelligence. We've received your message and one of our specialists will respond within 2 hours. For emergencies, please call (555) 911-AUTO.",
        confidence: 0.5,
        shouldAutoSend: false,
        suggestedActions: ['Escalate to human agent']
      };
    }
  }

  // Demo methods for when OpenAI API key is not configured
  private getDemoAnalysis(content: string, channel: string): AIAnalysisResult {
    const lowerContent = content.toLowerCase();

    // Simple keyword-based analysis for demo
    let category = 'INFORMATION';
    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    let intent = 'General inquiry';
    let requiresHumanAttention = false;

    // Emergency keywords
    if (lowerContent.includes('emergency') || lowerContent.includes('accident') || lowerContent.includes('breakdown')) {
      category = 'EMERGENCY';
      urgency = 'CRITICAL';
      intent = 'Emergency assistance needed';
      requiresHumanAttention = true;
    }
    // Sales keywords
    else if (lowerContent.includes('buy') || lowerContent.includes('purchase') || lowerContent.includes('price') || lowerContent.includes('test drive')) {
      category = 'SALES_INQUIRY';
      intent = 'Interested in purchasing a vehicle';
      urgency = 'HIGH';
    }
    // Service keywords
    else if (lowerContent.includes('service') || lowerContent.includes('repair') || lowerContent.includes('maintenance')) {
      category = 'SERVICE_REQUEST';
      intent = 'Needs vehicle service or repair';
      urgency = 'MEDIUM';
    }
    // Appointment keywords
    else if (lowerContent.includes('appointment') || lowerContent.includes('schedule') || lowerContent.includes('meeting')) {
      category = 'APPOINTMENT';
      intent = 'Wants to schedule an appointment';
      urgency = 'MEDIUM';
    }
    // Complaint keywords
    else if (lowerContent.includes('complaint') || lowerContent.includes('problem') || lowerContent.includes('issue') || lowerContent.includes('unhappy')) {
      category = 'COMPLAINT';
      sentiment = 'NEGATIVE';
      intent = 'Has a complaint or issue';
      urgency = 'HIGH';
      requiresHumanAttention = true;
    }

    // Positive sentiment keywords
    if (lowerContent.includes('thank') || lowerContent.includes('great') || lowerContent.includes('excellent') || lowerContent.includes('love')) {
      sentiment = 'POSITIVE';
    }

    return {
      intent,
      sentiment,
      urgency,
      category,
      requiresHumanAttention,
      extractedInfo: {
        appointmentRequest: category === 'APPOINTMENT',
        emergencyType: category === 'EMERGENCY' ? 'General emergency' : undefined
      }
    };
  }

  private getDemoResponse(content: string, analysis: AIAnalysisResult, channel: string): AIResponseResult {
    let response = '';
    let confidence = 0.8;
    let shouldAutoSend = true;
    let suggestedActions: string[] = [];

    const channelGreeting = {
      'EMAIL': 'Thank you for contacting AutoLux Intelligence.',
      'SMS': 'Hi! Thanks for reaching out to AutoLux.',
      'CHAT': 'Hello! How can I help you today?'
    }[channel] || 'Thank you for contacting AutoLux Intelligence.';

    switch (analysis.category) {
      case 'EMERGENCY':
        response = `${channelGreeting} We understand this is an emergency situation. Our roadside assistance team has been notified and will contact you within 5 minutes. For immediate assistance, please call our emergency hotline at (555) 911-AUTO. Stay safe!`;
        shouldAutoSend = false;
        confidence = 0.9;
        suggestedActions = ['Dispatch emergency team', 'Call customer immediately'];
        break;

      case 'SALES_INQUIRY':
        response = `${channelGreeting} I'd be happy to help you with information about our luxury vehicle collection. Our sales specialists can provide detailed information about pricing, features, and financing options. Would you like to schedule a test drive or visit our showroom? You can reach our sales team at (555) 123-CARS or visit us Monday-Saturday 9AM-8PM.`;
        suggestedActions = ['Schedule test drive', 'Send vehicle brochure'];
        break;

      case 'SERVICE_REQUEST':
        response = `${channelGreeting} Our service department is ready to help with your vehicle needs. We offer comprehensive maintenance and repair services for all luxury vehicle brands. To schedule a service appointment, please call (555) 123-SERVICE or use our online booking system. Our service hours are Monday-Friday 7AM-6PM, Saturday 8AM-4PM.`;
        suggestedActions = ['Schedule service appointment', 'Send service menu'];
        break;

      case 'APPOINTMENT':
        response = `${channelGreeting} I'd be happy to help you schedule an appointment. Our team is available for sales consultations, test drives, vehicle delivery, and service appointments. Please let me know your preferred date and time, and I'll check our availability. You can also call us directly at (555) 123-AUTO.`;
        suggestedActions = ['Check calendar availability', 'Send appointment confirmation'];
        break;

      case 'COMPLAINT':
        response = `${channelGreeting} I sincerely apologize for any inconvenience you've experienced. Your satisfaction is our top priority, and I want to ensure we resolve this matter promptly. A member of our management team will contact you within 2 hours to discuss your concerns and find a solution. Thank you for bringing this to our attention.`;
        shouldAutoSend = false;
        confidence = 0.6;
        suggestedActions = ['Escalate to manager', 'Schedule follow-up call'];
        break;

      default:
        response = `${channelGreeting} Thank you for your message. One of our specialists will review your inquiry and respond within 2 hours during business hours. For immediate assistance, please call us at (555) 123-AUTO. Our business hours are Monday-Friday 8AM-8PM, Saturday 9AM-6PM, Sunday 10AM-5PM.`;
        suggestedActions = ['Route to appropriate department'];
    }

    if (analysis.urgency === 'CRITICAL' || analysis.requiresHumanAttention) {
      shouldAutoSend = false;
      confidence = Math.min(confidence, 0.7);
    }

    return {
      response,
      confidence,
      shouldAutoSend,
      suggestedActions
    };
  }

  private getDemoTranscription(): string {
    const demoTranscripts = [
      "Hello, this is Sarah calling from AutoLux Intelligence. Thank you for calling about the 2024 Mercedes-Benz E-Class. I'd be happy to help you with information about pricing and availability. Are you looking to schedule a test drive?",
      "Hi, I'm calling because I'm having some issues with my BMW X5. The engine light came on yesterday and I'm concerned about driving it. Can you help me schedule a service appointment as soon as possible?",
      "Good morning, I'm interested in trading in my current Audi A4 and looking at the new Lexus ES series. I've been a customer for three years and wondering about loyalty discounts. What financing options do you have available?",
      "This is an emergency call. My Mercedes broke down on Highway 101 and I need immediate roadside assistance. The car won't start and I'm stuck in traffic. Can you send someone right away?",
      "I wanted to follow up on my recent service appointment. The work was completed but I'm still experiencing the same issue with the transmission. I'm quite frustrated and need this resolved immediately."
    ];

    return demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
  }

  private getDemoCallAnalysis(transcript: string): {
    sentiment: string;
    keywords: string[];
    urgency: string;
    suggestedActions: string[];
    customerSatisfaction: number;
    escalationRequired: boolean;
  } {
    const lowerTranscript = transcript.toLowerCase();

    let sentiment = 'NEUTRAL';
    let urgency = 'MEDIUM';
    let customerSatisfaction = 7;
    let escalationRequired = false;

    // Analyze sentiment
    if (lowerTranscript.includes('frustrated') || lowerTranscript.includes('angry') || lowerTranscript.includes('problem') || lowerTranscript.includes('issue')) {
      sentiment = 'NEGATIVE';
      customerSatisfaction = 3;
      escalationRequired = true;
    } else if (lowerTranscript.includes('thank') || lowerTranscript.includes('great') || lowerTranscript.includes('excellent') || lowerTranscript.includes('happy')) {
      sentiment = 'POSITIVE';
      customerSatisfaction = 9;
    }

    // Analyze urgency
    if (lowerTranscript.includes('emergency') || lowerTranscript.includes('immediately') || lowerTranscript.includes('urgent') || lowerTranscript.includes('broke down')) {
      urgency = 'CRITICAL';
      escalationRequired = true;
    } else if (lowerTranscript.includes('soon') || lowerTranscript.includes('asap') || lowerTranscript.includes('quickly')) {
      urgency = 'HIGH';
    }

    // Extract keywords
    const keywords = [];
    const vehicleBrands = ['mercedes', 'bmw', 'audi', 'lexus', 'porsche', 'jaguar', 'land rover', 'cadillac'];
    const serviceTerms = ['service', 'repair', 'maintenance', 'warranty', 'parts'];
    const salesTerms = ['buy', 'purchase', 'financing', 'trade', 'lease', 'price'];

    vehicleBrands.forEach(brand => {
      if (lowerTranscript.includes(brand)) keywords.push(brand.toUpperCase());
    });

    serviceTerms.forEach(term => {
      if (lowerTranscript.includes(term)) keywords.push(term.toUpperCase());
    });

    salesTerms.forEach(term => {
      if (lowerTranscript.includes(term)) keywords.push(term.toUpperCase());
    });

    // Generate suggested actions
    const suggestedActions = [];
    if (lowerTranscript.includes('test drive')) suggestedActions.push('Schedule test drive');
    if (lowerTranscript.includes('service') || lowerTranscript.includes('repair')) suggestedActions.push('Book service appointment');
    if (lowerTranscript.includes('price') || lowerTranscript.includes('financing')) suggestedActions.push('Provide pricing information');
    if (lowerTranscript.includes('emergency') || lowerTranscript.includes('broke down')) suggestedActions.push('Dispatch roadside assistance');
    if (escalationRequired) suggestedActions.push('Escalate to supervisor');

    if (suggestedActions.length === 0) {
      suggestedActions.push('Follow up with customer', 'Send information packet');
    }

    return {
      sentiment,
      keywords: keywords.slice(0, 5), // Limit to 5 keywords
      urgency,
      suggestedActions,
      customerSatisfaction,
      escalationRequired
    };
  }

  private getDemoAgentAssistance(transcript: string, callObjective?: string): {
    suggestedResponse: string;
    talkingPoints: string[];
    warnings: string[];
    opportunities: string[];
    nextSteps: string[];
  } {
    const lowerTranscript = transcript.toLowerCase();

    let suggestedResponse = "Thank you for calling AutoLux Intelligence. I understand your inquiry and I'm here to help you with the best possible solution.";
    const talkingPoints = [];
    const warnings = [];
    const opportunities = [];
    const nextSteps = [];

    // Customize based on transcript content
    if (lowerTranscript.includes('emergency') || lowerTranscript.includes('broke down')) {
      suggestedResponse = "I understand this is an emergency situation. Let me immediately connect you with our roadside assistance team. Can you please confirm your location and the nature of the problem?";
      talkingPoints.push("Get exact location", "Identify vehicle problem", "Estimate arrival time");
      warnings.push("Customer is in distress - prioritize safety");
      nextSteps.push("Dispatch roadside assistance", "Follow up in 30 minutes");
    } else if (lowerTranscript.includes('frustrated') || lowerTranscript.includes('problem')) {
      suggestedResponse = "I sincerely apologize for the inconvenience you've experienced. Your satisfaction is our top priority, and I want to make this right for you immediately.";
      talkingPoints.push("Listen actively", "Acknowledge the issue", "Offer immediate solutions");
      warnings.push("Customer is upset - use empathetic language");
      opportunities.push("Opportunity to exceed expectations");
      nextSteps.push("Escalate to manager", "Schedule follow-up call");
    } else if (lowerTranscript.includes('buy') || lowerTranscript.includes('purchase') || lowerTranscript.includes('interested')) {
      suggestedResponse = "That's wonderful! I'd be delighted to help you find the perfect luxury vehicle. Let me share some information about our current inventory and special financing offers.";
      talkingPoints.push("Identify specific vehicle interests", "Discuss financing options", "Highlight luxury features");
      opportunities.push("Potential vehicle sale", "Extended warranty opportunity", "Service package upsell");
      nextSteps.push("Schedule test drive", "Send vehicle information", "Prepare financing options");
    } else if (lowerTranscript.includes('service') || lowerTranscript.includes('maintenance')) {
      suggestedResponse = "I'll be happy to help you with your service needs. Our certified technicians specialize in luxury vehicle maintenance and we offer convenient scheduling options.";
      talkingPoints.push("Identify service needs", "Explain service process", "Mention warranty coverage");
      opportunities.push("Additional service recommendations", "Maintenance package sale");
      nextSteps.push("Schedule service appointment", "Send service menu", "Confirm vehicle details");
    }

    // Add general talking points if none were added
    if (talkingPoints.length === 0) {
      talkingPoints.push("Build rapport with customer", "Identify customer needs", "Present AutoLux value proposition");
    }

    // Add general opportunities if none were identified
    if (opportunities.length === 0) {
      opportunities.push("Build customer relationship", "Gather contact information", "Schedule follow-up");
    }

    // Add general next steps if none were added
    if (nextSteps.length === 0) {
      nextSteps.push("Send follow-up email", "Update customer record", "Schedule callback");
    }

    return {
      suggestedResponse,
      talkingPoints,
      warnings,
      opportunities,
      nextSteps
    };
  }
}

export default new AIService();
