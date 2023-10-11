import { UserService } from './user.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Headers,
  Param,
  Put,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { PageReqDto, UpdateUserReqDto } from './dto/req.dto';
import { User } from 'src/schema/user/user';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { GetAccessToken } from 'src/decorators/get-access-token.decorator';
import { PageResDto } from './dto/res.dto';
import { Public } from 'src/decorators/public-api.decoratpr';

@Controller('user/v1')
@ApiTags('User')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get('users')
  @Public()
  // @Roles(UserRole.Admin)
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

  @Get('profile')
  @ApiBearerAuth()
  async getProfile(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ): Promise<PageResDto> {
    return this.UserService.findOneByEmail(accessToken);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async modifyProfile(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
    @Body() updateUserReqDto: UpdateUserReqDto,
  ): Promise<PageResDto> {
    if (Object.values(updateUserReqDto).every((value) => value.length === 0)) {
      throw new BadRequestException({
        message: 'At least one field must be filled',
        at: 'UserController.modifyProfile',
      });
    }

    return await this.UserService.updateProfile(accessToken, updateUserReqDto);
  }
}
