import express from 'express';
import { PrismaClient } from '@prisma/client';
import aiService from '../services/aiService';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/ai/calls/transcribe - Transcribe audio to text
router.post('/transcribe', async (req, res) => {
    try {
        const { audioUrl, callId } = req.body;

        if (!audioUrl) {
            return res.status(400).json({ 
                error: 'Missing required field: audioUrl' 
            });
        }

        // Transcribe audio
        const transcript = await aiService.transcribeAudio(audioUrl);

        // Update call record if callId provided
        if (callId) {
            await prisma.call.update({
                where: { id: callId },
                data: {
                    transcript: transcript,
                    updatedAt: new Date()
                }
            });
        }

        res.json({
            transcript,
            callId,
            transcribedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

// POST /api/ai/calls/analyze-realtime - Real-time call analysis
router.post('/analyze-realtime', async (req, res) => {
    try {
        const { transcript, callId } = req.body;

        if (!transcript) {
            return res.status(400).json({ 
                error: 'Missing required field: transcript' 
            });
        }

        // Get call context if available
        let callContext = null;
        if (callId) {
            callContext = await prisma.call.findUnique({
                where: { id: callId },
                include: {
                    customer: {
                        include: {
                            vehicles: true,
                            appointments: { take: 5, orderBy: { createdAt: 'desc' } },
                            serviceRequests: { take: 3, orderBy: { requestedAt: 'desc' } }
                        }
                    },
                    agent: true
                }
            });
        }

        // Analyze call in real-time
        const analysis = await aiService.analyzeCallInRealTime(transcript, callContext);

        // Update call record with analysis
        if (callId) {
            await prisma.call.update({
                where: { id: callId },
                data: {
                    sentiment: analysis.sentiment,
                    metadata: {
                        realTimeAnalysis: analysis,
                        analyzedAt: new Date().toISOString()
                    }
                }
            });
        }

        res.json({
            analysis,
            callContext: callContext ? {
                id: callContext.id,
                customer: callContext.customer ? {
                    name: `${callContext.customer.firstName} ${callContext.customer.lastName}`,
                    vehicleCount: callContext.customer.vehicles.length
                } : null,
                agent: callContext.agent ? {
                    name: `${callContext.agent.firstName} ${callContext.agent.lastName}`
                } : null
            } : null
        });
    } catch (error) {
        console.error('Error analyzing call in real-time:', error);
        res.status(500).json({ error: 'Failed to analyze call' });
    }
});

// POST /api/ai/calls/agent-assistance - Generate agent assistance
router.post('/agent-assistance', async (req, res) => {
    try {
        const { transcript, callId, callObjective } = req.body;

        if (!transcript) {
            return res.status(400).json({ 
                error: 'Missing required field: transcript' 
            });
        }

        // Get customer context if available
        let customerContext = null;
        if (callId) {
            const call = await prisma.call.findUnique({
                where: { id: callId },
                include: {
                    customer: {
                        include: {
                            vehicles: { take: 3, orderBy: { createdAt: 'desc' } },
                            appointments: { take: 5, orderBy: { createdAt: 'desc' } },
                            calls: { take: 5, orderBy: { startedAt: 'desc' } },
                            serviceRequests: { take: 3, orderBy: { requestedAt: 'desc' } }
                        }
                    }
                }
            });
            customerContext = call?.customer;
        }

        // Generate agent assistance
        const assistance = await aiService.generateAgentAssistance(
            transcript, 
            customerContext, 
            callObjective
        );

        res.json({
            assistance,
            customerContext: customerContext ? {
                id: customerContext.id,
                name: `${customerContext.firstName} ${customerContext.lastName}`,
                vehicleCount: customerContext.vehicles.length,
                callHistory: customerContext.calls.length,
                serviceHistory: customerContext.serviceRequests.length
            } : null,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating agent assistance:', error);
        res.status(500).json({ error: 'Failed to generate agent assistance' });
    }
});

// POST /api/ai/calls/start-session - Start AI-assisted call session
router.post('/start-session', async (req, res) => {
    try {
        const { customerId, agentId, callType = 'INBOUND', objective } = req.body;

        // Create new call record
        const call = await prisma.call.create({
            data: {
                direction: callType,
                status: 'INITIATED',
                outcome: 'IN_PROGRESS',
                startedAt: new Date(),
                customerId: customerId,
                agentId: agentId || req.user.id,
                metadata: {
                    aiAssisted: true,
                    objective: objective,
                    sessionStarted: new Date().toISOString()
                }
            },
            include: {
                customer: {
                    include: {
                        vehicles: { take: 3, orderBy: { createdAt: 'desc' } },
                        appointments: { take: 5, orderBy: { createdAt: 'desc' } },
                        serviceRequests: { take: 3, orderBy: { requestedAt: 'desc' } }
                    }
                },
                agent: true
            }
        });

        // Generate initial agent briefing
        const customerSummary = call.customer ? `
Customer: ${call.customer.firstName} ${call.customer.lastName}
Vehicles: ${call.customer.vehicles.map(v => `${v.year} ${v.make} ${v.model}`).join(', ') || 'None'}
Recent Activity: ${call.customer.appointments.length} appointments, ${call.customer.serviceRequests.length} service requests
        `.trim() : 'New customer - no history available';

        const briefing = {
            callId: call.id,
            customerSummary,
            suggestedOpening: objective === 'SALES' ? 
                `Hello ${call.customer?.firstName || 'there'}, thank you for your interest in AutoLux Intelligence. I'm here to help you find the perfect luxury vehicle.` :
                objective === 'SERVICE' ?
                `Hi ${call.customer?.firstName || 'there'}, I understand you need assistance with your vehicle. I'm here to help resolve any issues you may have.` :
                `Hello ${call.customer?.firstName || 'there'}, thank you for calling AutoLux Intelligence. How can I assist you today?`,
            talkingPoints: objective === 'SALES' ? [
                'Ask about vehicle preferences',
                'Discuss financing options',
                'Schedule test drive',
                'Highlight luxury features'
            ] : objective === 'SERVICE' ? [
                'Identify specific issue',
                'Check warranty status',
                'Schedule service appointment',
                'Explain service process'
            ] : [
                'Listen to customer needs',
                'Identify call purpose',
                'Provide helpful information',
                'Schedule follow-up if needed'
            ]
        };

        res.json({
            session: {
                callId: call.id,
                status: 'ACTIVE',
                startedAt: call.startedAt
            },
            customer: call.customer ? {
                id: call.customer.id,
                name: `${call.customer.firstName} ${call.customer.lastName}`,
                email: call.customer.email,
                phone: call.customer.phone,
                vehicleCount: call.customer.vehicles.length
            } : null,
            briefing
        });
    } catch (error) {
        console.error('Error starting AI call session:', error);
        res.status(500).json({ error: 'Failed to start call session' });
    }
});

// POST /api/ai/calls/end-session - End AI-assisted call session
router.post('/end-session', async (req, res) => {
    try {
        const { callId, outcome, notes, duration } = req.body;

        if (!callId) {
            return res.status(400).json({ 
                error: 'Missing required field: callId' 
            });
        }

        // Get the call with transcript for final analysis
        const call = await prisma.call.findUnique({
            where: { id: callId },
            include: {
                customer: true,
                agent: true
            }
        });

        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        // Generate final call summary if transcript available
        let finalSummary = notes || 'Call completed';
        if (call.transcript) {
            try {
                const analysis = await aiService.analyzeCallTranscript(call.transcript, call);
                finalSummary = analysis.summary;
            } catch (error) {
                console.error('Error generating final summary:', error);
            }
        }

        // Update call record
        const updatedCall = await prisma.call.update({
            where: { id: callId },
            data: {
                status: 'COMPLETED',
                outcome: outcome || 'COMPLETED',
                endedAt: new Date(),
                duration: duration || Math.floor((new Date().getTime() - call.startedAt.getTime()) / 1000),
                notes: finalSummary,
                summary: finalSummary,
                metadata: {
                    ...call.metadata,
                    sessionEnded: new Date().toISOString(),
                    aiAssisted: true
                }
            }
        });

        res.json({
            session: {
                callId: updatedCall.id,
                status: 'COMPLETED',
                duration: updatedCall.duration,
                endedAt: updatedCall.endedAt
            },
            summary: finalSummary,
            outcome: updatedCall.outcome
        });
    } catch (error) {
        console.error('Error ending AI call session:', error);
        res.status(500).json({ error: 'Failed to end call session' });
    }
});

// GET /api/ai/calls/active-sessions - Get active AI call sessions
router.get('/active-sessions', async (req, res) => {
    try {
        const activeCalls = await prisma.call.findMany({
            where: {
                status: {
                    in: ['INITIATED', 'RINGING', 'ANSWERED']
                },
                metadata: {
                    path: ['aiAssisted'],
                    equals: true
                }
            },
            include: {
                customer: true,
                agent: true
            },
            orderBy: {
                startedAt: 'desc'
            }
        });

        const sessions = activeCalls.map(call => ({
            callId: call.id,
            status: call.status,
            startedAt: call.startedAt,
            duration: Math.floor((new Date().getTime() - call.startedAt.getTime()) / 1000),
            customer: call.customer ? {
                name: `${call.customer.firstName} ${call.customer.lastName}`,
                phone: call.customer.phone
            } : null,
            agent: call.agent ? {
                name: `${call.agent.firstName} ${call.agent.lastName}`
            } : null,
            objective: call.metadata?.objective || 'General'
        }));

        res.json({
            activeSessions: sessions,
            count: sessions.length
        });
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        res.status(500).json({ error: 'Failed to fetch active sessions' });
    }
});

export default router;
