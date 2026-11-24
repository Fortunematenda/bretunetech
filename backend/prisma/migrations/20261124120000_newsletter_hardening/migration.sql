-- Newsletter hardening: claim/retry, webhook dedupe, campaign cancel metadata, ACCEPTED events

ALTER TYPE "NewsletterEventType" ADD VALUE IF NOT EXISTS 'ACCEPTED';

ALTER TABLE "newsletter_recipients"
  ADD COLUMN IF NOT EXISTS "nextAttemptAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "claimToken" TEXT;

CREATE INDEX IF NOT EXISTS "newsletter_recipients_campaign_status_next_idx"
  ON "newsletter_recipients"("campaignId", "status", "nextAttemptAt");

ALTER TABLE "newsletter_campaigns"
  ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancelledById" TEXT;

ALTER TABLE "newsletter_events"
  ADD COLUMN IF NOT EXISTS "providerEventId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_events_provider_event_id_key"
  ON "newsletter_events"("providerEventId")
  WHERE "providerEventId" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "newsletter_webhook_receipts" (
  "id" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "newsletter_webhook_receipts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_webhook_receipts_provider_event_id_key"
  ON "newsletter_webhook_receipts"("providerEventId");
