/**
 * Dry-run audit: report how many ACTIVE legacy auto-enrolled subscribers need consent review.
 * Does not delete customers, reset suppressions, or mutate subscription rows.
 *
 * npm run newsletter:audit-consent
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { newsletterService } from '../modules/newsletter/newsletter.service';

async function main() {
  const report = await newsletterService.auditConsentDryRun();
  console.log(JSON.stringify(report, null, 2));
  console.log(
    `\nConsent review required: ${report.requireConsentReview} of ${report.legacyAutoEnrolledActive} legacy auto-enrolled ACTIVE subscribers.`,
  );
  console.log(`Eligible marketing subscribers (non-legacy): ${report.eligibleMarketingActive}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
