import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userRository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    const accessToken = authorization?.split(' ')[1];
    const user = this.jwtService.decode(accessToken);

    const isUser = await this.userRository.findOneByEmail(user['email']);

    return requiredRoles.some((role) => isUser['role'].includes(role));
  }
}
