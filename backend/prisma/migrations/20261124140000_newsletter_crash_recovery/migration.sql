-- Crash recovery states, pending webhooks, shared worker lock + rate bucket

ALTER TYPE "NewsletterRecipientStatus" ADD VALUE IF NOT EXISTS 'DISPATCHING';
ALTER TYPE "NewsletterRecipientStatus" ADD VALUE IF NOT EXISTS 'AMBIGUOUS';

CREATE TABLE IF NOT EXISTS "newsletter_pending_webhooks" (
  "id" TEXT NOT NULL,
  "providerMessageId" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "newsletter_pending_webhooks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_pending_webhooks_provider_event_id_key"
  ON "newsletter_pending_webhooks"("providerEventId");

CREATE INDEX IF NOT EXISTS "newsletter_pending_webhooks_provider_message_id_idx"
  ON "newsletter_pending_webhooks"("providerMessageId");

CREATE TABLE IF NOT EXISTS "newsletter_worker_locks" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "newsletter_worker_locks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "newsletter_rate_buckets" (
  "id" TEXT NOT NULL,
  "windowStartedAt" TIMESTAMP(3) NOT NULL,
  "sentCount" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "newsletter_rate_buckets_pkey" PRIMARY KEY ("id")
);
