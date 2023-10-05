import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/public-api.decoratpr';
import { AuthService } from './auth.service';
import { ExceptionMassage } from 'src/enums/exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token: string = this.extractTokenFromHeader(request);
    const refreshToken: string = request.headers['refreshtoken'];

    if (!token) {
      throw new UnauthorizedException({
        message: ExceptionMassage.INVALID_ACCESS_TOKEN,
        at: 'AuthGuard.canActivate',
      });
    }

    const payload = this.authService.decodeAccessToken(token);

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: ExceptionMassage.INVALID_REFRESH_TOKEN,
        at: 'AuthGuard.canActivate',
      });
    }

    const isAccessTokenInBlackList =
      await this.authService.isAccessTokenInBlackList(token);

    if (isAccessTokenInBlackList) {
      throw new UnauthorizedException({
        message: ExceptionMassage.INVALID_ACCESS_TOKEN,
        at: 'AuthGuard.canActivate',
      });
    }

    try {
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException({
        message: ExceptionMassage.INVALID_ACCESS_TOKEN,
        at: 'AuthGuard.canActivate',
      });
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
