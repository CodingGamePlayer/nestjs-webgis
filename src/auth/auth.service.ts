import {
  Injectable,
  BadRequestException,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignInReqDto, SignUpReqDto } from 'src/auth/dto/req.dto';
import { SignInResDto } from './dto/res.dto';
import { ExceptionMassage } from 'src/enums/exception';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/schema/user/user';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRepository } from 'src/user/user.repository';
import { DecodedToken } from './interface/decoded-token.interface';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  /**
   * Create a new user.
   * @param signUpReqDto - The user information.
   * @returns A promise that resolves to the created User object.
   */
  async signUp(signUpReqDto: SignUpReqDto): Promise<User> {
    const hashedPassword = await this.hashPassword(signUpReqDto.password);

    const createdUser = {
      ...signUpReqDto,
      password: hashedPassword,
    };

    return this.userRepository.create(createdUser);
  }

  /**
   * Authenticate a user and return an access token.
   * @param signInReqDto - The user's sign-in credentials.
   * @returns A promise that resolves to an access token.
   */
  async signIn(validUser: User): Promise<SignInResDto> {
    const accessToken = await this.createAccessToken(validUser);
    const refreshToken = await this.createRefreshToken();

    await this.saveRefreshToken(validUser.email, refreshToken);

    return new SignInResDto(accessToken, refreshToken);
  }

  /**
   *  Sign out a user.
   * @param accessToken - The access token to sign out.
   * @param refreshToken - The refresh token to sign out.
   */
  async signOut(accessToken: string, refreshToken: string): Promise<void> {
    await this.saveAccessTokenInBlackList(accessToken);
    await this.removeRefreshToken(refreshToken);
  }

  /**
   * Delete a user.
   * @param email - The email of the user to delete.
   * @returns - A promise that resolves to the deleted User object.
   */
  async deleteUser(email: string): Promise<User> {
    return await this.userRepository.deleteByEmail(email);
  }

  async slideSession(
    accessToken: string,
    refreshToken: string,
  ): Promise<SignInResDto> {
    const decodedToken = this.decodeAccessToken(accessToken);

    const user = await this.getUser(decodedToken.email);

    const newAccessToken = await this.createAccessToken(user);
    const newRefreshToken = await this.createRefreshToken();

    await this.saveAccessTokenInBlackList(accessToken);
    await this.saveRefreshToken(user.email, newRefreshToken);

    return new SignInResDto(newAccessToken, newRefreshToken);
  }

  async getUser(email: string): Promise<User> {
    return await this.userRepository.findOneByEmail(email);
  }

  async validateAccessToken(accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new UnauthorizedException({
        message: ExceptionMassage.INVALID_ACCESS_TOKEN,
        at: 'AuthService.validateAccessToken',
      });
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: ExceptionMassage.INVALID_REFRESH_TOKEN,
        at: 'AuthService.validateRefreshToken',
      });
    }
  }

  async saveAccessTokenInBlackList(accessToken: string): Promise<void> {
    try {
      await this.cacheManager.set(accessToken, accessToken, 60 * 60 * 24);
    } catch (error) {
      throw new InternalServerErrorException({
        message: ExceptionMassage.INTERNAL_SERVER_ERROR,
        at: 'AuthService.saveAccessTokenInBlackList',
      });
    }
  }

  async removeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await this.cacheManager.del(refreshToken);
    } catch (error) {
      throw new InternalServerErrorException({
        message: ExceptionMassage.INTERNAL_SERVER_ERROR,
        at: 'AuthService.removeRefreshToken',
      });
    }
  }

  /**
   * Create an access token for the given user.
   * @param user - The user for whom to create an access token.
   * @returns A promise that resolves to an object containing the access token.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async createAccessToken(user: User): Promise<string> {
    try {
      const payload = { email: user.email, sub: user['_id'] };

      return this.jwtService.sign(payload);
    } catch (error) {
      throw new InternalServerErrorException({
        message: ExceptionMassage.INTERNAL_SERVER_ERROR,
        at: 'AuthService.createAccessToken',
      });
    }
  }

  /**
   * Create a refresh token.
   * @returns - A promise that resolves to an object containing the refresh token.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async createRefreshToken(): Promise<string> {
    try {
      const time = new Date().toISOString();
      const payload = { time };

      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      return refreshToken;
    } catch (error) {
      throw new InternalServerErrorException({
        message: ExceptionMassage.INTERNAL_SERVER_ERROR,
        at: 'AuthService.createRefreshToken',
      });
    }
  }

  /**
   * Save a refresh token to the cache.
   * @param email - The email of the user to whom the refresh token belongs.
   * @param refreshToken - The refresh token to save.
   * @returns A promise that resolves when the refresh token is saved.
   * @throws {BadRequestException} If a refresh token already exists for the given email.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async saveRefreshToken(email: string, refreshToken: string): Promise<void> {
    try {
      await this.cacheManager.set(refreshToken, email, 60 * 60 * 24 * 7);
    } catch (error) {
      if (!error.status) {
        throw new InternalServerErrorException({
          message: ExceptionMassage.INTERNAL_SERVER_ERROR,
          at: 'AuthService.saveRefreshToken',
        });
      }
      throw error;
    }
  }

  /**
   * Validate a user's credentials.
   * @param email - The email to validate.
   * @param pass - The password to validate.
   * @returns A promise that resolves to the validated User object.
   * @throws {BadRequestException} If the user is not found or password does not match.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async validateUser(email: string, pass: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneByEmail(email);
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
    } catch (error) {
      if (!error.status) {
        throw new InternalServerErrorException({
          message: ExceptionMassage.INTERNAL_SERVER_ERROR,
          at: 'AuthService.validateUser',
        });
      }
      throw error;
    }
  }

  /**
   * Validate new user's information.
   * @param signUpReqDto - The user information.
   * @returns A promise that resolves when the validation is done.
   */
  async validateNewUser(signUpReqDto: SignUpReqDto): Promise<void> {
    const user = await this.userRepository.findOneByEmail(signUpReqDto.email);

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
   * Hash the given password.
   * @param password - The password to hash.
   * @returns A promise that resolves to the hashed password.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new InternalServerErrorException({
        message: ExceptionMassage.INTERNAL_SERVER_ERROR,
        at: 'AuthService.hashPassword',
      });
    }
  }

  async isAccessTokenInBlackList(token: string) {
    const rusult: string = await this.cacheManager.get(token);

    if (rusult) {
      return true;
    }
  }

  decodeAccessToken(accessToken: string): DecodedToken {
    const payload = this.jwtService.decode(accessToken);
    return payload as DecodedToken;
  }
}
