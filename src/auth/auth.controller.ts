import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInReqDto, SignUpReqDto } from 'src/user/dto/req.dto';
import { SignInResDto } from './dto/res.dto';
import { AuthGuard } from './auth.guard';
import { Public } from 'src/decorators/public-api.decoratpr';
import { User } from 'src/schema/user/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
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
}
