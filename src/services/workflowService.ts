import { PrismaClient } from '@prisma/client';
import { communicationService } from './communicationService';

const prisma = new PrismaClient();

export interface TriggerEvent {
    type: string;
    data: any;
    customerId: string;
    leadId?: string;
    appointmentId?: string;
    userId: string;
}

export class WorkflowService {
    
    // Process trigger events and execute matching campaigns
    async processTrigger(event: TriggerEvent): Promise<void> {
        try {
            console.log(`Processing trigger event: ${event.type} for customer ${event.customerId}`);

            // Find active campaigns that match this trigger
            const matchingCampaigns = await prisma.campaign.findMany({
                where: {
                    isActive: true,
                    triggerEvent: event.type,
                    status: 'ACTIVE'
                },
                include: {
                    steps: {
                        orderBy: { order: 'asc' }
                    }
                }
            });

            // Execute each matching campaign
            for (const campaign of matchingCampaigns) {
                await this.executeCampaign(campaign, event);
            }
        } catch (error) {
            console.error('Error processing trigger:', error);
        }
    }

    private async executeCampaign(campaign: any, event: TriggerEvent): Promise<void> {
        try {
            // Check if campaign conditions are met
            if (campaign.triggerConditions && !this.evaluateConditions(campaign.triggerConditions, event.data)) {
                console.log(`Campaign ${campaign.name} conditions not met, skipping`);
                return;
            }

            // Check if customer already has an active execution for this campaign
            const existingExecution = await prisma.campaignExecution.findFirst({
                where: {
                    campaignId: campaign.id,
                    customerId: event.customerId,
                    status: 'ACTIVE'
                }
            });

            if (existingExecution) {
                console.log(`Customer ${event.customerId} already has active execution for campaign ${campaign.name}`);
                return;
            }

            // Create campaign execution
            const execution = await prisma.campaignExecution.create({
                data: {
                    campaignId: campaign.id,
                    customerId: event.customerId,
                    leadId: event.leadId,
                    appointmentId: event.appointmentId,
                    executorId: event.userId,
                    triggerData: event.data,
                    stepExecutions: {
                        create: campaign.steps.map((step: any) => ({
                            stepId: step.id,
                            scheduledAt: new Date(Date.now() + (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000))
                        }))
                    }
                }
            });

            console.log(`Created campaign execution ${execution.id} for campaign ${campaign.name}`);

            // Execute immediate steps (no delay)
            await this.executeImmediateSteps(execution.id);
        } catch (error) {
            console.error(`Error executing campaign ${campaign.name}:`, error);
        }
    }

    private evaluateConditions(conditions: any, eventData: any): boolean {
        // Simple condition evaluation - can be extended for complex logic
        if (!conditions || typeof conditions !== 'object') return true;

        for (const [key, value] of Object.entries(conditions)) {
            if (eventData[key] !== value) {
                return false;
            }
        }

        return true;
    }

    private async executeImmediateSteps(executionId: string): Promise<void> {
        const immediateSteps = await prisma.campaignStepExecution.findMany({
            where: {
                executionId,
                scheduledAt: {
                    lte: new Date()
                },
                status: 'PENDING'
            },
            include: {
                step: true,
                execution: {
                    include: {
                        customer: true,
                        lead: true,
                        appointment: true
                    }
                }
            }
        });

        for (const stepExecution of immediateSteps) {
            await this.executeStep(stepExecution);
        }
    }

    // Execute scheduled campaign steps
    async executeScheduledSteps(): Promise<void> {
        try {
            const scheduledSteps = await prisma.campaignStepExecution.findMany({
                where: {
                    scheduledAt: {
                        lte: new Date()
                    },
                    status: 'PENDING'
                },
                include: {
                    step: true,
                    execution: {
                        include: {
                            customer: true,
                            lead: true,
                            appointment: true,
                            executor: true
                        }
                    }
                }
            });

            console.log(`Found ${scheduledSteps.length} scheduled steps to execute`);

            for (const stepExecution of scheduledSteps) {
                await this.executeStep(stepExecution);
            }
        } catch (error) {
            console.error('Error executing scheduled steps:', error);
        }
    }

    private async executeStep(stepExecution: any): Promise<void> {
        try {
            console.log(`Executing step ${stepExecution.step.name} for customer ${stepExecution.execution.customer.firstName} ${stepExecution.execution.customer.lastName}`);

            // Update step status to executing
            await prisma.campaignStepExecution.update({
                where: { id: stepExecution.id },
                data: { status: 'EXECUTING' }
            });

            let success = false;
            let messageId: string | null = null;
            let taskId: string | null = null;

            switch (stepExecution.step.type) {
                case 'SEND_EMAIL':
                    const emailResult = await this.sendEmail(stepExecution);
                    success = emailResult.success;
                    messageId = emailResult.messageId;
                    break;

                case 'SEND_SMS':
                    const smsResult = await this.sendSMS(stepExecution);
                    success = smsResult.success;
                    messageId = smsResult.messageId;
                    break;

                case 'CREATE_TASK':
                    const taskResult = await this.createTask(stepExecution);
                    success = taskResult.success;
                    taskId = taskResult.taskId;
                    break;

                case 'WAIT':
                    // Wait steps are automatically successful
                    success = true;
                    break;

                default:
                    throw new Error(`Unknown step type: ${stepExecution.step.type}`);
            }

            // Update step execution status
            await prisma.campaignStepExecution.update({
                where: { id: stepExecution.id },
                data: {
                    status: success ? 'COMPLETED' : 'FAILED',
                    executedAt: new Date(),
                    messageId,
                    taskId,
                    errorMessage: success ? null : 'Step execution failed'
                }
            });

            // Check if all steps are completed
            await this.checkExecutionCompletion(stepExecution.executionId);

        } catch (error) {
            console.error(`Error executing step ${stepExecution.id}:`, error);
            
            // Mark step as failed
            await prisma.campaignStepExecution.update({
                where: { id: stepExecution.id },
                data: {
                    status: 'FAILED',
                    failedAt: new Date(),
                    errorMessage: error instanceof Error ? error.message : 'Unknown error'
                }
            });
        }
    }

    private async sendEmail(stepExecution: any): Promise<{success: boolean, messageId?: string}> {
        try {
            const customer = stepExecution.execution.customer;
            
            if (!customer.email) {
                throw new Error('Customer has no email address');
            }

            // Create message record
            const message = await prisma.message.create({
                data: {
                    type: 'CAMPAIGN_MESSAGE',
                    channel: 'EMAIL',
                    subject: stepExecution.step.subject,
                    content: this.replaceVariables(stepExecution.step.content, stepExecution.execution),
                    direction: 'OUTBOUND',
                    status: 'PENDING',
                    senderId: stepExecution.execution.executorId,
                    customerId: customer.id,
                    leadId: stepExecution.execution.leadId,
                    appointmentId: stepExecution.execution.appointmentId
                }
            });

            // Send the email
            const success = await communicationService.sendMessage({
                messageId: message.id,
                type: 'EMAIL',
                to: customer.email,
                subject: stepExecution.step.subject,
                content: this.replaceVariables(stepExecution.step.content, stepExecution.execution),
                customerId: customer.id
            });

            return { success, messageId: message.id };
        } catch (error) {
            console.error('Error sending campaign email:', error);
            return { success: false };
        }
    }

    private async sendSMS(stepExecution: any): Promise<{success: boolean, messageId?: string}> {
        try {
            const customer = stepExecution.execution.customer;
            
            if (!customer.phone) {
                throw new Error('Customer has no phone number');
            }

            // Create message record
            const message = await prisma.message.create({
                data: {
                    type: 'CAMPAIGN_MESSAGE',
                    channel: 'SMS',
                    content: this.replaceVariables(stepExecution.step.content, stepExecution.execution),
                    direction: 'OUTBOUND',
                    status: 'PENDING',
                    senderId: stepExecution.execution.executorId,
                    customerId: customer.id,
                    leadId: stepExecution.execution.leadId,
                    appointmentId: stepExecution.execution.appointmentId
                }
            });

            // Send the SMS
            const success = await communicationService.sendMessage({
                messageId: message.id,
                type: 'SMS',
                to: customer.phone,
                content: this.replaceVariables(stepExecution.step.content, stepExecution.execution),
                customerId: customer.id
            });

            return { success, messageId: message.id };
        } catch (error) {
            console.error('Error sending campaign SMS:', error);
            return { success: false };
        }
    }

    private async createTask(stepExecution: any): Promise<{success: boolean, taskId?: string}> {
        try {
            const task = await prisma.task.create({
                data: {
                    title: this.replaceVariables(stepExecution.step.subject || stepExecution.step.name, stepExecution.execution),
                    description: this.replaceVariables(stepExecution.step.content, stepExecution.execution),
                    type: 'CUSTOM',
                    priority: 'MEDIUM',
                    status: 'PENDING',
                    isAutomated: true,
                    triggerType: 'campaign_step',
                    triggerData: { campaignStepId: stepExecution.step.id },
                    assigneeId: stepExecution.execution.executorId,
                    creatorId: stepExecution.execution.executorId,
                    customerId: stepExecution.execution.customerId,
                    leadId: stepExecution.execution.leadId,
                    appointmentId: stepExecution.execution.appointmentId
                }
            });

            return { success: true, taskId: task.id };
        } catch (error) {
            console.error('Error creating campaign task:', error);
            return { success: false };
        }
    }

    private replaceVariables(content: string, execution: any): string {
        const customer = execution.customer;
        const lead = execution.lead;
        const appointment = execution.appointment;
        const executor = execution.executor;

        let result = content;

        // Customer variables
        result = result.replace(/\{\{customer\.firstName\}\}/g, customer.firstName || '');
        result = result.replace(/\{\{customer\.lastName\}\}/g, customer.lastName || '');
        result = result.replace(/\{\{customer\.email\}\}/g, customer.email || '');
        result = result.replace(/\{\{customer\.phone\}\}/g, customer.phone || '');

        // Lead variables
        if (lead) {
            result = result.replace(/\{\{lead\.status\}\}/g, lead.status || '');
            result = result.replace(/\{\{lead\.priority\}\}/g, lead.priority || '');
        }

        // Appointment variables
        if (appointment) {
            result = result.replace(/\{\{appointment\.title\}\}/g, appointment.title || '');
            result = result.replace(/\{\{appointment\.startTime\}\}/g, appointment.startTime ? new Date(appointment.startTime).toLocaleString() : '');
        }

        // Executor variables
        if (executor) {
            result = result.replace(/\{\{agent\.firstName\}\}/g, executor.firstName || '');
            result = result.replace(/\{\{agent\.lastName\}\}/g, executor.lastName || '');
            result = result.replace(/\{\{agent\.email\}\}/g, executor.email || '');
        }

        return result;
    }

    private async checkExecutionCompletion(executionId: string): Promise<void> {
        const stepExecutions = await prisma.campaignStepExecution.findMany({
            where: { executionId }
        });

        const allCompleted = stepExecutions.every(step => 
            step.status === 'COMPLETED' || step.status === 'FAILED' || step.status === 'SKIPPED'
        );

        if (allCompleted) {
            await prisma.campaignExecution.update({
                where: { id: executionId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date()
                }
            });
        }
    }

    // Common trigger methods
    async triggerLeadCreated(leadId: string, customerId: string, userId: string): Promise<void> {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { vehicle: true }
        });

        await this.processTrigger({
            type: 'lead_created',
            data: { lead },
            customerId,
            leadId,
            userId
        });
    }

    async triggerAppointmentCompleted(appointmentId: string, customerId: string, userId: string): Promise<void> {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { vehicle: true }
        });

        await this.processTrigger({
            type: 'appointment_completed',
            data: { appointment },
            customerId,
            appointmentId,
            userId
        });
    }

    async triggerAppointmentNoShow(appointmentId: string, customerId: string, userId: string): Promise<void> {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { vehicle: true }
        });

        await this.processTrigger({
            type: 'appointment_no_show',
            data: { appointment },
            customerId,
            appointmentId,
            userId
        });
    }
}

export const workflowService = new WorkflowService();
