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
import { PageResDto } from './dto/res.dto';
import { Public } from 'src/decorators/public-api.decoratpr';

@Controller('user')
@ApiTags('User')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get('users')
  @Public()
  // @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'page size',
  })
  async findAll(
    // @GetAccessToken() accessToken: string,
    // @Headers('refreshtoken') refreshToken: string,
    @Query() pageReqDto: PageReqDto,
  ): Promise<PageResDto[]> {
    const { page, size } = pageReqDto;

    return this.UserService.findAll(page, size);
  }
}
