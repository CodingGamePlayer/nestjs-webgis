import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorType = exception.name;
    const errorResponse = exception.getResponse();

    let firstMessage: unknown = 'An error occurred';

    if (typeof errorResponse === 'object' && 'message' in errorResponse) {
      const messageField = errorResponse['message'];
      if (Array.isArray(messageField)) {
        firstMessage = messageField[0];
      } else {
        firstMessage = messageField;
      }
    }

    let atLocation: unknown = 'N/A';

    if (typeof errorResponse === 'object' && 'at' in errorResponse) {
      atLocation = errorResponse['at'];
    }

    if (status < 500) {
      this.logger.log(
        `Status: ${status}, ${errorType}: ${firstMessage}, At: ${atLocation}, Method: ${request.method}, URL: ${request.url}`,
      );
    } else {
      this.logger.error(
        `Status: ${status}, ${errorType}: ${firstMessage}, At: ${atLocation}, Method: ${request.method}, URL: ${request.url}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
