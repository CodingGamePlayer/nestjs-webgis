import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user/user';
import { RolesGuard } from './roles.guard';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
