import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInReqDto, SignUpReqDto } from 'src/auth/dto/req.dto';
import { SignInResDto, SignUpResDto } from './dto/res.dto';
import { Public } from 'src/decorators/public-api.decoratpr';
import { RolesGuard } from './roles.guard';
import { GetAccessToken } from 'src/decorators/get-access-token.decorator';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @HttpCode(HttpStatus.OK)
  @ApiAuthCommonResponses()
  @ApiResponse({ status: 200, description: 'OK', type: SignInResDto })
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
  @ApiResponse({ status: 201, description: 'Created', type: SignUpResDto })
  async signUp(@Body() signUpReqDto: SignUpReqDto): Promise<SignUpResDto> {
    await this.authService.validateNewUser(signUpReqDto);

    return this.authService.signUp(signUpReqDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  @ApiResponse({ status: 200, description: 'OK' })
  async signOut(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ) {
    return this.authService.signOut(accessToken, refreshToken);
  }

  @Post('slide-session')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  @ApiResponse({ status: 200, description: 'OK', type: SignInResDto })
  async slideSession(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ) {
    return await this.authService.slideSession(accessToken, refreshToken);
  }

  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiCommonResponses()
  @ApiResponse({ status: 200, description: 'OK', type: SignUpResDto })
  async delete(
    @GetAccessToken() accessToken: string,
    @Headers('refreshtoken') refreshToken: string,
  ): Promise<SignUpResDto> {
    const paylod = this.authService.decodeAccessToken(accessToken);

    this.authService.signOut(accessToken, refreshToken);

    return await this.authService.deleteUser(paylod.email);
  }
}
