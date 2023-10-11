import { UserService } from './user.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { PageReqDto } from './dto/req.dto';
import { User } from 'src/schema/user/user';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { GetAccessToken } from 'src/decorators/get-access-token.decorator';

@Controller('user')
@ApiTags('User')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get('users')
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '한 페이지당 항목 수',
  })
  async findAll(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
    @Query() pageReqDto: PageReqDto,
  ): Promise<User[]> {
    const { page, size } = pageReqDto;

    return this.UserService.findAll(page, size);
  }
}
