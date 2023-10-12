import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongodbHelper } from 'src/helper/mongodbHelper';
import { User, UserDocument, UserSchema } from 'src/schema/user/user';
import { UserRepository } from './user.repository';
import { Model } from 'mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    await MongodbHelper.start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(MongodbHelper.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UserRepository],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await MongodbHelper.stop();
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    const user = new User();

    beforeEach(async () => {
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';
      await userRepository.deleteAll();
    });

    it('should return a user', async () => {
      const createdUser = await userRepository.create(user);

      expect(createdUser).toBeDefined();
      expect(createdUser.name).toEqual(user.name);
    });

    it('should throw an error when mongoose throw an error', async () => {
      jest.spyOn(userModel, 'create').mockRejectedValueOnce(new Error());

      await expect(userRepository.create(user)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });
});
