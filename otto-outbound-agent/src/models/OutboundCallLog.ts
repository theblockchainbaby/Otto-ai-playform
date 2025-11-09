export class OutboundCallLog {
    callId: string;
    campaignId: string;
    callerId: string;
    recipientId: string;
    status: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    error?: string;

    constructor(
        callId: string,
        campaignId: string,
        callerId: string,
        recipientId: string,
        status: string,
        startTime: Date,
        endTime: Date,
        duration: number,
        error?: string
    ) {
        this.callId = callId;
        this.campaignId = campaignId;
        this.callerId = callerId;
        this.recipientId = recipientId;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.error = error;
    }

    // Method to log call results
    logCallResult() {
        // Implementation for logging the call result to the database
    }

    // Method to format call log for reporting
    formatLog() {
        return {
            callId: this.callId,
            campaignId: this.campaignId,
            callerId: this.callerId,
            recipientId: this.recipientId,
            status: this.status,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            error: this.error,
        };
    }
}