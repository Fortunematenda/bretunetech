/**
 * Links existing CUSTOMER accounts to newsletter rows that are already ACTIVE.
 * Does not create or activate marketing subscriptions — documented consent is required.
 *
 * npm run newsletter:enroll-customers
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { newsletterService } from '../modules/newsletter/newsletter.service';

async function main() {
  const summary = await newsletterService.enrollAllCustomers();
  console.log(
    `Customers ${summary.total}: linked ${summary.linked}, skipped ${summary.skipped} (not an active marketing subscriber). Auto-enrolment is disabled.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
