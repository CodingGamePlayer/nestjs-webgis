import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user/user';
import { SignUpReqDto } from './dto/req.dto';
import * as bcrypt from 'bcrypt';
import { ExceptionMassage } from 'src/enums/excepion/exception';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
  ) {}

  /**
   * Create a new user.
   * @param signUpReqDto - The user information.
   * @returns A promise that resolves to the created User object.
   */
  async create(signUpReqDto: SignUpReqDto): Promise<User> {
    await this.validateNewUser(signUpReqDto);

    const hashedPassword = await this.hashPassword(signUpReqDto.password);

    const createdUser = {
      ...signUpReqDto,
      password: hashedPassword,
    };

    return this.userRepository.create(createdUser);
  }

  /**
   * Validate new user's information.
   * @param signUpReqDto - The user information.
   * @returns A promise that resolves when the validation is done.
   */
  async validateNewUser(signUpReqDto: SignUpReqDto): Promise<void> {
    const user = await this.findOneByEmail(signUpReqDto.email);

    if (user) {
      throw new BadRequestException({
        message: ExceptionMassage.USER_ALREADY_EXISTS,
        at: 'UserService.validateNewUser',
      });
    }

    if (signUpReqDto.password !== signUpReqDto.passwordConfirmation) {
      throw new BadRequestException({
        message: ExceptionMassage.PASSWROD_CONFIRM,
        at: 'UserService.validateNewUser',
      });
    }
  }

  /**
   * Find one user by email.
   * @param email - The email to search for.
   * @returns A promise that resolves to the User object.
   */
  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ email: email });
  }

  /**
   * Hash the given password.
   * @param password - The password to hash.
   * @returns A promise that resolves to the hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
