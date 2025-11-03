const axios = require('axios');

/**
 * CRM Integration Service
 * Handles integration with multiple CRM platforms (Salesforce, HubSpot, Pipedrive, etc.)
 */

class CRMIntegrationService {
  constructor() {
    this.adapters = {};
    this.initializeAdapters();
  }

  /**
   * Initialize all available CRM adapters
   */
  initializeAdapters() {
    this.adapters = {
      salesforce: new SalesforceAdapter(),
      hubspot: new HubSpotAdapter(),
      pipedrive: new PipedriveAdapter(),
      zoho: new ZohoCRMAdapter(),
      freshsales: new FreshsalesAdapter()
    };
  }

  /**
   * Get available CRM platforms
   */
  getAvailablePlatforms() {
    return Object.keys(this.adapters);
  }

  /**
   * Sync customer to CRM
   */
  async syncCustomerToCRM(crmType, credentials, customerData) {
    const adapter = this.adapters[crmType.toLowerCase()];
    if (!adapter) {
      throw new Error(`Unsupported CRM type: ${crmType}`);
    }
    return await adapter.syncCustomer(credentials, customerData);
  }

  /**
   * Sync appointment to CRM
   */
  async syncAppointmentToCRM(crmType, credentials, appointmentData) {
    const adapter = this.adapters[crmType.toLowerCase()];
    if (!adapter) {
      throw new Error(`Unsupported CRM type: ${crmType}`);
    }
    return await adapter.syncAppointment(credentials, appointmentData);
  }

  /**
   * Sync lead to CRM
   */
  async syncLeadToCRM(crmType, credentials, leadData) {
    const adapter = this.adapters[crmType.toLowerCase()];
    if (!adapter) {
      throw new Error(`Unsupported CRM type: ${crmType}`);
    }
    return await adapter.syncLead(credentials, leadData);
  }

  /**
   * Get customer from CRM
   */
  async getCustomerFromCRM(crmType, credentials, customerId) {
    const adapter = this.adapters[crmType.toLowerCase()];
    if (!adapter) {
      throw new Error(`Unsupported CRM type: ${crmType}`);
    }
    return await adapter.getCustomer(credentials, customerId);
  }

  /**
   * Test CRM connection
   */
  async testConnection(crmType, credentials) {
    const adapter = this.adapters[crmType.toLowerCase()];
    if (!adapter) {
      throw new Error(`Unsupported CRM type: ${crmType}`);
    }
    return await adapter.testConnection(credentials);
  }

  /**
   * Get all customers from CRM
   */
  async getCustomersFromCRM(crmType, credentials) {
    const adapter = this.adapters[crmType.toLowerCase()];
    if (!adapter) {
      throw new Error(`Unsupported CRM type: ${crmType}`);
    }
    return await adapter.getCustomers(credentials);
  }
}

/**
 * Base CRM Adapter Class
 */
class BaseCRMAdapter {
  async testConnection(credentials) {
    throw new Error('testConnection must be implemented');
  }

  async syncCustomer(credentials, customerData) {
    throw new Error('syncCustomer must be implemented');
  }

  async syncAppointment(credentials, appointmentData) {
    throw new Error('syncAppointment must be implemented');
  }

  async syncLead(credentials, leadData) {
    throw new Error('syncLead must be implemented');
  }

  async getCustomer(credentials, customerId) {
    throw new Error('getCustomer must be implemented');
  }

  async getCustomers(credentials) {
    throw new Error('getCustomers must be implemented');
  }
}

/**
 * Salesforce CRM Adapter
 */
class SalesforceAdapter extends BaseCRMAdapter {
  async testConnection(credentials) {
    try {
      const { instanceUrl, clientId, clientSecret, username, password } = credentials;
      
      // Get access token
      const tokenResponse = await axios.post(
        `${instanceUrl}/services/oauth2/token`,
        {
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username,
          password
        }
      );

      return {
        success: true,
        message: 'Salesforce connection successful',
        accessToken: tokenResponse.data.access_token
      };
    } catch (error) {
      throw new Error(`Salesforce connection failed: ${error.message}`);
    }
  }

  async syncCustomer(credentials, customerData) {
    try {
      const token = await this.testConnection(credentials);
      const { instanceUrl } = credentials;

      const response = await axios.post(
        `${instanceUrl}/services/data/v57.0/sobjects/Account`,
        {
          Name: `${customerData.firstName} ${customerData.lastName}`,
          Phone: customerData.phone,
          Email__c: customerData.email,
          BillingStreet: customerData.address,
          BillingCity: customerData.city,
          BillingState: customerData.state,
          BillingPostalCode: customerData.zipCode
        },
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.id,
        message: 'Customer synced to Salesforce'
      };
    } catch (error) {
      throw new Error(`Failed to sync customer to Salesforce: ${error.message}`);
    }
  }

  async syncAppointment(credentials, appointmentData) {
    try {
      const token = await this.testConnection(credentials);
      const { instanceUrl } = credentials;

      const response = await axios.post(
        `${instanceUrl}/services/data/v57.0/sobjects/Event`,
        {
          Subject: appointmentData.title,
          StartDateTime: appointmentData.startTime,
          EndDateTime: appointmentData.endTime,
          Description: appointmentData.notes,
          WhoId: appointmentData.customerId
        },
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.id,
        message: 'Appointment synced to Salesforce'
      };
    } catch (error) {
      throw new Error(`Failed to sync appointment to Salesforce: ${error.message}`);
    }
  }

  async syncLead(credentials, leadData) {
    try {
      const token = await this.testConnection(credentials);
      const { instanceUrl } = credentials;

      const response = await axios.post(
        `${instanceUrl}/services/data/v57.0/sobjects/Lead`,
        {
          FirstName: leadData.firstName,
          LastName: leadData.lastName,
          Phone: leadData.phone,
          Email: leadData.email,
          Company: leadData.company,
          Description: leadData.notes
        },
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.id,
        message: 'Lead synced to Salesforce'
      };
    } catch (error) {
      throw new Error(`Failed to sync lead to Salesforce: ${error.message}`);
    }
  }

  async getCustomer(credentials, customerId) {
    try {
      const token = await this.testConnection(credentials);
      const { instanceUrl } = credentials;

      const response = await axios.get(
        `${instanceUrl}/services/data/v57.0/sobjects/Account/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer from Salesforce: ${error.message}`);
    }
  }

  async getCustomers(credentials) {
    try {
      const token = await this.testConnection(credentials);
      const { instanceUrl } = credentials;

      const response = await axios.get(
        `${instanceUrl}/services/data/v57.0/query?q=SELECT+Id,Name,Phone,Email__c,BillingStreet,BillingCity,BillingState,BillingPostalCode+FROM+Account+LIMIT+1000`,
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`
          }
        }
      );

      return response.data.records.map(record => ({
        id: record.Id,
        firstName: record.Name.split(' ')[0],
        lastName: record.Name.split(' ').slice(1).join(' ') || '',
        email: record.Email__c,
        phone: record.Phone,
        address: record.BillingStreet,
        city: record.BillingCity,
        state: record.BillingState,
        zipCode: record.BillingPostalCode,
        crmId: record.Id,
        crmType: 'salesforce'
      }));
    } catch (error) {
      throw new Error(`Failed to get customers from Salesforce: ${error.message}`);
    }
  }
}

/**
 * HubSpot CRM Adapter
 */
class HubSpotAdapter extends BaseCRMAdapter {
  async testConnection(credentials) {
    try {
      const { apiKey } = credentials;

      const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: { limit: 1 }
      });

      return {
        success: true,
        message: 'HubSpot connection successful'
      };
    } catch (error) {
      throw new Error(`HubSpot connection failed: ${error.message}`);
    }
  }

  async syncCustomer(credentials, customerData) {
    try {
      const { apiKey } = credentials;

      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts',
        {
          properties: {
            firstname: customerData.firstName,
            lastname: customerData.lastName,
            phone: customerData.phone,
            email: customerData.email,
            address: customerData.address,
            city: customerData.city,
            state: customerData.state,
            zip: customerData.zipCode
          }
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.id,
        message: 'Customer synced to HubSpot'
      };
    } catch (error) {
      throw new Error(`Failed to sync customer to HubSpot: ${error.message}`);
    }
  }

  async syncAppointment(credentials, appointmentData) {
    try {
      const { apiKey } = credentials;

      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/meetings',
        {
          properties: {
            hs_meeting_title: appointmentData.title,
            hs_meeting_start_time: new Date(appointmentData.startTime).getTime(),
            hs_meeting_end_time: new Date(appointmentData.endTime).getTime(),
            notes: appointmentData.notes
          }
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.id,
        message: 'Appointment synced to HubSpot'
      };
    } catch (error) {
      throw new Error(`Failed to sync appointment to HubSpot: ${error.message}`);
    }
  }

  async syncLead(credentials, leadData) {
    // In HubSpot, leads are contacts with a specific lifecycle stage
    return await this.syncCustomer(credentials, leadData);
  }

  async getCustomer(credentials, customerId) {
    try {
      const { apiKey } = credentials;

      const response = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/contacts/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer from HubSpot: ${error.message}`);
    }
  }

  async getCustomers(credentials) {
    try {
      const { apiKey } = credentials;

      const response = await axios.get(
        'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,address,city,state,zip',
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      return response.data.results.map(contact => ({
        id: contact.id,
        firstName: contact.properties.firstname || '',
        lastName: contact.properties.lastname || '',
        email: contact.properties.email,
        phone: contact.properties.phone,
        address: contact.properties.address,
        city: contact.properties.city,
        state: contact.properties.state,
        zipCode: contact.properties.zip,
        crmId: contact.id,
        crmType: 'hubspot'
      }));
    } catch (error) {
      throw new Error(`Failed to get customers from HubSpot: ${error.message}`);
    }
  }
}

/**
 * Pipedrive CRM Adapter
 */
class PipedriveAdapter extends BaseCRMAdapter {
  async testConnection(credentials) {
    try {
      const { apiToken, companyDomain } = credentials;

      const response = await axios.get(
        `https://${companyDomain}.pipedrive.com/v1/users/me`,
        {
          params: { api_token: apiToken }
        }
      );

      return {
        success: true,
        message: 'Pipedrive connection successful'
      };
    } catch (error) {
      throw new Error(`Pipedrive connection failed: ${error.message}`);
    }
  }

  async syncCustomer(credentials, customerData) {
    try {
      const { apiToken, companyDomain } = credentials;

      const response = await axios.post(
        `https://${companyDomain}.pipedrive.com/v1/persons`,
        {
          name: `${customerData.firstName} ${customerData.lastName}`,
          phone: [{ value: customerData.phone, primary: true }],
          email: [{ value: customerData.email, primary: true }],
          org_id: customerData.organizationId
        },
        {
          params: { api_token: apiToken }
        }
      );

      return {
        success: true,
        crmId: response.data.data.id,
        message: 'Customer synced to Pipedrive'
      };
    } catch (error) {
      throw new Error(`Failed to sync customer to Pipedrive: ${error.message}`);
    }
  }

  async syncAppointment(credentials, appointmentData) {
    try {
      const { apiToken, companyDomain } = credentials;

      const response = await axios.post(
        `https://${companyDomain}.pipedrive.com/v1/activities`,
        {
          type: 'meeting',
          subject: appointmentData.title,
          due_date: new Date(appointmentData.startTime).toISOString().split('T')[0],
          due_time: new Date(appointmentData.startTime).toISOString().split('T')[1].substring(0, 5),
          note: appointmentData.notes,
          person_id: appointmentData.customerId
        },
        {
          params: { api_token: apiToken }
        }
      );

      return {
        success: true,
        crmId: response.data.data.id,
        message: 'Appointment synced to Pipedrive'
      };
    } catch (error) {
      throw new Error(`Failed to sync appointment to Pipedrive: ${error.message}`);
    }
  }

  async syncLead(credentials, leadData) {
    // In Pipedrive, leads are deals
    try {
      const { apiToken, companyDomain } = credentials;

      const response = await axios.post(
        `https://${companyDomain}.pipedrive.com/v1/deals`,
        {
          title: `${leadData.firstName} ${leadData.lastName}`,
          person_id: leadData.customerId,
          status: 'open'
        },
        {
          params: { api_token: apiToken }
        }
      );

      return {
        success: true,
        crmId: response.data.data.id,
        message: 'Lead synced to Pipedrive'
      };
    } catch (error) {
      throw new Error(`Failed to sync lead to Pipedrive: ${error.message}`);
    }
  }

  async getCustomer(credentials, customerId) {
    try {
      const { apiToken, companyDomain } = credentials;

      const response = await axios.get(
        `https://${companyDomain}.pipedrive.com/v1/persons/${customerId}`,
        {
          params: { api_token: apiToken }
        }
      );

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get customer from Pipedrive: ${error.message}`);
    }
  }

  async getCustomers(credentials) {
    try {
      const { apiToken, companyDomain } = credentials;

      const response = await axios.get(
        `https://${companyDomain}.pipedrive.com/v1/persons`,
        {
          params: { api_token: apiToken, limit: 500 }
        }
      );

      return response.data.data.map(person => ({
        id: person.id,
        firstName: person.first_name || '',
        lastName: person.last_name || '',
        email: person.email?.[0]?.value,
        phone: person.phone?.[0]?.value,
        address: person.org_id?.address,
        city: '',
        state: '',
        zipCode: '',
        crmId: person.id,
        crmType: 'pipedrive'
      }));
    } catch (error) {
      throw new Error(`Failed to get customers from Pipedrive: ${error.message}`);
    }
  }
}

/**
 * Zoho CRM Adapter
 */
class ZohoCRMAdapter extends BaseCRMAdapter {
  async testConnection(credentials) {
    try {
      const { accessToken } = credentials;

      const response = await axios.get('https://www.zohoapis.com/crm/v2/users', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: 'Zoho CRM connection successful'
      };
    } catch (error) {
      throw new Error(`Zoho CRM connection failed: ${error.message}`);
    }
  }

  async syncCustomer(credentials, customerData) {
    try {
      const { accessToken } = credentials;

      const response = await axios.post(
        'https://www.zohoapis.com/crm/v2/Accounts',
        {
          data: [
            {
              Account_Name: `${customerData.firstName} ${customerData.lastName}`,
              Phone: customerData.phone,
              Email: customerData.email,
              Billing_Street: customerData.address,
              Billing_City: customerData.city,
              Billing_State: customerData.state,
              Billing_Code: customerData.zipCode
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.data[0].id,
        message: 'Customer synced to Zoho CRM'
      };
    } catch (error) {
      throw new Error(`Failed to sync customer to Zoho CRM: ${error.message}`);
    }
  }

  async syncAppointment(credentials, appointmentData) {
    try {
      const { accessToken } = credentials;

      const response = await axios.post(
        'https://www.zohoapis.com/crm/v2/Events',
        {
          data: [
            {
              Event_Title: appointmentData.title,
              Start_DateTime: appointmentData.startTime,
              End_DateTime: appointmentData.endTime,
              Description: appointmentData.notes
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.data[0].id,
        message: 'Appointment synced to Zoho CRM'
      };
    } catch (error) {
      throw new Error(`Failed to sync appointment to Zoho CRM: ${error.message}`);
    }
  }

  async syncLead(credentials, leadData) {
    try {
      const { accessToken } = credentials;

      const response = await axios.post(
        'https://www.zohoapis.com/crm/v2/Leads',
        {
          data: [
            {
              First_Name: leadData.firstName,
              Last_Name: leadData.lastName,
              Phone: leadData.phone,
              Email: leadData.email,
              Company: leadData.company
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.data[0].id,
        message: 'Lead synced to Zoho CRM'
      };
    } catch (error) {
      throw new Error(`Failed to sync lead to Zoho CRM: ${error.message}`);
    }
  }

  async getCustomer(credentials, customerId) {
    try {
      const { accessToken } = credentials;

      const response = await axios.get(
        `https://www.zohoapis.com/crm/v2/Accounts/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data.data[0];
    } catch (error) {
      throw new Error(`Failed to get customer from Zoho CRM: ${error.message}`);
    }
  }

  async getCustomers(credentials) {
    try {
      const { accessToken } = credentials;

      const response = await axios.get(
        'https://www.zohoapis.com/crm/v2/Accounts?fields=Account_Name,Phone,Email,Billing_Street,Billing_City,Billing_State,Billing_Code&per_page=200',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data.data.map(account => ({
        id: account.id,
        firstName: account.Account_Name?.split(' ')[0] || '',
        lastName: account.Account_Name?.split(' ').slice(1).join(' ') || '',
        email: account.Email,
        phone: account.Phone,
        address: account.Billing_Street,
        city: account.Billing_City,
        state: account.Billing_State,
        zipCode: account.Billing_Code,
        crmId: account.id,
        crmType: 'zoho'
      }));
    } catch (error) {
      throw new Error(`Failed to get customers from Zoho CRM: ${error.message}`);
    }
  }
}

/**
 * Freshsales CRM Adapter
 */
class FreshsalesAdapter extends BaseCRMAdapter {
  async testConnection(credentials) {
    try {
      const { apiKey, domain } = credentials;

      const response = await axios.get(`https://${domain}.freshsales.io/api/contacts`, {
        headers: {
          Authorization: `Token token="${apiKey}"`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: 'Freshsales connection successful'
      };
    } catch (error) {
      throw new Error(`Freshsales connection failed: ${error.message}`);
    }
  }

  async syncCustomer(credentials, customerData) {
    try {
      const { apiKey, domain } = credentials;

      const response = await axios.post(
        `https://${domain}.freshsales.io/api/contacts`,
        {
          contact: {
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            mobile_number: customerData.phone,
            email: customerData.email
          }
        },
        {
          headers: {
            Authorization: `Token token="${apiKey}"`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.contact.id,
        message: 'Customer synced to Freshsales'
      };
    } catch (error) {
      throw new Error(`Failed to sync customer to Freshsales: ${error.message}`);
    }
  }

  async syncAppointment(credentials, appointmentData) {
    try {
      const { apiKey, domain } = credentials;

      const response = await axios.post(
        `https://${domain}.freshsales.io/api/tasks`,
        {
          task: {
            title: appointmentData.title,
            due_date: new Date(appointmentData.startTime).toISOString().split('T')[0],
            description: appointmentData.notes,
            task_type: 'meeting'
          }
        },
        {
          headers: {
            Authorization: `Token token="${apiKey}"`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        crmId: response.data.task.id,
        message: 'Appointment synced to Freshsales'
      };
    } catch (error) {
      throw new Error(`Failed to sync appointment to Freshsales: ${error.message}`);
    }
  }

  async syncLead(credentials, leadData) {
    return await this.syncCustomer(credentials, leadData);
  }

  async getCustomer(credentials, customerId) {
    try {
      const { apiKey, domain } = credentials;

      const response = await axios.get(
        `https://${domain}.freshsales.io/api/contacts/${customerId}`,
        {
          headers: {
            Authorization: `Token token="${apiKey}"`
          }
        }
      );

      return response.data.contact;
    } catch (error) {
      throw new Error(`Failed to get customer from Freshsales: ${error.message}`);
    }
  }

  async getCustomers(credentials) {
    try {
      const { apiKey, domain } = credentials;

      const response = await axios.get(
        `https://${domain}.freshsales.io/api/contacts?page=1&per_page=100`,
        {
          headers: {
            Authorization: `Token token="${apiKey}"`
          }
        }
      );

      return response.data.contacts.map(contact => ({
        id: contact.id,
        firstName: contact.first_name || '',
        lastName: contact.last_name || '',
        email: contact.email,
        phone: contact.mobile_number,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zipCode: contact.zipcode,
        crmId: contact.id,
        crmType: 'freshsales'
      }));
    } catch (error) {
      throw new Error(`Failed to get customers from Freshsales: ${error.message}`);
    }
  }
}

module.exports = new CRMIntegrationService();

