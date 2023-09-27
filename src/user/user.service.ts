import { BadRequestException, Injectable } from '@nestjs/common';
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
    const user = await this.findOneByEmail(signUpReqDto.email);

    if (user) {
      throw new BadRequestException({
        message: 'Email already exists',
        at: 'UserService.create',
      });
    }

    if (signUpReqDto.password !== signUpReqDto.passwordConfirmation) {
      throw new BadRequestException(
        'Password and password confirmation must be the same',
      );
    }

    const createdUser = new this.userRepository(signUpReqDto);
    return createdUser.save();
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ email: email });
  }
}
