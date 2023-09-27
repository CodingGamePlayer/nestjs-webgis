import { PageReqDto } from './dto/req.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user/user';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
  ) {}

  async findAll(page: number, size: number): Promise<User[]> {
    const skip = (page - 1) * size;
    return this.userRepository.find().skip(skip).limit(size).exec();
  }
}
