import { UserRepository } from 'src/user/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { User } from 'src/schema/user/user';
import { UserRole } from 'src/enums/user-role';
import { AuthService } from 'src/auth/auth.service';
import * as request from 'supertest';

describe('UserController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await userRepository.deleteAll();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('getUserById', () => {
    const user = new User();
    let accessToken: string;

    beforeEach(async () => {
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';
      user.role = UserRole.ADMIN;

      await userRepository.create(user);

      accessToken = await authService.createAccessToken(user);
    });

    afterEach(async () => {
      await userRepository.deleteAll();
    });

    it('should return a user', async () => {
      const targerUser = await userRepository.findOneByEmail(user.email);

      return request(app.getHttpServer())
        .get(`/user/v1?id=${targerUser['_id']}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return a 400 when id is invalid', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1?id=123`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return a 401 when token is invalid', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1?id=5f7c0b1b8d5f7d1d9c6c1e1d`)
        .set('Authorization', `Bearer 123`)
        .expect(401);
    });

    it('should return a 400 when user is not found', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1?id=5f7c0b1b8d5f7d1d9c6c1e1d`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('users', () => {
    let accessToken: string;

    beforeEach(async () => {
      for (let i = 0; i < 10; i++) {
        const user = new User();
        user.name = 'test' + i;
        user.email = 'test' + i + '@test.com';
        user.password = 'testPassword!123';
        user.company = 'testCompany';
        user.role = UserRole.ADMIN;

        await userRepository.create(user);

        accessToken = await authService.createAccessToken(user);
      }
    });

    afterEach(async () => {
      await userRepository.deleteAll();
    });

    it('should return a users', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1/users?page=1&limit=10`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return a 200 even though page is invalid', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1/users?page=0&limit=10`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return a 200 even though limit is invalid', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1/users?page=1&limit=0`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return a 400 when user is not found', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1/users?page=3&size=10`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('get profile', () => {
    const user = new User();
    let accessToken: string;

    beforeEach(async () => {
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';
      user.role = UserRole.ADMIN;

      await userRepository.create(user);

      accessToken = await authService.createAccessToken(user);
    });

    afterEach(async () => {
      await userRepository.deleteAll();
    });

    it('should return a user', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return a 401 when token is invalid', async () => {
      return request(app.getHttpServer())
        .get(`/user/v1/profile`)
        .set('Authorization', `Bearer 123`)
        .expect(401);
    });
  });

  describe('modifyProfile', () => {
    const user = new User();
    let accessToken: string;

    beforeEach(async () => {
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';
      user.role = UserRole.ADMIN;

      await userRepository.create(user);

      accessToken = await authService.createAccessToken(user);
    });

    afterEach(async () => {
      await userRepository.deleteAll();
    });

    it('should return a user', async () => {
      return request(app.getHttpServer())
        .patch(`/user/v1/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'modifiedName',
          company: 'modifiedCompany',
        })
        .expect(200);
    });

    it('should return a 400 when props are empty', async () => {
      return request(app.getHttpServer())
        .patch(`/user/v1/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should return a 401 when token is invalid', async () => {
      return request(app.getHttpServer())
        .patch(`/user/v1/profile`)
        .set('Authorization', `Bearer 123`)
        .expect(401);
    });
  });
});
