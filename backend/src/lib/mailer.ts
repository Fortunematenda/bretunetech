import fs from 'fs';
import path from 'path';
import tls from 'tls';
import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { logger } from './logger';

const log = logger.child('Mailer');

const primaryHost = process.env.SMTP_HOST || 'cp69.domains.co.za';
const primaryPort = parseInt(process.env.SMTP_PORT || '465', 10);
const relayHost = 'mx1.tld-mx.com';
const relayIp = '169.239.219.2';

let primaryDownUntil = 0;
let relayDownUntil = 0;

function fileCredentials(): { user: string; pass: string } {
  const fromProcess = {
    user: (process.env.SMTP_USER || 'sales@bretunetech.com').replace(/^"|"$/g, ''),
    pass: process.env.SMTP_PASS || '',
  };
  try {
    const file = path.resolve(process.cwd(), '.env');
    const env: Record<string, string> = {};
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
    return {
      user: env.SMTP_USER || fromProcess.user,
      pass: env.SMTP_PASS || fromProcess.pass,
    };
  } catch {
    return fromProcess;
  }
}

function connectionFailed(error: { code?: string; message?: string }): boolean {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return ['ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', 'EDNS'].includes(code)
    || /timeout|ECONN|ENOTFOUND|getaddrinfo|socket/i.test(message);
}

function addressOnly(value: SendMailOptions['from'] | SendMailOptions['to']): string {
  const first = Array.isArray(value) ? value[0] : value;
  const text = typeof first === 'string'
    ? first
    : first && typeof first === 'object' && 'address' in first
      ? String(first.address)
      : '';
  const match = text.match(/<([^>]+)>/);
  return (match ? match[1] : text).trim();
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

class SmtpSession {
  private buffer = '';
  private waiters: Array<(line: string) => void> = [];

  constructor(private socket: tls.TLSSocket) {
    socket.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString('utf8');
      this.flush();
    });
  }

  private flush() {
    while (this.waiters.length) {
      const match = this.buffer.match(/((?:.*\r\n)*?\d{3} .*\r\n)/);
      if (!match) return;
      const reply = match[1];
      this.buffer = this.buffer.slice(reply.length);
      const waiter = this.waiters.shift();
      waiter?.(reply.trim());
    }
  }

  read(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Object.assign(new Error('SMTP reply timed out'), { code: 'ETIMEDOUT' })), 8000);
      this.waiters.push((line) => {
        clearTimeout(timer);
        resolve(line);
      });
      this.flush();
      this.socket.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  async command(line: string): Promise<string> {
    this.socket.write(line + '\r\n');
    return this.read();
  }
}

async function sendViaRelay(options: SendMailOptions): Promise<SMTPTransport.SentMessageInfo> {
  const { user, pass } = fileCredentials();
  const from = addressOnly(options.from) || user;
  const to = addressOnly(options.to);
  if (!to) throw new Error('No recipient for relay delivery');

  const socket = tls.connect({
    host: relayIp,
    port: 465,
    servername: relayHost,
    timeout: 8000,
  });
  const session = new SmtpSession(socket);
  await new Promise<void>((resolve, reject) => {
    socket.once('secureConnect', () => resolve());
    socket.once('error', reject);
  });
  try {
    const banner = await session.read();
    if (!banner.startsWith('220')) throw new Error(banner);
    const ehlo = await session.command('EHLO bretunetech.com');
    if (!ehlo.startsWith('250')) throw new Error(ehlo);

    const plain = Buffer.from(`\0${user}\0${pass}`, 'utf8').toString('base64');
    let auth = await session.command(`AUTH PLAIN ${plain}`);
    if (auth.startsWith('503')) {
      relayDownUntil = Date.now() + 15 * 60 * 1000;
      throw new Error(auth);
    }
    if (!auth.startsWith('235')) {
      const login = await session.command('AUTH LOGIN');
      if (login.startsWith('503')) {
        relayDownUntil = Date.now() + 15 * 60 * 1000;
        throw new Error(login);
      }
      if (!login.startsWith('334')) throw new Error(login);
      const userReply = await session.command(Buffer.from(user, 'utf8').toString('base64'));
      if (!userReply.startsWith('334')) throw new Error(userReply);
      auth = await session.command(Buffer.from(pass, 'utf8').toString('base64'));
      if (auth.startsWith('503')) relayDownUntil = Date.now() + 15 * 60 * 1000;
      if (!auth.startsWith('235')) throw new Error(auth);
    }

    const mailFrom = await session.command(`MAIL FROM:<${from}>`);
    if (!mailFrom.startsWith('250')) throw new Error(mailFrom);
    const rcpt = await session.command(`RCPT TO:<${to}>`);
    if (!rcpt.startsWith('250')) throw new Error(rcpt);
    const data = await session.command('DATA');
    if (!data.startsWith('354')) throw new Error(data);

    const subject = String(options.subject || '');
    const body = String(options.html || options.text || '');
    const contentType = options.html ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
    const payload = [
      `From: ${options.from || from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: ${contentType}`,
      '',
      body,
    ].join('\r\n').replace(/^\./gm, '..');
    const accepted = await session.command(`${payload}\r\n.`);
    if (!accepted.startsWith('250')) throw new Error(accepted);
    await session.command('QUIT');
    log.warn('Sent mail through backup relay', { host: relayHost, port: 465 });
    return {
      accepted: [to],
      rejected: [],
      response: accepted,
      envelope: { from, to: [to] },
      messageId: '',
    } as SMTPTransport.SentMessageInfo;
  } finally {
    socket.end();
  }
}

async function sendViaPrimary(options: SendMailOptions): Promise<SMTPTransport.SentMessageInfo> {
  const { user, pass } = fileCredentials();
  const transport = nodemailer.createTransport({
    host: primaryHost,
    port: primaryPort,
    secure: primaryPort === 465,
    family: 4,
    name: 'bretunetech.com',
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 8000,
    auth: { user, pass },
  } as SMTPTransport.Options);
  try {
    return await withTimeout(transport.sendMail(options), 8000, primaryHost);
  } finally {
    transport.close();
  }
}

export async function sendMail(options: SendMailOptions): Promise<SMTPTransport.SentMessageInfo> {
  if (Date.now() < relayDownUntil && Date.now() < primaryDownUntil) {
    throw new Error('Mail server temporarily refused login. Try again in 15 minutes.');
  }
  if (Date.now() >= primaryDownUntil) {
    try {
      return await sendViaPrimary(options);
    } catch (error: any) {
      log.warn('Mail relay failed', {
        host: primaryHost,
        port: primaryPort,
        code: error?.code,
        message: error?.message,
      });
      if (connectionFailed(error)) primaryDownUntil = Date.now() + 10 * 60 * 1000;
    }
  }
  if (Date.now() < relayDownUntil) {
    throw new Error('Mail server temporarily refused login. Try again in 15 minutes.');
  }
  return sendViaRelay(options);
}

export const mailer = { sendMail };
