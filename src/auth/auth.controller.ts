import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInReqDto, SignUpReqDto } from 'src/auth/dto/req.dto';
import { SignInResDto } from './dto/res.dto';
import { Public } from 'src/decorators/public-api.decoratpr';
import { User } from 'src/schema/user/user';
import { RolesGuard } from './roles.guard';
import { GetAccessToken } from 'src/decorators/get-access-token.decorator';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@UseGuards(RolesGuard)
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @Public()
  @ApiResponse({ status: 200, type: SignInResDto })
  @ApiResponse({ status: 400, description: 'BadRequestException' })
  @ApiResponse({ status: 500, description: 'InternalServerException' })
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInReqDto: SignInReqDto): Promise<SignInResDto> {
    const validUser = await this.authService.validateUser(
      signInReqDto.email,
      signInReqDto.password,
    );

    return this.authService.signIn(validUser);
  }

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'BadRequestException' })
  @ApiResponse({ status: 500, description: 'InternalServerException' })
  async signUp(@Body() signUpReqDto: SignUpReqDto): Promise<User> {
    await this.authService.validateNewUser(signUpReqDto);

    return this.authService.signUp(signUpReqDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'BadRequestException' })
  @ApiResponse({ status: 401, description: 'UnauthorizedException' })
  @ApiResponse({ status: 403, description: 'ForbiddenException' })
  @ApiResponse({ status: 500, description: 'InternalServerException' })
  async signOut(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ) {
    await Promise.all([
      this.authService.validateAccessToken(accessToken),
      this.authService.validateRefreshToken(refreshToken),
    ]);

    return this.authService.signOut(accessToken, refreshToken);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'BadRequestException' })
  @ApiResponse({ status: 401, description: 'UnauthorizedException' })
  @ApiResponse({ status: 403, description: 'ForbiddenException' })
  @ApiResponse({ status: 500, description: 'InternalServerException' })
  async delete(@GetAccessToken() accessToken: string) {
    await this.authService.validateAccessToken(accessToken);

    const paylod = this.authService.decodeAccessToken(accessToken);
    return await this.authService.deleteUser(paylod.email);
  }

  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return req.user;
  }
}
