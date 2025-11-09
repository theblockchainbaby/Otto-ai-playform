# Otto Outbound Agent

The Otto Outbound Agent is an enterprise-grade solution designed for managing outbound calling campaigns in the automotive industry. This project integrates with various services, including ElevenLabs for AI-driven interactions, Twilio for telephony services, and Google Sheets for data management.

## Project Structure

- **src/**: Contains the main application code.
  - **services/**: Service classes for handling interactions with external APIs.
    - `elevenLabsOutboundService.ts`: Manages ElevenLabs API interactions for outbound calls.
    - `twilioOutboundService.ts`: Manages Twilio API interactions for making outbound calls.
    - `googleSheetsService.ts`: Provides methods for reading from and writing to Google Sheets.
    - `outboundCampaignService.ts`: Orchestrates the outbound calling campaign.
  - **routes/**: Express routers for handling API requests.
    - `outboundCalls.ts`: Defines routes for initiating outbound calls and managing campaigns.
    - `twilioOutboundWebhooks.ts`: Handles Twilio webhooks for outbound call events.
  - **models/**: Defines data structures for the application.
    - `OutboundCampaign.ts`: Structure for outbound campaigns in the database.
    - `OutboundCallLog.ts`: Structure for logging call details.
  - **middleware/**: Middleware for request handling.
    - `outboundAuth.ts`: Authenticates outbound call requests.
    - `rateLimiter.ts`: Implements rate limiting for outbound calls.
  - **utils/**: Utility functions for various tasks.
    - `callScheduler.ts`: Manages scheduling of outbound calls.
    - `sheetsParser.ts`: Parses data from Google Sheets.
    - `campaignAnalytics.ts`: Analyzes campaign performance.
  - **types/**: TypeScript types and interfaces related to outbound calls and campaigns.

- **n8n-workflows/**: Contains n8n workflow definitions for automating processes.
  - `outbound-campaign-trigger.json`: Triggers outbound campaigns.
  - `google-sheets-sync.json`: Syncs data with Google Sheets.
  - `call-result-processor.json`: Processes call results.

- **prisma/**: Contains database migration scripts.
  - `migrations/add_outbound_models.sql`: SQL scripts for adding outbound campaign and call log models.

- **tests/**: Contains unit and integration tests for the application.
  - **services/**: Unit tests for service classes.
    - `outboundCampaignService.test.ts`: Tests for the OutboundCampaignService.
  - **integration/**: Integration tests for the outbound calling flow.
    - `outbound-flow.test.ts`: Tests for end-to-end scenarios.

- **scripts/**: Contains utility scripts for setup and testing.
  - `setup-outbound-agent.sh`: Script for setting up the outbound agent environment.
  - `test-outbound-call.sh`: Script for testing outbound calls.

- **.env.example**: Example environment configuration file.

- **package.json**: npm configuration file.

- **tsconfig.json**: TypeScript configuration file.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd otto-outbound-agent
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables by copying `.env.example` to `.env` and filling in the required values.

4. Run database migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the application:
   ```
   npm run dev
   ```

## Usage

- Use the defined routes to initiate outbound calls and manage campaigns.
- Integrate with Google Sheets for campaign data management.
- Monitor call results and campaign performance through the provided analytics utilities.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.