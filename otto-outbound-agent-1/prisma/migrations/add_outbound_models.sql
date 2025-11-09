CREATE TABLE "OutboundCampaign" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OutboundCallLog" (
    "id" SERIAL PRIMARY KEY,
    "campaignId" INTEGER REFERENCES "OutboundCampaign"("id") ON DELETE CASCADE,
    "callSid" VARCHAR(255) NOT NULL,
    "from" VARCHAR(50) NOT NULL,
    "to" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);