import { Module, UseGuards } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { DataModule } from './data/data.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      useFactory: async (
        configService: ConfigService,
      ): Promise<CacheModuleOptions> => {
        return {
          store: redisStore as any,
          url: `redis://${configService.get<string>(
            'REDIS_HOST',
          )}:${configService.get<string>('REDIS_PORT')}`,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGO_URI'),
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.register(),
    AuthModule,
    UserModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
