-- Track first dispatch for Resend idempotency window enforcement
ALTER TABLE "newsletter_recipients"
  ADD COLUMN IF NOT EXISTS "firstDispatchedAt" TIMESTAMP(3);
