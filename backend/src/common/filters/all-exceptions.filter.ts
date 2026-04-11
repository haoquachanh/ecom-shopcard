import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawResponse = isHttp ? exception.getResponse() : null;
    const message =
      typeof rawResponse === 'string'
        ? rawResponse
        : (rawResponse as any)?.message || 'Internal server error';

    const code =
      typeof rawResponse === 'object' && (rawResponse as any)?.code
        ? (rawResponse as any).code
        : status >= 500
          ? 'INTERNAL_SERVER_ERROR'
          : 'HTTP_ERROR';

    const details =
      typeof rawResponse === 'object' && (rawResponse as any)?.details
        ? (rawResponse as any).details
        : undefined;

    this.logger.error({
      message: 'Request failed',
      status,
      method: request.method,
      url: request.url,
      requestId: request.requestId,
      error: exception instanceof Error ? exception.stack : exception,
    });

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.requestId,
    });
  }
}
