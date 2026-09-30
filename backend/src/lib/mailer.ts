import { promises as dns } from 'dns';
import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { logger } from './logger';

const log = logger.child('Mailer');

const smtpUser = (process.env.SMTP_USER || 'sales@bretunetech.com').replace(/^"|"$/g, '');
const smtpPass = process.env.SMTP_PASS;
const primaryHost = process.env.SMTP_HOST || 'cp69.domains.co.za';
const primaryPort = parseInt(process.env.SMTP_PORT || '465', 10);

type Relay = { host: string; port: number; secure: boolean };

const relays: Relay[] = [
  { host: primaryHost, port: primaryPort, secure: primaryPort === 465 },
  { host: 'mx1.tld-mx.com', port: 465, secure: true },
  { host: 'mx2.tld-mx.com', port: 587, secure: false },
].filter((relay, index, all) =>
  all.findIndex((item) => item.host === relay.host && item.port === relay.port) === index
);

let primaryDownUntil = 0;
const preferredRelayAddress = '169.239.219.2';

async function ipv4Addresses(host: string): Promise<string[]> {
  try {
    const records = [...new Set(await dns.resolve4(host))];
    records.sort((a, b) => Number(b === preferredRelayAddress) - Number(a === preferredRelayAddress));
    return records.length ? records : [host];
  } catch {
    return [host];
  }
}

function connectionFailed(error: { code?: string; message?: string }): boolean {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return ['ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', 'EDNS'].includes(code)
    || /timeout|ECONN|ENOTFOUND|getaddrinfo|socket/i.test(message);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(`${label} timed out`);
      (error as { code?: string }).code = 'ETIMEDOUT';
      reject(error);
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function sendThrough(relay: Relay, options: SendMailOptions, address: string, authMethod?: string): Promise<SMTPTransport.SentMessageInfo> {
  const transportOptions = {
    host: relay.host,
    port: relay.port,
    secure: relay.secure,
    requireTLS: !relay.secure,
    family: 4,
    name: 'bretunetech.com',
    authMethod,
    connectionTimeout: 4000,
    greetingTimeout: 5000,
    socketTimeout: 12000,
    lookup: (_hostname: string, _options: unknown, callback: (err: NodeJS.ErrnoException | null, ip: string, family: number) => void) => {
      callback(null, address, 4);
    },
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  } as SMTPTransport.Options;
  const transport = nodemailer.createTransport(transportOptions);
  try {
    return await withTimeout(transport.sendMail(options), 12000, relay.host);
  } finally {
    transport.close();
  }
}

export async function sendMail(options: SendMailOptions): Promise<SMTPTransport.SentMessageInfo> {
  let lastError: unknown;
  for (const relay of relays) {
    const isPrimary = relay.host === primaryHost && relay.port === primaryPort;
    if (isPrimary && Date.now() < primaryDownUntil) continue;
    const addresses = await ipv4Addresses(relay.host);
    const targets = isPrimary
      ? addresses.slice(0, 1)
      : addresses.includes(preferredRelayAddress)
        ? [preferredRelayAddress]
        : addresses.slice(0, 1);
    for (const address of targets) {
      try {
        const info = await sendThrough(relay, options, address, isPrimary ? undefined : 'CRAM-MD5');
        if (!isPrimary) {
          log.warn('Sent mail through backup relay', { host: relay.host, port: relay.port });
        }
        return info;
      } catch (error: any) {
        lastError = error;
        log.warn('Mail relay failed', {
          host: relay.host,
          port: relay.port,
          code: error?.code,
          message: error?.message,
        });
        if (isPrimary && connectionFailed(error)) {
          primaryDownUntil = Date.now() + 10 * 60 * 1000;
        }
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to send email');
}

export const mailer = { sendMail };
