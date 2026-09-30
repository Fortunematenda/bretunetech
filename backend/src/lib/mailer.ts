import { promises as dns } from 'dns';
import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import { logger } from './logger';

const log = logger.child('Mailer');

const smtpHost = process.env.SMTP_HOST || 'cp69.domains.co.za';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

const smtpTransport = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: (process.env.SMTP_USER || 'sales@bretunetech.com').replace(/^"|"$/g, ''),
    pass: process.env.SMTP_PASS,
  },
});

function connectionFailed(error: { code?: string; message?: string }): boolean {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return ['ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', 'EDNS'].includes(code)
    || /timeout|ECONN|ENOTFOUND|getaddrinfo|socket/i.test(message);
}

function recipientDomain(to: SendMailOptions['to']): string | null {
  const first = Array.isArray(to) ? to[0] : to;
  const text = typeof first === 'string'
    ? first
    : first && typeof first === 'object' && 'address' in first
      ? String(first.address)
      : '';
  const match = text.match(/@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
  return match ? match[1].toLowerCase() : null;
}

async function sendDirect(options: SendMailOptions) {
  const domain = recipientDomain(options.to);
  if (!domain) throw new Error('No recipient domain for direct delivery');
  const records = await dns.resolveMx(domain);
  records.sort((a, b) => a.priority - b.priority);
  const host = records[0]?.exchange;
  if (!host) throw new Error(`No MX for ${domain}`);
  const direct = nodemailer.createTransport({
    host,
    port: 25,
    secure: false,
    name: 'bretunetech.com',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  log.warn('Mailbox server unreachable, delivering via recipient MX', { domain, mx: host });
  return direct.sendMail(options);
}

export async function sendMail(options: SendMailOptions) {
  try {
    return await smtpTransport.sendMail(options);
  } catch (error: any) {
    if (!connectionFailed(error)) throw error;
    log.warn('Authenticated SMTP failed, trying direct delivery', {
      code: error?.code,
      message: error?.message,
    });
    return sendDirect(options);
  }
}

export const mailer = { sendMail };
