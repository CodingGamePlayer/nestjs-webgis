import { SignUpReqDto } from './dto/req.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { UserRepository } from 'src/user/user.repository';
import { AuthModule } from './auth.module';
import { AppModule } from 'src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { User, UserSchema } from 'src/schema/user/user';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-store';
import { UserModule } from 'src/user/user.module';

dotenv.config();

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: 'testScretKey',
          signOptions: { expiresIn: '1d' },
        }),
        CacheModule.register(),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [AuthService, UserRepository],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Sign Up Logic Test', () => {
    it('should be defined', () => {
      expect(service.create).toBeDefined();
      expect(service.validateNewUser).toBeDefined();
    });

    describe('validateNewUser', () => {
      const signUpReqDto = new SignUpReqDto();

      beforeEach(() => {
        signUpReqDto.name = 'test';
        signUpReqDto.email = 'test@test.com';
        signUpReqDto.password = 'Password1234!';
        signUpReqDto.passwordConfirmation = 'Password1234!';
      });

      it('should return true', async () => {
        const result = await service.validateNewUser(signUpReqDto);

        expect(result).toBeUndefined();
      });

      it('should throw an 400 error when password is not matched', async () => {
        signUpReqDto.passwordConfirmation = 'Password1234@';

        try {
          await service.validateNewUser(signUpReqDto);
        } catch (error) {
          expect(error.status).toBe(400);
        }
      });

      it('should throw an 400 error when user already exists', async () => {
        await userRepository.create(signUpReqDto);

        try {
          await service.validateNewUser(signUpReqDto);
        } catch (error) {
          console.log(error);

          expect(error.status).toBe(400);
        }

        await userRepository.deleteByEmail(signUpReqDto.email);
      });
    });
  });
});
