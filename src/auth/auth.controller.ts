import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

@UseGuards(RolesGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
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
  async signUp(@Body() signUpReqDto: SignUpReqDto): Promise<User> {
    await this.authService.validateNewUser(signUpReqDto);

    return this.authService.signUp(signUpReqDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Request() req: Request) {
    const authorization = req.headers['authorization'];
    const accessToken = authorization.split(' ')[1];
    const refreshToken = req.headers['refreshtoken'];

    await Promise.all([
      this.authService.validateAccessToken(accessToken),
      this.authService.validateRefreshToken(refreshToken),
    ]);

    return this.authService.signOut(accessToken, refreshToken);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  async delete(@GetAccessToken() accessToken: string) {
    await this.authService.validateAccessToken(accessToken);

    const paylod = this.authService.decodeAccessToken(accessToken);
    return await this.authService.deleteUser(paylod.email);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
