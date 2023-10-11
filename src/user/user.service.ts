import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/schema/user/user';
import { PageResDto } from './dto/res.dto';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserReqDto } from './dto/req.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(page: number, size: number): Promise<PageResDto[]> {
    const users = await this.userRepository.findAll(page, size);

    return users.map((user) => this.userToPageResDto(user));
  }

  async findOneByEmail(accessToken: string): Promise<PageResDto> {
    try {
      const { email } = await this.jwtService.verifyAsync(accessToken);

      return this.userToPageResDto(
        await this.userRepository.findOneByEmail(email),
      );
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        at: 'UserService.findOneByEmail',
      });
    }
  }

  async modifyProfile(
    accessToken: string,
    updateUserReqDto: UpdateUserReqDto,
  ): Promise<PageResDto> {
    try {
      const { email } = await this.jwtService.verifyAsync(accessToken);

      const foundUser = await this.userRepository.findOneByEmail(email);

      const updatedUser = this.updateUser(foundUser, updateUserReqDto);

      return this.userToPageResDto(
        await this.userRepository.updateByEmail(email, updatedUser),
      );
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        at: 'UserService.modifyProfile',
      });
    }
  }

  updateUser(user: User, updateUserReqDto: UpdateUserReqDto): User {
    const updateFileds = {
      ...user,
      ...updateUserReqDto,
    };

    Object.assign(user, updateFileds);

    return user;
  }

  userToPageResDto(user: User): PageResDto {
    return new PageResDto(user);
  }
}
