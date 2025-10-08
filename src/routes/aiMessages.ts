import express from 'express';
import { PrismaClient } from '@prisma/client';
import aiService from '../services/aiService';
import { communicationService } from '../services/communicationService';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/ai/analyze-message - Analyze incoming message with AI
router.post('/analyze-message', async (req, res) => {
    try {
        const { messageId, content, channel, customerId } = req.body;

        if (!content || !channel) {
            return res.status(400).json({ 
                error: 'Missing required fields: content, channel' 
            });
        }

        // Get customer context if available
        let customerContext = null;
        if (customerId) {
            customerContext = await prisma.customer.findUnique({
                where: { id: customerId },
                include: {
                    vehicles: {
                        take: 3,
                        orderBy: { createdAt: 'desc' }
                    },
                    appointments: {
                        take: 5,
                        orderBy: { createdAt: 'desc' }
                    },
                    serviceRequests: {
                        take: 3,
                        orderBy: { requestedAt: 'desc' }
                    }
                }
            });
        }

        // Analyze message with AI
        const analysis = await aiService.analyzeMessage(content, channel, customerContext);

        // Update message with AI analysis if messageId provided
        if (messageId) {
            await prisma.message.update({
                where: { id: messageId },
                data: {
                    metadata: {
                        aiAnalysis: analysis,
                        analyzedAt: new Date().toISOString()
                    }
                }
            });
        }

        res.json({
            analysis,
            customerContext: customerContext ? {
                id: customerContext.id,
                name: `${customerContext.firstName} ${customerContext.lastName}`,
                vehicleCount: customerContext.vehicles.length,
                appointmentCount: customerContext.appointments.length,
                serviceRequestCount: customerContext.serviceRequests.length
            } : null
        });
    } catch (error) {
        console.error('Error analyzing message:', error);
        res.status(500).json({ error: 'Failed to analyze message' });
    }
});

// POST /api/ai/generate-response - Generate AI response to message
router.post('/generate-response', async (req, res) => {
    try {
        const { content, analysis, customerId, channel = 'EMAIL' } = req.body;

        if (!content) {
            return res.status(400).json({ 
                error: 'Missing required field: content' 
            });
        }

        // Get customer context if available
        let customerContext = null;
        if (customerId) {
            customerContext = await prisma.customer.findUnique({
                where: { id: customerId },
                include: {
                    vehicles: {
                        take: 3,
                        orderBy: { createdAt: 'desc' }
                    },
                    appointments: {
                        take: 5,
                        orderBy: { createdAt: 'desc' }
                    },
                    serviceRequests: {
                        take: 3,
                        orderBy: { requestedAt: 'desc' }
                    }
                }
            });
        }

        // Generate AI response
        const responseResult = await aiService.generateResponse(
            content, 
            analysis, 
            customerContext, 
            channel
        );

        res.json(responseResult);
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// POST /api/ai/auto-respond - Automatically analyze and respond to message
router.post('/auto-respond', async (req, res) => {
    try {
        const { messageId, content, channel, customerId, senderEmail, senderPhone } = req.body;

        if (!content || !channel) {
            return res.status(400).json({ 
                error: 'Missing required fields: content, channel' 
            });
        }

        // Get customer context
        let customerContext = null;
        if (customerId) {
            customerContext = await prisma.customer.findUnique({
                where: { id: customerId },
                include: {
                    vehicles: { take: 3, orderBy: { createdAt: 'desc' } },
                    appointments: { take: 5, orderBy: { createdAt: 'desc' } },
                    serviceRequests: { take: 3, orderBy: { requestedAt: 'desc' } }
                }
            });
        }

        // Step 1: Analyze the message
        const analysis = await aiService.analyzeMessage(content, channel, customerContext);

        // Step 2: Generate response
        const responseResult = await aiService.generateResponse(
            content, 
            analysis, 
            customerContext, 
            channel
        );

        // Step 3: Update original message with AI analysis
        if (messageId) {
            await prisma.message.update({
                where: { id: messageId },
                data: {
                    metadata: {
                        aiAnalysis: analysis,
                        aiResponse: responseResult,
                        processedAt: new Date().toISOString()
                    }
                }
            });
        }

        // Step 4: Auto-send response if confidence is high and not requiring human attention
        let responseSent = false;
        let responseMessageId = null;

        if (responseResult.shouldAutoSend && !analysis.requiresHumanAttention && responseResult.confidence > 0.7) {
            try {
                // Create response message record
                const responseMessage = await prisma.message.create({
                    data: {
                        type: 'AI_RESPONSE',
                        channel: channel as any,
                        subject: channel === 'EMAIL' ? `Re: Your inquiry - AutoLux Intelligence` : undefined,
                        content: responseResult.response,
                        direction: 'OUTBOUND',
                        status: 'PENDING',
                        senderId: req.user.id, // AI acting on behalf of user
                        customerId: customerId,
                        metadata: {
                            isAIGenerated: true,
                            confidence: responseResult.confidence,
                            originalMessageId: messageId,
                            autoSent: true
                        }
                    }
                });

                responseMessageId = responseMessage.id;

                // Send the message
                const sendResult = await communicationService.sendMessage({
                    messageId: responseMessage.id,
                    type: channel,
                    to: senderEmail || senderPhone,
                    subject: responseMessage.subject,
                    content: responseResult.response,
                    customerId: customerId
                });

                responseSent = sendResult;

                // Update message status
                await prisma.message.update({
                    where: { id: responseMessage.id },
                    data: {
                        status: sendResult ? 'SENT' : 'FAILED',
                        deliveredAt: sendResult ? new Date() : null
                    }
                });

            } catch (sendError) {
                console.error('Error auto-sending response:', sendError);
                responseSent = false;
            }
        }

        // Step 5: Create task if human attention required
        let taskCreated = false;
        if (analysis.requiresHumanAttention || analysis.urgency === 'CRITICAL') {
            try {
                await prisma.task.create({
                    data: {
                        title: `${analysis.urgency} ${analysis.category}: ${analysis.intent}`,
                        description: `AI detected ${analysis.urgency.toLowerCase()} priority ${analysis.category.toLowerCase()} requiring human attention.\n\nCustomer Message: "${content}"\n\nAI Analysis: ${analysis.intent}`,
                        type: analysis.category === 'EMERGENCY' ? 'FOLLOW_UP_CALL' : 'SEND_EMAIL',
                        priority: analysis.urgency === 'CRITICAL' ? 'URGENT' : analysis.urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
                        status: 'PENDING',
                        isAutomated: true,
                        triggerType: 'ai_message_analysis',
                        triggerData: { messageId, analysis },
                        assigneeId: req.user.id,
                        creatorId: req.user.id,
                        customerId: customerId
                    }
                });
                taskCreated = true;
            } catch (taskError) {
                console.error('Error creating task:', taskError);
            }
        }

        res.json({
            analysis,
            response: responseResult,
            actions: {
                responseSent,
                responseMessageId,
                taskCreated,
                requiresHumanAttention: analysis.requiresHumanAttention
            },
            customerContext: customerContext ? {
                id: customerContext.id,
                name: `${customerContext.firstName} ${customerContext.lastName}`
            } : null
        });

    } catch (error) {
        console.error('Error in auto-respond:', error);
        res.status(500).json({ error: 'Failed to process auto-response' });
    }
});

// POST /api/ai/analyze-call - Analyze call transcript
router.post('/analyze-call', async (req, res) => {
    try {
        const { callId, transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({ 
                error: 'Missing required field: transcript' 
            });
        }

        // Get call context
        let callContext = null;
        if (callId) {
            callContext = await prisma.call.findUnique({
                where: { id: callId },
                include: {
                    customer: true,
                    agent: true
                }
            });
        }

        // Analyze call with AI
        const analysis = await aiService.analyzeCallTranscript(transcript, callContext);

        // Update call with AI analysis
        if (callId) {
            await prisma.call.update({
                where: { id: callId },
                data: {
                    summary: analysis.summary,
                    sentiment: analysis.sentiment,
                    transcript: transcript,
                    // Store additional analysis in a metadata field if available
                }
            });
        }

        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing call:', error);
        res.status(500).json({ error: 'Failed to analyze call' });
    }
});

// GET /api/ai/stats - Get AI processing statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalAIMessages,
            autoResponses,
            humanEscalations,
            averageConfidence
        ] = await Promise.all([
            // Count messages with AI analysis
            prisma.message.count({
                where: {
                    metadata: {
                        path: ['aiAnalysis'],
                        not: null
                    }
                }
            }),
            
            // Count auto-sent responses
            prisma.message.count({
                where: {
                    type: 'AI_RESPONSE',
                    metadata: {
                        path: ['autoSent'],
                        equals: true
                    }
                }
            }),
            
            // Count tasks created by AI
            prisma.task.count({
                where: {
                    triggerType: 'ai_message_analysis'
                }
            }),
            
            // This would need a more complex query in practice
            0.85 // Placeholder average confidence
        ]);

        res.json({
            totalAIMessages,
            autoResponses,
            humanEscalations,
            averageConfidence,
            automationRate: totalAIMessages > 0 ? (autoResponses / totalAIMessages * 100).toFixed(1) : 0
        });
    } catch (error) {
        console.error('Error fetching AI stats:', error);
        res.status(500).json({ error: 'Failed to fetch AI statistics' });
    }
});

export default router;
