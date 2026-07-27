import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { sanitizeForLog } from '../../logging/logging.service';

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    const entry = JSON.stringify({
      level: 'info',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    });
    process.stdout.write(`${entry}\n`);
  }

  error(message: any, ...optionalParams: any[]) {
    const entry = JSON.stringify({
      level: 'error',
      message: sanitizeForLog(message),
      error: sanitizeForLog(optionalParams[0]),
      context: this.context,
      timestamp: new Date().toISOString(),
    });
    process.stderr.write(`${entry}\n`);
  }

  warn(message: any, ...optionalParams: any[]) {
    const entry = JSON.stringify({
      level: 'warn',
      message: sanitizeForLog(message),
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    });
    process.stdout.write(`${entry}\n`);
  }

  debug?(message: any, ...optionalParams: any[]) {
    const entry = JSON.stringify({
      level: 'debug',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    });
    process.stdout.write(`${entry}\n`);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    const entry = JSON.stringify({
      level: 'verbose',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    });
    process.stdout.write(`${entry}\n`);
  }
}
