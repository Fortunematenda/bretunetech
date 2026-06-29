const BOT_PATTERN = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|linkedinbot|twitterbot|crawler|spider|bot\b/i;

export function isBot(): boolean {
  if (typeof navigator === 'undefined') return true;
  return BOT_PATTERN.test(navigator.userAgent);
}
