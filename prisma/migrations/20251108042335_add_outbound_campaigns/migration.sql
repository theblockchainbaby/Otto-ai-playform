-- AlterEnum - Add enum values first
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'PENDING';
COMMIT;

BEGIN;
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'RUNNING';
COMMIT;

BEGIN;
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'STOPPED';
COMMIT;

BEGIN;
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'FAILED';
COMMIT;

BEGIN;
ALTER TYPE "CampaignType" ADD VALUE IF NOT EXISTS 'APPOINTMENT_REMINDER';
COMMIT;

BEGIN;
ALTER TYPE "CampaignType" ADD VALUE IF NOT EXISTS 'SERVICE_FOLLOWUP';
COMMIT;

BEGIN;
ALTER TYPE "CampaignType" ADD VALUE IF NOT EXISTS 'SALES_OUTREACH';
COMMIT;

BEGIN;
ALTER TYPE "CampaignType" ADD VALUE IF NOT EXISTS 'CUSTOMER_SATISFACTION';
COMMIT;

BEGIN;
ALTER TYPE "CampaignType" ADD VALUE IF NOT EXISTS 'PAYMENT_REMINDER';
COMMIT;

BEGIN;
ALTER TYPE "CampaignType" ADD VALUE IF NOT EXISTS 'GENERAL';
COMMIT;

-- Wait a moment to ensure enum values are committed
BEGIN;

-- CreateTable
CREATE TABLE "outbound_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "dealershipId" TEXT,
    "googleSheetId" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'PENDING',
    "totalContacts" INTEGER NOT NULL DEFAULT 0,
    "contactsCalled" INTEGER NOT NULL DEFAULT 0,
    "contactsCompleted" INTEGER NOT NULL DEFAULT 0,
    "contactsFailed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "scheduledTime" TIMESTAMP(3),
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbound_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_calls" (
    "id" TEXT NOT NULL,
    "callSid" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "status" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "answeredBy" TEXT,
    "recordingUrl" TEXT,
    "recordingSid" TEXT,
    "recordingDuration" INTEGER,
    "transcript" TEXT,
    "outcome" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT,

    CONSTRAINT "outbound_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outbound_calls_callSid_key" ON "outbound_calls"("callSid");

-- AddForeignKey
ALTER TABLE "outbound_calls" ADD CONSTRAINT "outbound_calls_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "outbound_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
