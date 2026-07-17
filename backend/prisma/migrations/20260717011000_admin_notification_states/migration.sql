CREATE TABLE IF NOT EXISTS "admin_notification_states" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_notification_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_notification_states_userId_sourceKey_key"
  ON "admin_notification_states"("userId", "sourceKey");
CREATE INDEX IF NOT EXISTS "admin_notification_states_userId_idx"
  ON "admin_notification_states"("userId");

DO $$ BEGIN
  ALTER TABLE "admin_notification_states"
    ADD CONSTRAINT "admin_notification_states_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
