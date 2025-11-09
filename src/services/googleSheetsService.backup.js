const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_CAMPAIGN_ID;
    this.auth = null;
    this.sheets = null;
  }

  /**
   * Initialize Google Sheets API client
   */
  async initialize() {
    try {
      // Use service account authentication
      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
      
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log('✅ Google Sheets API initialized');
    } catch (error) {
      console.error('❌ Error initializing Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Read campaign contacts from Google Sheets
   * Expected columns: Name, Phone, Email, Status, LastContactDate, Notes
   */
  async getCampaignContacts(sheetName = 'Outbound Campaigns') {
    try {
      if (!this.sheets) await this.initialize();

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:Z`, // Start from row 2 (skip headers)
      });

      const rows = response.data.values || [];
      
      const contacts = rows.map((row, index) => ({
        rowNumber: index + 2, // +2 because we start from row 2
        name: row[0] || '',
        phone: this.formatPhoneNumber(row[1] || ''),
        email: row[2] || '',
        status: row[3] || 'PENDING', // PENDING, CALLED, COMPLETED, FAILED, DO_NOT_CALL
        lastContactDate: row[4] || null,
        notes: row[5] || '',
        customFields: {
          vehicleYear: row[6] || null,
          vehicleMake: row[7] || null,
          vehicleModel: row[8] || null,
          serviceType: row[9] || null,
          lastServiceDate: row[10] || null
        }
      }));

      // Filter out contacts marked as DO_NOT_CALL
      const callableContacts = contacts.filter(c => 
        c.status !== 'DO_NOT_CALL' && 
        c.phone && 
        c.phone.length >= 10
      );

      console.log(`📊 Loaded ${callableContacts.length} callable contacts from sheet`);
      return callableContacts;

    } catch (error) {
      console.error('❌ Error reading Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Update contact status in Google Sheets
   */
  async updateContactStatus(rowNumber, status, notes = '') {
    try {
      if (!this.sheets) await this.initialize();

      const sheetName = 'Outbound Campaigns';
      const timestamp = new Date().toISOString();

      // Update Status (column D) and LastContactDate (column E)
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!D${rowNumber}:F${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[status, timestamp, notes]]
        }
      });

      console.log(`✅ Updated row ${rowNumber}: ${status}`);
    } catch (error) {
      console.error('❌ Error updating Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Append call result to Google Sheets
   */
  async appendCallResult(callData) {
    try {
      if (!this.sheets) await this.initialize();

      const sheetName = 'Call Results';
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:H`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            new Date().toISOString(),
            callData.customerName,
            callData.phone,
            callData.callSid,
            callData.status,
            callData.duration || 0,
            callData.outcome,
            callData.notes || ''
          ]]
        }
      });

      console.log(`✅ Call result logged to sheet: ${callData.customerName}`);
    } catch (error) {
      console.error('❌ Error appending to Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Get contacts that need follow-up (status = NEEDS_FOLLOWUP)
   */
  async getFollowupContacts() {
    const allContacts = await this.getCampaignContacts();
    return allContacts.filter(c => c.status === 'NEEDS_FOLLOWUP');
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phone) {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Add +1 if not present (assume US)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    if (!cleaned.startsWith('1')) {
      cleaned = '1' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Create campaign tracking entry in database
   */
  async createCampaignInDatabase(campaignData) {
    const campaign = await prisma.outboundCampaign.create({
      data: {
        name: campaignData.name,
        type: campaignData.type,
        dealershipId: campaignData.dealershipId,
        googleSheetId: this.spreadsheetId,
        status: 'ACTIVE',
        totalContacts: campaignData.totalContacts,
        contactsCalled: 0,
        contactsCompleted: 0,
        startedAt: new Date(),
        scheduledTime: campaignData.scheduledTime,
        settings: {
          delayBetweenCalls: campaignData.delaySeconds || 30,
          callDuringHours: campaignData.callDuringHours || { start: '09:00', end: '18:00' },
          maxAttemptsPerContact: campaignData.maxAttempts || 3,
          recordCalls: campaignData.recordCalls !== false
        }
      }
    });

    console.log('✅ Campaign created in database:', campaign.id);
    return campaign;
  }
}

module.exports = GoogleSheetsService;
