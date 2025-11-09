import { OutboundCampaign } from '../models/OutboundCampaign';
import { OutboundCallLog } from '../models/OutboundCallLog';

export class CampaignAnalytics {
  static generateCampaignReport(campaign: OutboundCampaign): object {
    const totalCalls = campaign.callLogs.length;
    const successfulCalls = campaign.callLogs.filter(log => log.status === 'completed').length;
    const failedCalls = totalCalls - successfulCalls;

    return {
      campaignId: campaign.id,
      totalCalls,
      successfulCalls,
      failedCalls,
      successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0,
    };
  }

  static trackKeyMetrics(callLogs: OutboundCallLog[]): object {
    const totalCalls = callLogs.length;
    const successfulCalls = callLogs.filter(log => log.status === 'completed').length;
    const averageDuration = successfulCalls > 0 
      ? callLogs
          .filter(log => log.status === 'completed')
          .reduce((sum, log) => sum + log.duration, 0) / successfulCalls 
      : 0;

    return {
      totalCalls,
      successfulCalls,
      averageDuration,
      successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0,
    };
  }
}