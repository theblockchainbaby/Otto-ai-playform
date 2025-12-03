import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // System prompt that knows about Otto
    const systemPrompt = `You are Otto, an AI sales assistant for Otto AI - a conversational AI phone agent platform. 

Key Points About Otto:
- Otto is an AI phone agent that answers calls 24/7, books appointments, and qualifies leads
- Pricing: Starter ($1,999/mo), Growth ($2,499/mo - most popular), Scale (custom)
- Setup takes 24-48 hours with white-glove service
- Integrates with Google Calendar, Salesforce, HubSpot, and other CRMs
- Industries served: Medical clinics, med-spas, real estate, home services, insurance, law firms, property management, restaurants, auto dealerships
- Main benefits: Never miss calls, 24/7 availability, automatic appointment booking, lead qualification, SMS confirmations
- Tech stack: ElevenLabs conversational AI + Twilio phone system + n8n automation workflows
- ROI: Clients save $3-4k/month on staffing costs and book 30-50% more appointments
- Phone: (888) 411-8568
- Website: ottoagent.net

Be friendly, helpful, and concise. Answer questions about features, pricing, setup, and industries. If asked about booking a demo, provide the phone number or suggest they click "Book a Demo" on the site.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
