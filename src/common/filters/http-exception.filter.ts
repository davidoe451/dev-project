import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || resObj.error || exception.message;
      }
    } else if (exception && typeof exception === 'object' && 'code' in exception) {
      const prismaCode = (exception as any).code;
      if (prismaCode === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this unique value already exists';
      } else if (prismaCode === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced record was not found';
      } else if (prismaCode === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Requested record was not found';
      } else {
        this.logger.error(`Database Error (${prismaCode}): ${(exception as any).message}`);
        message = 'Database operation failed';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    const formattedMessage = Array.isArray(message) ? message.join(', ') : message;

    response.status(status).json({
      success: false,
      data: null,
      message: formattedMessage,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
