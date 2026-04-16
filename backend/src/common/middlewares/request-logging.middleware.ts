import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: Request & { requestId?: string }, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.on('finish', () => {
      const latencyMs = Date.now() - startedAt;
      this.logger.log(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode} - ${latencyMs}ms`);
    });

    next();
  }
}
