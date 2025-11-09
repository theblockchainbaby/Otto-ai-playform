export interface OutboundCampaign {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'paused' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

export interface OutboundCallLog {
    id: string;
    campaignId: string;
    callSid: string;
    from: string;
    to: string;
    status: 'initiated' | 'in-progress' | 'completed' | 'failed';
    duration: number; // in seconds
    createdAt: Date;
    updatedAt: Date;
}

export interface OutboundCallRequest {
    campaignId: string;
    to: string;
    from: string;
}

export interface OutboundCallResponse {
    callSid: string;
    status: string;
    message?: string;
}