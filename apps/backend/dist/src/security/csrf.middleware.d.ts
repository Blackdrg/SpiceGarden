import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare function csrfProtection(): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function generateCsrfToken(): string;
export declare class CsrfMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
