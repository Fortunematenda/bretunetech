-- Extend newsletter_templates for editable starter layouts (campaign defaults + blocks).

ALTER TABLE "newsletter_templates" ADD COLUMN "slug" TEXT;
ALTER TABLE "newsletter_templates" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "newsletter_templates" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "newsletter_templates" ADD COLUMN "subject" TEXT NOT NULL DEFAULT '';
ALTER TABLE "newsletter_templates" ADD COLUMN "previewText" TEXT NOT NULL DEFAULT '';
ALTER TABLE "newsletter_templates" ADD COLUMN "audience" JSONB NOT NULL DEFAULT '{"consentOnly":true,"activity":"all"}';

UPDATE "newsletter_templates"
SET "slug" = lower(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL AND "name" <> '';

UPDATE "newsletter_templates"
SET "slug" = "id"
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "newsletter_templates" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "newsletter_templates_slug_key" ON "newsletter_templates"("slug");