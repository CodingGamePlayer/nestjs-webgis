import { UserService } from './user.service';
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { PageReqDto } from './dto/req.dto';
import { User } from 'src/schema/user/user';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get('users')
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() pageReqDto: PageReqDto): Promise<User[]> {
    const { page, size } = pageReqDto;

    return this.UserService.findAll(page, size);
  }
}
