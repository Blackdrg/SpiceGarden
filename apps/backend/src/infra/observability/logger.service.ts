import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { sanitizeForLog } from '../../logging/logging.service';

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    console.error(JSON.stringify({
      level: 'error',
      message: sanitizeForLog(message),
      error: sanitizeForLog(optionalParams[0]),
      context: this.context,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    console.warn(JSON.stringify({
      level: 'warn',
      message: sanitizeForLog(message),
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }

  debug?(message: unknown, ...optionalParams: unknown[]) {
    console.debug(JSON.stringify({
      level: 'debug',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }

  verbose?(message: unknown, ...optionalParams: unknown[]) {
    console.log(JSON.stringify({
      level: 'verbose',
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...optionalParams,
    }));
  }
}
