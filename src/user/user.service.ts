import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user/user';
import { SignUpReqDto } from './dto/req.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
  ) {}

  async create(signUpReqDto: SignUpReqDto): Promise<User> {
    const createdUser = new this.userRepository(signUpReqDto);
    return createdUser.save();
  }
}
