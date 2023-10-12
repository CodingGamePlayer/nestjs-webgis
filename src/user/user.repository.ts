import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignInReqDto } from 'src/auth/dto/req.dto';
import { User, UserDocument } from 'src/schema/user/user';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: User): Promise<User> {
    try {
      const result = await this.userModel.create(user);

      return result;
    } catch (error) {
      if (!error.response) {
        throw new InternalServerErrorException({
          message: error.message,
          at: 'UserRepository.create',
        });
      }
    }
  }

  async findAll(page: number, size: number): Promise<User[]> {
    try {
      const skip = (page - 1) * size;

      const users = await this.userModel.find().skip(skip).limit(size).exec();

      if (users.length === 0) {
        throw new NotFoundException({
          message: 'Users not found',
          at: 'UserRepository.findAll',
        });
      }

      return users;
    } catch (error) {
      if (!error.response) {
        throw new InternalServerErrorException({
          message: error.message,
          at: 'UserRepository.findAll',
        });
      }

      throw error;
    }
  }

  async updateById(id: string, user: User): Promise<User | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException({
          message: 'User id is invalid',
          at: 'UserRepository.updateById',
        });
      }

      return await this.userModel
        .findByIdAndUpdate(id, user, { new: true })
        .exec();
    } catch (error) {
      if (!error.response) {
        throw new InternalServerErrorException({
          message: error.message,
          at: 'UserRepository.updateById',
        });
      }

      throw error;
    }
  }

  async deleteByEmail(email: string): Promise<User | null> {
    try {
      const deletedUser = await this.userModel
        .findOneAndDelete({ email })
        .exec();

      if (!deletedUser) {
        throw new BadRequestException({
          messaage: 'User could not be deleted',
          at: 'UserRepository.deleteByEmail',
        });
      }

      return deletedUser;
    } catch (error) {
      if (!error.response) {
        throw new InternalServerErrorException({
          message: error.message,
          at: 'UserRepository.deleteByEmail',
        });
      }

      throw error;
    }
  }

  async deleteById(id: string): Promise<User | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException({
          message: 'User id is invalid',
          at: 'UserRepository.deleteById',
        });
      }

      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

      if (!deletedUser) {
        throw new BadRequestException({
          message: 'User could not be deleted',
          at: 'UserRepository.deleteById',
        });
      }

      return deletedUser;
    } catch (error) {
      if (!error.response) {
        throw new InternalServerErrorException({
          message: error.message,
          at: 'UserRepository.deleteById',
        });
      }

      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await this.userModel.deleteMany().exec();
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        at: 'UserRepository.deleteAll',
      });
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      return user;
    } catch (error) {
      if (!error.response) {
        throw new InternalServerErrorException({
          message: error.message,
          at: 'UserRepository.findOneByEmail',
        });
      }

      throw error;
    }
  }

  async findOneById(id: string): Promise<User | null> {
    try {
      // ID 형식 검증
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException({
          message: 'User id is invalid',
          at: 'UserRepository.findOneById',
        });
      }

      const user = await this.userModel.findById(id).exec();

      return user;
    } catch (error) {
      if (!error.response) {
        throw new InternalServerErrorException({
          message: error.message,
          at: 'UserRepository.findOneById',
        });
      }

      throw error;
    }
  }
}
