import { AuthService } from './auth.service';
import { UserRepository } from 'src/user/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SignInReqDto, SignUpReqDto } from './dto/req.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mock } from 'node:test';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let authService: AuthService;

  const mockCacheManager = {
    set: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
      .compile();

    userRepository = moduleFixture.get<UserRepository>(UserRepository);
    authService = moduleFixture.get<AuthService>(AuthService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/auth/v1/signup (POST)', () => {
    let user = new SignUpReqDto();

    beforeEach(async () => {
      await userRepository.deleteAll();

      (user.name = 'John Doe'),
        (user.email = 'john.doe1212@example.com'),
        (user.password = 'Securepassword1'),
        (user.passwordConfirmation = 'Securepassword1');
    });

    it('should be succesed with 201', () => {
      return request(app.getHttpServer())
        .post('/auth/v1/signup')
        .send(user)
        .expect(201);
    });

    it('should be failed with 400 when password is not matched', () => {
      user.password = 'Securepassword2';

      return request(app.getHttpServer())
        .post('/auth/v1/signup')
        .send(user)
        .expect(400);
    });

    it('should be failed with 400 when passwordConfirmation is not matched', () => {
      user.passwordConfirmation = 'Securepassword2';

      return request(app.getHttpServer())
        .post('/auth/v1/signup')
        .send(user)
        .expect(400);
    });

    it("should be failed with 400 when email isn't valid", () => {
      request(app.getHttpServer()).post('/auth/v1/signup').send(user);

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it("should be failed with 400 when email isn't valid", () => {
      user.email = 'test?@email.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it("should be failed with 400 when email isn't valid", () => {
      user.email = 'test=@email.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it("should be failed with 400 when email isn't valid", () => {
      user.email = 'testemail.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it('should be failed with 400 when email is empty', () => {
      user.email = '';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it('should be failed with 400 when password is empty', () => {
      user.password = '';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it('should be failed with 400 when passwod is not valid', () => {
      user.password = 'password123!';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it('should be failed with 400 when passwod is not valid', () => {
      user.password = 'Password1234';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it('should be failed with 400 when passwod is not valid', () => {
      user.password = 'password!';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });

    it('should be failed with 400 when name is empty', () => {
      user.name = '';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(user)
        .expect(400);
    });
  });

  describe('/auth/v1/signin (POST)', () => {
    let user = new SignUpReqDto();
    let signInUser = new SignInReqDto();

    beforeEach(async () => {
      await userRepository.deleteAll();

      user.name = 'John Doe';
      user.email = 'john.doe1212@example.com';
      user.password = 'Securepassword1';
      user.passwordConfirmation = 'Securepassword1';

      await authService.signUp(user);

      signInUser.email = user.email;
      signInUser.password = user.password;

      mockCacheManager.set.mockReturnValueOnce(true);
    });

    it('should be succesed with 200', () => {
      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(200);
    });

    it("should be failed with 400 when email isn't valid", () => {
      signInUser.email = 'testemail.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it("should be failed with 400 when email isn't valid", () => {
      signInUser.email = 'test!@email.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it("should be failed with 400 when email isn't valid", () => {
      signInUser.email = 'test=@email.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it("should be failed with 400 when email isn't valid", () => {
      signInUser.email = 'test>@email.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it('should be failed with 400 when email is empty', () => {
      signInUser.email = '';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it('should be failed with 400 when password is empty', () => {
      signInUser.password = '';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it('should be failed with 400 when password is not valid', () => {
      signInUser.password = 'password123!';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it('should be failed with 400 when password is not valid', () => {
      signInUser.password = 'Password1234';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it('should be failed with 400 when password is not valid', () => {
      signInUser.password = 'password!';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it('should be failed with 400 when email is not registered', () => {
      signInUser.email = 'test1@email.com';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });

    it('should be failed with 400 when password is not matched', () => {
      signInUser.password = 'Securepassword2';

      return request(app.getHttpServer())
        .post('/auth/v1/signin')
        .send(signInUser)
        .expect(400);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
