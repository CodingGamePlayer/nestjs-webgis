import { Injectable } from '@nestjs/common';
import { User } from 'src/schema/user/user';
import { PageResDto } from './dto/res.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(page: number, size: number): Promise<PageResDto[]> {
    const users = await this.userRepository.findAll(page, size);

    return users.map((user) => this.userToPageResDto(user));
  }

  userToPageResDto(user: User): PageResDto {
    return new PageResDto(user);
  }
}
