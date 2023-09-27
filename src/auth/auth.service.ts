import { Injectable, BadRequestException } from '@nestjs/common';
import { SignInReqDto } from 'src/user/dto/req.dto';
import { UserService } from 'src/user/user.service';
import { SignInResDto } from './dto/res.dto';
import { ExceptionMassage } from 'src/enums/excepion/exception';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/schema/user/user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticate a user and return an access token.
   * @param signInReqDto - The user's sign-in credentials.
   * @returns A promise that resolves to an access token.
   */
  async signIn(signInReqDto: SignInReqDto): Promise<SignInResDto> {
    const validUser = await this.validateUser(
      signInReqDto.email,
      signInReqDto.password,
    );

    const { access_token } = await this.createToken(validUser);
    return new SignInResDto(access_token);
  }

  /**
   * Create an access token for the given user.
   * @param user - The user for whom to create an access token.
   * @returns A promise that resolves to an object containing the access token.
   */
  async createToken(user: User): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user._id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Validate a user's credentials.
   * @param email - The email to validate.
   * @param pass - The password to validate.
   * @returns A promise that resolves to the validated User object.
   * @throws {BadRequestException} If the user is not found or password does not match.
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException({
        message: ExceptionMassage.USER_NOT_FOUND,
        at: 'AuthService.signIn',
      });
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new BadRequestException({
        message: ExceptionMassage.PASSWORD_NOT_MATCH,
        at: 'AuthService.validateUser',
      });
    }

    return user;
  }
}
