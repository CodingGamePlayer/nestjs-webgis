import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { SignInReqDto, SignUpReqDto } from 'src/user/dto/req.dto';
import { SignInResDto } from './dto/res.dto';
import { ExceptionMassage } from 'src/enums/exception';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schema/user/user';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    const { access_token } = await this.createAccessToken(validUser);
    const { refresh_token } = await this.createRefreshToken();

    await this.saveRefreshToken(validUser.email, refresh_token);

    return new SignInResDto(access_token, refresh_token);
  }

  /**
   * Create an access token for the given user.
   * @param user - The user for whom to create an access token.
   * @returns A promise that resolves to an object containing the access token.
   */
  async createAccessToken(user: User): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user['_id'] };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Create a refresh token.
   * @returns - A promise that resolves to an object containing the refresh token.
   */
  async createRefreshToken(): Promise<{ refresh_token: string }> {
    const time = new Date().toISOString();
    const payload = { time };

    return {
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  /**
   * Save a refresh token to the cache.
   * @param email - The email of the user to whom the refresh token belongs.
   * @param refreshToken - The refresh token to save.
   */
  async saveRefreshToken(email: string, refreshToken: string): Promise<void> {
    await this.cacheManager.set(email, refreshToken, 60 * 60 * 24 * 7);

    console.log(await this.cacheManager.get(email));
  }

  /**
   * Validate a user's credentials.
   * @param email - The email to validate.
   * @param pass - The password to validate.
   * @returns A promise that resolves to the validated User object.
   * @throws {BadRequestException} If the user is not found or password does not match.
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException({
        message: ExceptionMassage.USER_NOT_FOUND,
        at: 'AuthService.validateUser',
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
