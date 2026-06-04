type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  meta?: Record<string, any>;
}

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      meta,
    };

    const prefix = this.context ? `[${this.context}]` : '';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

    switch (level) {
      case 'error':
        console.error(`❌ ${prefix} ${message}${metaStr}`);
        break;
      case 'warn':
        console.warn(`⚠️ ${prefix} ${message}${metaStr}`);
        break;
      case 'debug':
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`🔍 ${prefix} ${message}${metaStr}`);
        }
        break;
      default:
        console.log(`ℹ️ ${prefix} ${message}${metaStr}`);
    }

    return entry;
  }

  info(message: string, meta?: Record<string, any>) {
    return this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    return this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    return this.log('error', message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    return this.log('debug', message, meta);
  }

  child(context: string): Logger {
    return new Logger(`${this.context ? this.context + ':' : ''}${context}`);
  }
}

export const logger = new Logger('VoltNet');
export default Logger;
