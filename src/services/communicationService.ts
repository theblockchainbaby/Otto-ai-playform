import { PrismaClient } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Email configuration - only create if SMTP is configured
let emailTransporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

// Twilio configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export interface SendMessageOptions {
    messageId: string;
    type: 'EMAIL' | 'SMS' | 'CHAT';
    to: string;
    subject?: string;
    content: string;
    from?: string;
    customerId: string;
    metadata?: any;
}

export class CommunicationService {
    
    async sendMessage(options: SendMessageOptions): Promise<boolean> {
        try {
            let success = false;
            let externalId: string | null = null;
            let errorMessage: string | null = null;

            switch (options.type) {
                case 'EMAIL':
                    const emailResult = await this.sendEmail(options);
                    success = emailResult.success;
                    externalId = emailResult.messageId;
                    errorMessage = emailResult.error;
                    break;
                
                case 'SMS':
                    const smsResult = await this.sendSMS(options);
                    success = smsResult.success;
                    externalId = smsResult.messageId;
                    errorMessage = smsResult.error;
                    break;
                
                case 'CHAT':
                    // For now, chat messages are just stored in the database
                    success = true;
                    break;
                
                default:
                    throw new Error(`Unsupported message type: ${options.type}`);
            }

            // Update message status in database
            await prisma.message.update({
                where: { id: options.messageId },
                data: {
                    status: success ? 'SENT' : 'FAILED',
                    externalId,
                    errorMessage,
                    deliveredAt: success ? new Date() : null,
                    failedAt: success ? null : new Date(),
                    metadata: options.metadata
                }
            });

            return success;
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Update message as failed
            await prisma.message.update({
                where: { id: options.messageId },
                data: {
                    status: 'FAILED',
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    failedAt: new Date()
                }
            });

            return false;
        }
    }

    private async sendEmail(options: SendMessageOptions): Promise<{success: boolean, messageId?: string, error?: string}> {
        try {
            if (!process.env.SMTP_USER) {
                return { success: false, error: 'Email service not configured' };
            }

            const mailOptions = {
                from: options.from || process.env.SMTP_USER,
                to: options.to,
                subject: options.subject || 'AutoLux Communication',
                html: this.formatEmailContent(options.content),
                text: options.content
            };

            if (!emailTransporter) {
                console.log('Email not configured - would send:', mailOptions);
                return { success: true, messageId: 'demo-email-' + Date.now() };
            }

            const result = await emailTransporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email sending error:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Email sending failed' 
            };
        }
    }

    private async sendSMS(options: SendMessageOptions): Promise<{success: boolean, messageId?: string, error?: string}> {
        try {
            if (!twilioClient) {
                return { success: false, error: 'SMS service not configured' };
            }

            const message = await twilioClient.messages.create({
                body: options.content,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: options.to
            });

            return { success: true, messageId: message.sid };
        } catch (error) {
            console.error('SMS sending error:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'SMS sending failed' 
            };
        }
    }

    private formatEmailContent(content: string): string {
        // Basic HTML formatting for email content
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0F2A44 0%, #1E4A66 100%); padding: 20px; text-align: center;">
                    <h1 style="color: #E5E0D8; margin: 0; font-size: 24px;">AutoLux Intelligence</h1>
                    <p style="color: #E5E0D8; margin: 5px 0 0 0; opacity: 0.9;">Premium Automotive Experience</p>
                </div>
                <div style="padding: 30px; background: #ffffff;">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p>This message was sent from AutoLux Intelligence Platform</p>
                    <p>© ${new Date().getFullYear()} AutoLux Intelligence. All rights reserved.</p>
                </div>
            </div>
        `;
    }

    // Template system for common messages
    async sendTemplatedMessage(templateType: string, data: any, options: Omit<SendMessageOptions, 'content' | 'subject'>): Promise<boolean> {
        const template = this.getTemplate(templateType, data);
        
        return this.sendMessage({
            ...options,
            subject: template.subject,
            content: template.content
        });
    }

    private getTemplate(type: string, data: any): {subject: string, content: string} {
        const templates: Record<string, (data: any) => {subject: string, content: string}> = {
            'appointment_reminder': (data) => ({
                subject: `Appointment Reminder - ${data.appointmentTitle}`,
                content: `
Dear ${data.customerName},

This is a friendly reminder about your upcoming appointment:

📅 Appointment: ${data.appointmentTitle}
🕐 Date & Time: ${new Date(data.startTime).toLocaleString()}
📍 Location: ${data.location || 'Our showroom'}
👤 Representative: ${data.agentName}

${data.notes ? `Notes: ${data.notes}` : ''}

If you need to reschedule or have any questions, please contact us at ${process.env.COMPANY_PHONE || '(555) 123-4567'}.

We look forward to seeing you!

Best regards,
The AutoLux Team
                `.trim()
            }),

            'lead_follow_up': (data) => ({
                subject: `Following up on your interest in ${data.vehicleName}`,
                content: `
Dear ${data.customerName},

Thank you for your interest in the ${data.vehicleName}. I wanted to follow up and see if you have any questions about this exceptional vehicle.

🚗 Vehicle: ${data.vehicleName}
💰 Price: ${data.price}
📋 Status: ${data.status}

${data.notes ? `Additional Information: ${data.notes}` : ''}

I'm here to help you with any questions you might have about:
• Vehicle specifications and features
• Financing options
• Trade-in evaluation
• Test drive scheduling

Please feel free to reach out to me directly or call our showroom.

Best regards,
${data.agentName}
${data.agentEmail}
${process.env.COMPANY_PHONE || '(555) 123-4567'}
                `.trim()
            }),

            'welcome_new_customer': (data) => ({
                subject: 'Welcome to AutoLux - Your Premium Automotive Experience Begins',
                content: `
Dear ${data.customerName},

Welcome to the AutoLux family! We're thrilled to have you as our valued customer.

At AutoLux, we're committed to providing you with an exceptional automotive experience. Whether you're looking for your dream vehicle, need service support, or have questions about our offerings, our dedicated team is here to assist you.

Your assigned representative: ${data.agentName}
Direct contact: ${data.agentEmail}

What's next?
• Browse our premium vehicle inventory
• Schedule a personalized consultation
• Explore financing options
• Book a test drive

We look forward to serving you and exceeding your expectations.

Welcome aboard!

The AutoLux Team
                `.trim()
            }),

            'task_assignment': (data) => ({
                subject: `New Task Assigned: ${data.taskTitle}`,
                content: `
Hello ${data.assigneeName},

You have been assigned a new task:

📋 Task: ${data.taskTitle}
📅 Due Date: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'No due date set'}
⚡ Priority: ${data.priority}
👤 Customer: ${data.customerName}

${data.description ? `Description: ${data.description}` : ''}

Please log into the AutoLux platform to view full details and update the task status.

Best regards,
AutoLux Task Management System
                `.trim()
            })
        };

        const templateFn = templates[type];
        if (!templateFn) {
            throw new Error(`Template not found: ${type}`);
        }

        return templateFn(data);
    }

    // Bulk messaging for campaigns
    async sendBulkMessages(messages: SendMessageOptions[]): Promise<{sent: number, failed: number}> {
        let sent = 0;
        let failed = 0;

        for (const message of messages) {
            const success = await this.sendMessage(message);
            if (success) {
                sent++;
            } else {
                failed++;
            }
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return { sent, failed };
    }
}

export const communicationService = new CommunicationService();
