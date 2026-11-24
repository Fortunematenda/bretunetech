/**
 * Controlled single-recipient newsletter test send (ops).
 * Does NOT enable worker/sending. Uses force + X-Newsletter-Test.
 *
 * Run (from backend/):
 *   npx ts-node --transpile-only src/scripts/controlled-newsletter-test-send.ts <campaignId> <email>
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { newsletterService } from '../modules/newsletter/newsletter.service';

async function main() {
  const campaignId = process.argv[2];
  const to = process.argv[3];
  if (!campaignId || !to || !to.includes('@')) {
    throw new Error('Usage: ts-node controlled-newsletter-test-send.ts <campaignId> <email>');
  }

  const sendFlag = String(process.env.NEWSLETTER_SENDING_ENABLED || '').toLowerCase();
  const workerFlag = String(process.env.NEWSLETTER_WORKER_ENABLED || '').toLowerCase();
  console.log('preflight_sending=' + sendFlag);
  console.log('preflight_worker=' + workerFlag);
  console.log('preflight_provider=' + (process.env.NEWSLETTER_PROVIDER || ''));
  if (workerFlag === 'true') {
    throw new Error('Abort: NEWSLETTER_WORKER_ENABLED is true — refuse test send while worker is on');
  }

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error('Campaign not found: ' + campaignId);
  console.log('campaign_status=' + campaign.status);
  console.log('campaign_subject=' + campaign.subject);
  if (campaign.status !== 'DRAFT') {
    throw new Error('Abort: campaign must be DRAFT for controlled test (got ' + campaign.status + ')');
  }

  const concern = await prisma.newsletterCampaign.count({
    where: { status: { in: ['APPROVED', 'SCHEDULED', 'SENDING'] } },
  });
  console.log('concern_campaigns=' + concern);
  if (concern > 0) {
    throw new Error('Abort: found campaigns that could auto-dispatch — revert them first');
  }

  const pendingRecipients = await prisma.newsletterRecipient.count({
    where: { status: { in: ['QUEUED', 'DISPATCHING', 'PENDING'] } },
  });
  console.log('pending_recipients=' + pendingRecipients);
  if (pendingRecipients > 0) {
    throw new Error('Abort: pending/queued recipients exist');
  }

  console.log('sending_to=' + to.trim().toLowerCase());
  console.log('campaign_id=' + campaignId);
  const started = Date.now();
  const result = await newsletterService.sendTest(campaignId, to.trim());
  console.log('send_result=' + JSON.stringify(result));
  console.log('elapsed_ms=' + (Date.now() - started));

  const concernAfter = await prisma.newsletterCampaign.count({
    where: { status: { in: ['APPROVED', 'SCHEDULED', 'SENDING'] } },
  });
  console.log('concern_campaigns_after=' + concernAfter);
  console.log('TEST_SEND_OK');
}

main()
  .catch((err) => {
    console.error('TEST_SEND_FAIL=' + (err && err.message ? err.message : String(err)));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
