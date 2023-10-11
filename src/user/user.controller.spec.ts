import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserModule } from './user.module';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';

describe('UserController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});
