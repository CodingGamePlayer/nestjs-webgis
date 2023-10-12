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

  describe('findAll', () => {
    beforeEach(async () => {
      const user = new User();

      for (let i = 0; i < 10; i++) {
        user.name = `test${i}`;
        user.email = `test${i}@email.com`;
        user.password = 'testPassword!123';
        user.company = 'testCompany';
        await userRepository.create(user);
      }
    });

    afterEach(async () => {
      await userRepository.deleteAll();
    });

    it('should return an array of users', async () => {
      const users = await userRepository.findAll(1, 10);

      expect(users).toBeDefined();
      expect(users.length).toEqual(10);
    });

    it('should throw an error when mongoose throw an error', async () => {
      const findMock = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(new Error()),
      };

      jest
        .spyOn(userModel, 'find')
        .mockImplementationOnce(() => findMock as any);

      await expect(userRepository.findAll(1, 10)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('updateById', () => {
    const user = new User();
    let createdUser: User;

    beforeEach(async () => {
      await userRepository.deleteAll();
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';

      await userRepository.create(user);
      createdUser = await userRepository.findOneByEmail(user.email);

      createdUser.name = 'modifiedName';
    });

    it('should return a updated user', async () => {
      const updatedUser = await userRepository.updateById(
        createdUser['_id'],
        createdUser,
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser.name).toEqual(createdUser.name);
    });

    it('should throw an error when mongoose throw an error', async () => {
      const findByIdAndUpdateMock = {
        exec: jest.fn().mockRejectedValueOnce(new Error()),
      };

      jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockImplementationOnce(() => findByIdAndUpdateMock as any);

      await expect(
        userRepository.updateById(createdUser['_id'], createdUser),
      ).rejects.toThrowError(InternalServerErrorException);
    });

    it('should throw an error if id is not a valid ObjectId', async () => {
      await expect(
        userRepository.updateById('invalidId', createdUser),
      ).rejects.toThrowError(BadRequestException);
    });
  });

  describe('deleteByEmail', () => {
    const user = new User();

    beforeEach(async () => {
      await userRepository.deleteAll();
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';

      await userRepository.create(user);
    });

    it('should return a deleted user', async () => {
      const deletedUser = await userRepository.deleteByEmail(user.email);

      expect(deletedUser).toBeDefined();
      expect(deletedUser.name).toEqual(user.name);
    });

    it('should throw an error when mongoose throw an error', async () => {
      const findOneAndDeleteMock = {
        exec: jest.fn().mockRejectedValueOnce(new Error()),
      };

      jest
        .spyOn(userModel, 'findOneAndDelete')
        .mockImplementationOnce(() => findOneAndDeleteMock as any);

      await expect(
        userRepository.deleteByEmail(user.email),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('deleteById', () => {
    const user = new User();
    let savedUser: User;

    beforeEach(async () => {
      await userRepository.deleteAll();
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';

      savedUser = await userRepository.create(user);
    });

    it('should return a deleted user', async () => {
      const deletedUser = await userRepository.deleteById(savedUser['_id']);

      expect(deletedUser).toBeDefined();
      expect(deletedUser.name).toEqual(user.name);
    });

    it('should throw an error when mongoose throw an error', async () => {
      const findByIdAndDeleteMock = {
        exec: jest.fn().mockRejectedValueOnce(new Error()),
      };

      jest
        .spyOn(userModel, 'findByIdAndDelete')
        .mockImplementationOnce(() => findByIdAndDeleteMock as any);

      await expect(
        userRepository.deleteById(savedUser['_id']),
      ).rejects.toThrowError(InternalServerErrorException);
    });

    it('should throw an error if id is not a valid ObjectId', async () => {
      await expect(userRepository.deleteById('invalidId')).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('deleteAll', () => {
    beforeEach(async () => {
      const user = new User();

      for (let i = 0; i < 10; i++) {
        user.name = `test${i}`;
        user.email = `test${i}@email.com`;
        user.password = 'testPassword!123';
        user.company = 'testCompany';
        await userRepository.create(user);
      }
    });

    it('should delete all users', async () => {
      await userRepository.deleteAll();

      const users = await userRepository.findAll(1, 10);

      expect(users.length).toEqual(0);
    });

    it('should throw an error when mongoose throw an error', async () => {
      const deleteManyMock = {
        exec: jest.fn().mockRejectedValueOnce(new Error()),
      };

      jest
        .spyOn(userModel, 'deleteMany')
        .mockImplementationOnce(() => deleteManyMock as any);

      await expect(userRepository.deleteAll()).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneByEmail', () => {
    const user = new User();

    beforeEach(async () => {
      await userRepository.deleteAll();
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';
    });

    it('should return a user', async () => {
      await userRepository.create(user);

      const result = await userRepository.findOneByEmail(user.email);

      expect(result).toBeDefined();
      expect(result.name).toEqual(user.name);
    });
  });

  describe('findOneById', () => {
    const user = new User();
    let savedUser: User;

    beforeEach(async () => {
      await userRepository.deleteAll();
      user.name = 'test';
      user.email = 'test@email.com';
      user.password = 'testPassword!123';
      user.company = 'testCompany';

      savedUser = await userRepository.create(user);
    });

    it('should return a user', async () => {
      const result = await userRepository.findOneById(savedUser['_id']);

      expect(result).toBeDefined();
      expect(result.name).toEqual(user.name);
    });

    it('should throw an error when mongoose throw an error', async () => {
      const findByIdMock = {
        exec: jest.fn().mockRejectedValueOnce(new Error()),
      };

      jest
        .spyOn(userModel, 'findById')
        .mockImplementationOnce(() => findByIdMock as any);

      await expect(
        userRepository.findOneById(savedUser['_id']),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
