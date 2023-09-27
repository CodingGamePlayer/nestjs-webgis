import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInReqDto } from 'src/user/dto/req.dto';
import { SignInResDto } from './dto/res.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  sign(@Body() signInReqDto: SignInReqDto): Promise<SignInResDto> {
    return this.authService.signIn(signInReqDto);
  }
}
