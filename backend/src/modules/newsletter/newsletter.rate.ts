/** In-process send rate limiter for the newsletter worker. */

let windowStartedAt = 0;
let sentInWindow = 0;

export function resetNewsletterRateLimiterForTests() {
  windowStartedAt = 0;
  sentInWindow = 0;
}

export function canSendWithinRate(ratePerMinute: number, now = Date.now()): boolean {
  if (now - windowStartedAt >= 60_000) {
    windowStartedAt = now;
    sentInWindow = 0;
  }
  return sentInWindow < ratePerMinute;
}

export function recordSendInRateWindow(now = Date.now()) {
  if (now - windowStartedAt >= 60_000) {
    windowStartedAt = now;
    sentInWindow = 0;
  }
  sentInWindow += 1;
}

export function msUntilRateWindowReset(now = Date.now()): number {
  if (!windowStartedAt) return 0;
  return Math.max(0, 60_000 - (now - windowStartedAt));
}
