import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { async } from 'rxjs';
import { SignInReqDto } from 'src/auth/dto/req.dto';
import { User, UserDocument } from 'src/schema/user/user';
import { UpdateUserReqDto } from './dto/req.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: SignInReqDto): Promise<User> {
    return await this.userModel.create(user);
  }

  async findAll(page: number, size: number): Promise<User[]> {
    const skip = (page - 1) * size;
    return await this.userModel.find().skip(skip).limit(size).exec();
  }

  async updateById(id: string, user: User): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();
  }

  async deleteByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOneAndDelete({ email }).exec();
  }

  async deleteById(id: string): Promise<User | null> {
    return await this.userModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.userModel.deleteMany().exec();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.userModel.findById(id).exec();
  }
}
