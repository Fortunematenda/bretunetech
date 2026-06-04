import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 attempts per minute (very lenient for testing)
  message: { error: 'Too many authentication attempts, please try again in 1 minute', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 registrations per IP per minute (very lenient for testing)
  message: { error: 'Too many registration attempts, please try again in 1 minute', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many requests, please slow down', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});
