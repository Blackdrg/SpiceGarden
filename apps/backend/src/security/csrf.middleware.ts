import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export function csrfProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    const ignoredMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (ignoredMethods.includes(req.method)) {
      return next();
    }

    const ignoredPaths = ['/api/webhook', '/payments/webhook'];
    if (ignoredPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const csrfTokenHeader = 'x-csrf-token';
    const csrfTokenCookie = '_csrf';

    const tokenFromHeader = req.headers[csrfTokenHeader] as string | undefined;
    const tokenFromCookie = req.cookies?.[csrfTokenCookie];

    if (process.env.NODE_ENV === 'production') {
      if (!tokenFromHeader && !tokenFromCookie) {
        return res.status(403).json({ error: 'CSRF token missing' });
      }
    }

    res.header('X-CSRF-Token', tokenFromHeader || tokenFromCookie || generateCsrfToken());
    next();
  };
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('base64');
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    csrfProtection()(req, res, next);
  }
}