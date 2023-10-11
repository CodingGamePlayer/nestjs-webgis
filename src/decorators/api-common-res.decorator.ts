import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({ status: 400, description: 'BadRequestException' }),
    ApiResponse({ status: 401, description: 'UnauthorizedException' }),
    ApiResponse({ status: 403, description: 'ForbiddenException' }),
    ApiResponse({ status: 500, description: 'InternalServerException' }),
  );
}

export function ApiAuthCommonResponses() {
  return applyDecorators(
    ApiResponse({ status: 400, description: 'BadRequestException' }),
    ApiResponse({ status: 500, description: 'InternalServerException' }),
  );
}
