import { SignInReqDto } from 'src/auth/dto/req.dto';
import { SignUpReqDto } from './dto/req.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { UserRepository } from 'src/user/user.repository';
import { User, UserSchema } from 'src/schema/user/user';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MongodbHelper } from 'src/helper/mongodbHelper';

dotenv.config();

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let cacheManager: Cache;

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
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterAll(async () => {
    await MongodbHelper.stop();
  });

  afterEach(async () => {
    await userRepository.deleteAll();
    await cacheManager.reset();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(cacheManager).toBeDefined();
  });

  describe('Sign Up Logic Test', () => {
    it('should be defined', () => {
      expect(service.signUp).toBeDefined();
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
        const result = await service.signUp(signUpReqDto);

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
      expect(service.createAccessToken).toBeDefined();
      expect(service.createRefreshToken).toBeDefined();
      expect(service.saveRefreshToken).toBeDefined();
    });

    describe('validate method test', () => {
      it('should return user when password is matched', async () => {
        const signupResult = await service.signUp(signUpReqDto);

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
        await service.signUp(signUpReqDto);

        expect(
          service.validateUser(user.email, 'Password1234@'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw an error when bcrypt compare failed', async () => {
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => {
          throw new Error();
        });

        await service.signUp(signUpReqDto);

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

    describe('createRefreshToken method test', () => {
      it('should return refresh token', async () => {
        const result = await service.createRefreshToken();

        expect(result).toBeDefined();
      });

      it('should throw an error when jwt sign failed', async () => {
        jest.spyOn(jwtService, 'sign').mockImplementationOnce(() => {
          throw new Error();
        });

        expect(service.createRefreshToken()).rejects.toThrow();
      });
    });

    describe('saveRefreshToken method test', () => {
      it('should save refresh token', async () => {
        const refreshToken = await service.createRefreshToken();

        const result = await service.saveRefreshToken(user.email, refreshToken);

        expect(result).toBeUndefined();
      });

      it('should throw an error when the same refreshToken is saved in redis', async () => {
        const refreshToken = await service.createRefreshToken();

        await cacheManager.set(refreshToken, user.email);

        expect(
          service.saveRefreshToken(user.email, refreshToken),
        ).rejects.toThrow();
      });

      it('should throw an error when redis set failed', async () => {
        const refreshToken = await service.createRefreshToken();

        jest.spyOn(cacheManager, 'set').mockImplementationOnce(() => {
          throw new Error();
        });

        expect(
          service.saveRefreshToken(user.email, refreshToken),
        ).rejects.toThrow();
      });
    });

    describe('signIn method test', () => {
      const signInReqDto = new SignInReqDto();
      const signUpReqDto = new SignUpReqDto();

      beforeEach(() => {
        signInReqDto.email = user.email;
        signInReqDto.password = user.password;

        signUpReqDto.name = user.name;
        signUpReqDto.email = user.email;
        signUpReqDto.password = user.password;
        signUpReqDto.passwordConfirmation = user.password;
      });

      it('should return access token and refresh token', async () => {
        await service.signUp(signUpReqDto);

        const validUser = await service.validateUser(
          signInReqDto.email,
          signInReqDto.password,
        );

        const result = await service.signIn(validUser);

        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });
    });
  });

  describe('Sign Out Logic Test', () => {
    let user = new User();
    let accessToken;
    let refreshToken;

    beforeAll(async () => {
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'Password1234!';

      accessToken = await service.createAccessToken(user);
      refreshToken = await service.createRefreshToken();
    });

    it('should be defined', () => {
      expect(service.signOut).toBeDefined();
      expect(service.saveAccessTokenInBlackList).toBeDefined();
      expect(service.removeRefreshToken).toBeDefined();
    });

    describe('saveAccessTokenInBlackList method test', () => {
      it('should save access token in redis', async () => {
        const result = await service.saveAccessTokenInBlackList(accessToken);

        expect(result).toBeUndefined();
      });

      it('should throw an error when redis set failed', async () => {
        jest.spyOn(cacheManager, 'set').mockImplementationOnce(() => {
          throw new Error();
        });

        expect(
          service.saveAccessTokenInBlackList(accessToken),
        ).rejects.toThrow();
      });
    });

    describe('removeRefreshToken method test', () => {
      it('should remove refresh token in redis', async () => {
        const result = await service.removeRefreshToken(refreshToken);

        expect(result).toBeUndefined();
      });

      it('should throw an error when redis del failed', async () => {
        jest.spyOn(cacheManager, 'del').mockImplementationOnce(() => {
          throw new Error();
        });

        expect(service.removeRefreshToken(refreshToken)).rejects.toThrow();
      });
    });

    describe('validateAccessToken method test', () => {
      it('should throw an error when access token is not provided', async () => {
        expect(service.validateAccessToken(null)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('validateRefreshToken method test', () => {
      it('should throw an error when refresh token is not provided', async () => {
        expect(service.validateRefreshToken(null)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('signOut method test', () => {
      it('should sign out', async () => {
        await service.signOut(accessToken, refreshToken);

        const isAccessTokenInBlackList = await service.isAccessTokenInBlackList(
          accessToken,
        );

        expect(isAccessTokenInBlackList).toBeTruthy();
      });
    });
  });

  describe('Delete User Logic Test', () => {
    it('should be defined', () => {
      expect(service.deleteUser).toBeDefined();
    });

    describe('deleteUser method test', () => {
      const user = new User();

      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'Password1234!';

      it('should delete user', async () => {
        await userRepository.create(user);

        const deletedUser = await service.deleteUser(user.email);

        expect(deletedUser).toBeDefined();
      });
    });
  });
});
