import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInReqDto, SignUpReqDto } from 'src/auth/dto/req.dto';
import { SignInResDto } from './dto/res.dto';
import { Public } from 'src/decorators/public-api.decoratpr';
import { User } from 'src/schema/user/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  sign(@Body() signInReqDto: SignInReqDto): Promise<SignInResDto> {
    return this.authService.signIn(signInReqDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() signUpReqDto: SignUpReqDto): Promise<User> {
    return this.authService.create(signUpReqDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: Request) {
    const authorization = req.headers['authorization'];
    const accessToken = authorization.split(' ')[1];
    const refreshToken = req.headers['refreshtoken'];
    return this.authService.logout(accessToken, refreshToken);
  }
}
