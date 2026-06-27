import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export function csrfProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    const ignoredMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (ignoredMethods.includes(req.method)) {
      return next();
    }

    const ignoredPaths = ['/api/webhook', '/payments/webhook', '/auth/login', '/auth/register'];
    if (ignoredPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const csrfTokenHeader = 'x-csrf-token';
    const csrfTokenCookie = '_csrf';

    const tokenFromHeader = req.headers[csrfTokenHeader] as string | undefined;
    const tokenFromCookie = req.cookies?.[csrfTokenCookie];

    if (process.env.NODE_ENV === 'production') {
      if (!tokenFromHeader || !tokenFromCookie) {
        return res.status(403).json({ error: 'CSRF token missing' });
      }
      if (tokenFromHeader !== tokenFromCookie) {
        return res.status(403).json({ error: 'CSRF token mismatch' });
      }
      try {
        const decoded = JSON.parse(Buffer.from(tokenFromHeader.split('.')[1], 'base64').toString());
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          return res.status(403).json({ error: 'CSRF token expired' });
        }
      } catch {
        if (tokenFromHeader.length < 32 || !/^[a-zA-Z0-9+/=]+$/.test(tokenFromHeader)) {
          return res.status(403).json({ error: 'CSRF token invalid format' });
        }
      }
    }

    const csrfToken = tokenFromHeader || generateCsrfToken();
    res.cookie(csrfTokenCookie, csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.header('X-CSRF-Token', csrfToken);
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