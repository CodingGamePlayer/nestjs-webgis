import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { AppModule } from 'src/app.module';
import { User, UserSchema } from 'src/schema/user/user';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { PageResDto } from './dto/res.dto';
import { UserRepository } from './user.repository';
import { UserRole } from 'src/enums/user-role';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbHelper } from 'src/helper/mongodbHelper';
import { UpdateUserReqDto } from './dto/req.dto';

describe('UserService', () => {
  let service: UserService;
  let authService: AuthService;
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
      providers: [UserService, AuthService, UserRepository],
    }).compile();

    service = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await MongodbHelper.stop();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(authService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('findOneById', () => {
    const user = new User();
    let accessToken: string;
    user.name = 'test';
    user.email = 'test@email.com';
    user.password = 'testPassword!123';
    user.company = 'testCompany';
    user.role = UserRole.USER;

    beforeAll(async () => {
      const createdUser = await userRepository.create(user);

      accessToken = await authService.createAccessToken(createdUser);
    });

    beforeEach(async () => {
      await userRepository.deleteAll();
    });

    it('should return a user', async () => {
      await userRepository.create(user);

      const result = await service.findOneByEmail(accessToken);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(PageResDto);
      expect(result.name).toBe(user.name);
    });

    it('should throw an error if jwtService.verifyAsync throws an error', async () => {
      jest
        .spyOn(authService, 'decodeAccessToken')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      await expect(service.findOneByEmail(accessToken)).rejects.toThrow();
    });
  });

  describe('modifyProfile', () => {
    const user = new User();
    let accessToken: string;
    user.name = 'test';
    user.email = 'test@email.com';
    user.password = 'testPassword!123';
    user.company = 'testCompany';
    user.role = UserRole.USER;

    const updateUserReqDto = new UpdateUserReqDto();

    updateUserReqDto.email = 'test@email.com';
    updateUserReqDto.name = 'modifiedName';
    updateUserReqDto.company = 'modifiedCompany';

    beforeAll(async () => {
      const createdUser = await userRepository.create(user);

      accessToken = await authService.createAccessToken(createdUser);
    });

    beforeEach(async () => {
      await userRepository.deleteAll();
    });

    it('should return a updated user', async () => {
      await userRepository.create(user);

      const result = await service.updateProfile(accessToken, updateUserReqDto);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(PageResDto);
      expect(result.name).toBe(updateUserReqDto.name);
    });

    it('should throw an error if jwtService.verifyAsync throws an error', async () => {
      await expect(
        service.updateProfile('', updateUserReqDto),
      ).rejects.toThrow();
    });

    describe('updateUser', () => {
      it('should return a updated user', () => {
        const result = service.updateUser(user, updateUserReqDto);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(User);
        expect(result.name).toBe(updateUserReqDto.name);
      });
    });
  });
});
