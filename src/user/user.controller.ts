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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { GetAccessToken } from 'src/decorators/get-access-token.decorator';
import { PageResDto } from './dto/res.dto';
import { Public } from 'src/decorators/public-api.decoratpr';
import { ApiCommonResponses } from 'src/decorators/api-common-res.decorator';

@Controller('user/v1')
@ApiTags('User')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  @ApiResponse({
    status: 200,
    description: 'The profile of the user',
    type: PageResDto,
  })
  async getMe(@GetAccessToken() accessToken: string): Promise<PageResDto> {
    return await this.UserService.findOneByEmail(accessToken);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Public()
  // @ApiBearerAuth()
  @ApiCommonResponses()
  @ApiResponse({
    status: 200,
    description: 'The profile of the user',
    type: PageResDto,
  })
  async getUserById(@Query('id') id: string): Promise<PageResDto> {
    return this.UserService.findOneById(id);
  }

  @Get('users')
  @Public()
  // @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  @ApiResponse({
    status: 200,
    description: 'The list of users',
    type: PageResDto,
    isArray: true,
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  @ApiResponse({
    status: 200,
    description: 'The profile of the user',
    type: PageResDto,
  })
  async getProfile(@GetAccessToken() accessToken: string): Promise<PageResDto> {
    return this.UserService.findOneByEmail(accessToken);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async modifyProfile(
    @GetAccessToken() accessToken: string,
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
