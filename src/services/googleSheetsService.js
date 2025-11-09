const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_CAMPAIGN_ID || '1SR-OivNGO02wxjKQ_ehzw3nAGXg1HRpGSnI5URttc0w';
    this.usePublicAccess = !process.env.GOOGLE_SHEETS_CREDENTIALS;
  }

  /**
   * Read campaign contacts from public Google Sheets (CSV export)
   */
  async getCampaignContacts(sheetName = 'Outbound Campaigns') {
    try {
      if (this.usePublicAccess) {
        return await this.getCampaignContactsPublic(sheetName);
      } else {
        return await this.getCampaignContactsPrivate(sheetName);
      }
    } catch (error) {
      console.error('❌ Error reading Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Get contacts from public sheet via CSV export
   */
  async getCampaignContactsPublic(sheetName) {
    try {
      // Google Sheets CSV export URL for public sheets
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      
      console.log(`📊 Fetching public sheet: ${sheetName}`);
      
      const response = await axios.get(csvUrl);
      const csvData = response.data;
      
      // Parse CSV
      const lines = csvData.split('\n');
      const headers = this.parseCSVLine(lines[0]);
      
      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = this.parseCSVLine(lines[i]);
        if (values.length < 2) continue; // Need at least name and phone
        
        const contact = {
          rowNumber: i + 1,
          name: values[0] || '',
          phone: this.formatPhoneNumber(values[1] || ''),
          email: values[2] || '',
          status: values[3] || 'PENDING',
          lastContactDate: values[4] || null,
          notes: values[5] || '',
          customFields: {
            vehicleYear: values[6] || null,
            vehicleMake: values[7] || null,
            vehicleModel: values[8] || null,
            serviceType: values[9] || null,
            lastServiceDate: values[10] || null
          }
        };
        
        contacts.push(contact);
      }

      // Filter out contacts marked as DO_NOT_CALL and invalid phones
      const callableContacts = contacts.filter(c => 
        c.status !== 'DO_NOT_CALL' && 
        c.phone && 
        c.phone.length >= 10
      );

      console.log(`📊 Loaded ${callableContacts.length} callable contacts from public sheet`);
      return callableContacts;

    } catch (error) {
      console.error('❌ Error reading public Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Get contacts from private sheet via Google API (requires credentials)
   */
  async getCampaignContactsPrivate(sheetName) {
    const { google } = require('googleapis');
    
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth: auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A2:Z`,
    });

    const rows = response.data.values || [];
    
    const contacts = rows.map((row, index) => ({
      rowNumber: index + 2,
      name: row[0] || '',
      phone: this.formatPhoneNumber(row[1] || ''),
      email: row[2] || '',
      status: row[3] || 'PENDING',
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

    const callableContacts = contacts.filter(c => 
      c.status !== 'DO_NOT_CALL' && 
      c.phone && 
      c.phone.length >= 10
    );

    console.log(`📊 Loaded ${callableContacts.length} callable contacts from private sheet`);
    return callableContacts;
  }

  /**
   * Parse CSV line handling quoted fields
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Update contact status - only works with private sheets
   */
  async updateContactStatus(rowNumber, status, notes = '') {
    if (this.usePublicAccess) {
      console.warn('⚠️  Cannot update public sheet. Enable GOOGLE_SHEETS_CREDENTIALS for write access.');
      return;
    }

    try {
      const { google } = require('googleapis');
      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      const sheets = google.sheets({ version: 'v4', auth: auth });

      const sheetName = 'Outbound Campaigns';
      const timestamp = new Date().toISOString();

      await sheets.spreadsheets.values.update({
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
    }
  }

  /**
   * Append call result - only works with private sheets
   */
  async appendCallResult(callData) {
    if (this.usePublicAccess) {
      console.log('📊 Call result (read-only mode):', {
        name: callData.customerName,
        phone: callData.phone,
        status: callData.status
      });
      return;
    }

    try {
      const { google } = require('googleapis');
      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      const sheets = google.sheets({ version: 'v4', auth: auth });

      const sheetName = 'Call Results';
      
      await sheets.spreadsheets.values.append({
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
    }
  }

  /**
   * Get contacts that need follow-up
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
    
    if (!cleaned.startsWith('1') && cleaned.length === 11) {
      // Already has country code
    } else if (!cleaned.startsWith('1')) {
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
