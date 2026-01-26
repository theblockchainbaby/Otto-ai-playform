const express = require('express');
const router = express.Router();

// GET /api/ai/stats - Get AI processing statistics
router.get('/stats', (req, res) => {
  try {
    // Return mock AI statistics
    const stats = {
      totalAIMessages: '2,347',
      autoResponses: '2,041',
      humanEscalations: '306',
      averageConfidence: 0.87,
      automationRate: '87'
    };

    res.setHeader('Content-Type', 'application/json');
    res.json(stats);
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    res.status(500).json({ error: 'Failed to fetch AI statistics' });
  }
});

// POST /api/ai/analyze-message - Analyze a message with AI
router.post('/analyze-message', (req, res) => {
  try {
    const { content, channel } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Mock AI analysis
    const analysis = {
      intent: 'inquiry',
      sentiment: 'positive',
      confidence: 0.92,
      suggestedResponse: 'Thank you for your interest! I\'d be happy to help you with that.',
      category: 'general_inquiry',
      priority: 'medium',
      requiresHumanReview: false
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ error: 'Failed to analyze message' });
  }
});

// POST /api/ai/generate-response - Generate AI response
router.post('/generate-response', (req, res) => {
  try {
    const { content, context } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Mock AI response generation
    const response = {
      suggestedResponse: 'Thank you for reaching out! Our team will get back to you shortly with more information.',
      confidence: 0.89,
      tone: 'professional',
      alternatives: [
        'We appreciate your inquiry and will respond as soon as possible.',
        'Thanks for contacting us! We\'ll have someone assist you right away.'
      ]
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// POST /api/ai/analyze-call - Analyze a call transcript
router.post('/analyze-call', (req, res) => {
  try {
    const { transcript, callId } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Call transcript is required' });
    }
    
    // Mock call analysis
    const analysis = {
      summary: 'Customer inquired about vehicle availability and pricing. Positive interaction with high purchase intent.',
      sentiment: 'positive',
      keyTopics: ['vehicle_inquiry', 'pricing', 'availability'],
      actionItems: [
        'Follow up with pricing details',
        'Schedule test drive'
      ],
      customerSatisfaction: 0.85,
      salesOpportunity: 'high'
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing call:', error);
    res.status(500).json({ error: 'Failed to analyze call' });
  }
});

// POST /api/ai/chat - ChatGPT proxy for website widget
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are OttoAI's helpful website assistant. OttoAI is an AI-powered receptionist platform that:
- Answers calls 24/7
- Qualifies leads automatically
- Books appointments directly to Google Calendar
- Integrates with Twilio, Salesforce, CRMs, and more
- Is HIPAA-ready for healthcare
- Costs $1,499/month for Starter, $2,499/month for Professional

Keep responses concise, friendly, and helpful. Guide users to book a demo at calendly.com/yorksims/30min or call (888) 411-8568.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 300
      })
    });
    
    const data = await response.json();

    // Log OpenAI response for debugging
    if (!response.ok) {
      console.error('OpenAI API error:', response.status, JSON.stringify(data));
      return res.status(500).json({
        error: 'Failed to get response from AI',
        details: data.error?.message || 'Unknown error'
      });
    }

    if (data.choices && data.choices[0]) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      console.error('OpenAI unexpected response:', JSON.stringify(data));
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  } catch (error) {
    console.error('Error in chat proxy:', error);
    res.status(500).json({ error: 'Failed to process chat request', details: error.message });
  }
});

module.exports = router;

