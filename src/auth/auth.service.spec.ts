import { SignUpReqDto } from './dto/req.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { UserRepository } from 'src/user/user.repository';
import { User, UserSchema } from 'src/schema/user/user';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MongodbHelper } from 'src/helper/mongodbHelper';

dotenv.config();

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    await MongodbHelper.start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: 'testScretKey',
          signOptions: { expiresIn: '1d' },
        }),
        CacheModule.register(),
        MongooseModule.forRoot(MongodbHelper.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [AuthService, UserRepository],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await MongodbHelper.stop();
  });

  afterEach(async () => {
    await userRepository.deleteAll();
    jest.clearAllMocks();
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

        expect(service.validateNewUser(signUpReqDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw an 400 error when user already exists', async () => {
        await userRepository.create(signUpReqDto);

        expect(service.validateNewUser(signUpReqDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('hashPassword method test', () => {
      it('should return hashed password', async () => {
        const password = 'Password1234!';
        const hashedPassword = await service.hashPassword(password);

        expect(hashedPassword).not.toEqual(password);
      });

      it('should throw an error when bcrypt hash failed', async () => {
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
          throw new Error();
        });

        const password = 'Password1234!';

        expect(service.hashPassword(password)).rejects.toThrow();
      });
    });

    describe('create method test', () => {
      const signUpReqDto = new SignUpReqDto();

      beforeEach(() => {
        signUpReqDto.name = 'test';
        signUpReqDto.email = 'test@test.com';
        signUpReqDto.password = 'Password1234!';
        signUpReqDto.passwordConfirmation = 'Password1234!';
      });

      it('should return created user', async () => {
        const result = await service.create(signUpReqDto);

        expect(result).toBeDefined();
        expect(result.name).toEqual(signUpReqDto.name);
        expect(result.email).toEqual(signUpReqDto.email);
      });
    });
  });
});
