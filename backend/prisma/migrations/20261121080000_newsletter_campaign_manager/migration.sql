-- Newsletter & email campaign manager (reversible: drop tables in reverse order)

CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'SUPPRESSED');
CREATE TYPE "NewsletterCampaignStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED', 'FAILED');
CREATE TYPE "NewsletterRecipientStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINT', 'FAILED', 'SKIPPED');
CREATE TYPE "NewsletterEventType" AS ENUM ('DELIVERED', 'OPEN', 'BOUNCE', 'CLICK', 'COMPLAINT', 'UNSUBSCRIBE');

CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "status" "NewsletterSubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentIp" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmTokenHash" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");
CREATE INDEX "newsletter_subscribers_userId_idx" ON "newsletter_subscribers"("userId");

CREATE TABLE "newsletter_suppressions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "newsletter_suppressions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_suppressions_email_key" ON "newsletter_suppressions"("email");

CREATE TABLE "newsletter_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "previewText" TEXT NOT NULL DEFAULT '',
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "audience" JSONB NOT NULL,
    "status" "NewsletterCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "blocks" JSONB NOT NULL,
    "monthKey" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_campaigns_monthKey_key" ON "newsletter_campaigns"("monthKey");
CREATE INDEX "newsletter_campaigns_status_idx" ON "newsletter_campaigns"("status");

CREATE TABLE "newsletter_recipients" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "NewsletterRecipientStatus" NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    CONSTRAINT "newsletter_recipients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_recipients_providerMessageId_key" ON "newsletter_recipients"("providerMessageId");
CREATE UNIQUE INDEX "newsletter_recipients_idempotencyKey_key" ON "newsletter_recipients"("idempotencyKey");
CREATE UNIQUE INDEX "newsletter_recipients_campaignId_subscriberId_key" ON "newsletter_recipients"("campaignId", "subscriberId");
CREATE INDEX "newsletter_recipients_campaignId_status_idx" ON "newsletter_recipients"("campaignId", "status");

CREATE TABLE "newsletter_events" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "recipientId" TEXT,
    "type" "NewsletterEventType" NOT NULL,
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "newsletter_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "newsletter_events_campaignId_type_idx" ON "newsletter_events"("campaignId", "type");
CREATE INDEX "newsletter_events_recipientId_idx" ON "newsletter_events"("recipientId");

CREATE TABLE "newsletter_schedules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dayOfMonth" INTEGER NOT NULL DEFAULT 1,
    "hour" INTEGER NOT NULL DEFAULT 8,
    "timeZone" TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lastDraftMonth" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "newsletter_audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "newsletter_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "newsletter_audit_logs_entity_entityId_idx" ON "newsletter_audit_logs"("entity", "entityId");
CREATE INDEX "newsletter_audit_logs_createdAt_idx" ON "newsletter_audit_logs"("createdAt");

ALTER TABLE "newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "newsletter_recipients" ADD CONSTRAINT "newsletter_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "newsletter_recipients" ADD CONSTRAINT "newsletter_recipients_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "newsletter_subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "newsletter_events" ADD CONSTRAINT "newsletter_events_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "newsletter_events" ADD CONSTRAINT "newsletter_events_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "newsletter_recipients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "newsletter_audit_logs" ADD CONSTRAINT "newsletter_audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;