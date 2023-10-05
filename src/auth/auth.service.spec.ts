import { SignUpReqDto } from './dto/req.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { UserRepository } from 'src/user/user.repository';
import { User, UserSchema } from 'src/schema/user/user';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MongodbHelper } from 'src/helper/mongodbHelper';

dotenv.config();

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

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
    jwtService = module.get<JwtService>(JwtService);
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
    expect(userRepository).toBeDefined();
  });

  describe('Sign Up Logic Test', () => {
    it('should be defined', () => {
      expect(service.create).toBeDefined();
      expect(service.validateNewUser).toBeDefined();
      expect(service.hashPassword).toBeDefined();
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

  describe('Sign In Logic Test', () => {
    const user = new User();
    const signUpReqDto = new SignUpReqDto();

    beforeEach(() => {
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'Password1234!';

      signUpReqDto.name = user.name;
      signUpReqDto.email = user.email;
      signUpReqDto.password = user.password;
      signUpReqDto.passwordConfirmation = user.password;
    });

    it('should be defined', () => {
      expect(service.validateUser).toBeDefined();
    });

    describe('validate method test', () => {
      it('should return user when password is matched', async () => {
        const signupResult = await service.create(signUpReqDto);

        const result = await service.validateUser(user.email, user.password);

        expect(result).toBeDefined();
        expect(result.name).toEqual(user.name);
        expect(result.email).toEqual(user.email);
      });

      it('should throw an error when user is not found', async () => {
        expect(service.validateUser(user.email, user.password)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw an error when password is not matched', async () => {
        await service.create(signUpReqDto);

        expect(
          service.validateUser(user.email, 'Password1234@'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw an error when bcrypt compare failed', async () => {
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => {
          throw new Error();
        });

        await service.create(signUpReqDto);

        expect(
          service.validateUser(user.email, 'Password1234@'),
        ).rejects.toThrow();
      });
    });

    describe('createAccessToken method test', () => {
      it('should return access token', async () => {
        const result = await service.createAccessToken(user);

        expect(result).toBeDefined();
      });

      it('should throw an error when jwt sign failed', async () => {
        jest.spyOn(jwtService, 'sign').mockImplementationOnce(() => {
          throw new Error();
        });

        expect(service.createAccessToken(user)).rejects.toThrow();
      });
    });
  });
});
