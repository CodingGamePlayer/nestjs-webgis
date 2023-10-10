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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiAuthCommonResponses,
  ApiCommonResponses,
} from 'src/decorators/api-common-res.decorator';

@Controller('auth/v1')
@UseGuards(RolesGuard)
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @Public()
  @ApiAuthCommonResponses()
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
  @ApiAuthCommonResponses()
  async signUp(@Body() signUpReqDto: SignUpReqDto): Promise<User> {
    await this.authService.validateNewUser(signUpReqDto);

    return this.authService.signUp(signUpReqDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  async signOut(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ) {
    return this.authService.signOut(accessToken, refreshToken);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  async delete(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ) {
    const paylod = this.authService.decodeAccessToken(accessToken);

    this.authService.signOut(accessToken, refreshToken);

    return await this.authService.deleteUser(paylod.email);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiCommonResponses()
  async getProfile(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ) {
    const paylod = this.authService.decodeAccessToken(accessToken);

    return await this.authService.getUser(paylod.email);
  }
}
