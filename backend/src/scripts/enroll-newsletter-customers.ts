/**
 * Subscribe every customer account that has not unsubscribed.
 * npm run newsletter:enroll-customers
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { newsletterService } from '../modules/newsletter/newsletter.service';

async function main() {
  const summary = await newsletterService.enrollAllCustomers();
  console.log(
    `Customers ${summary.total}: enrolled ${summary.enrolled}, already active ${summary.already}, skipped (unsubscribed/suppressed) ${summary.skipped}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());