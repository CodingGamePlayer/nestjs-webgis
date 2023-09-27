import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SignInReqDto } from 'src/user/dto/req.dto';
import { UserService } from 'src/user/user.service';
import { SignInResDto } from './dto/res.dto';
import { ExceptionMassage } from 'src/enums/excepion/exception';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInReqDto: SignInReqDto): Promise<SignInResDto> {
    const user = await this.userService.findOneByEmail(signInReqDto.email);

    if (!user) {
      throw new BadRequestException({
        message: ExceptionMassage.USER_NOT_FOUND,
        at: 'AuthService.signIn',
      });
    }

    if (user.password !== signInReqDto.password) {
      throw new UnauthorizedException({
        message: ExceptionMassage.INVALID_PASSWORD,
        at: 'AuthService.signIn',
      });
    }
    const { access_token } = await this.createToken(user);
    return new SignInResDto(access_token);
  }

  async createToken(user: object) {
    const payload = { email: user['email'], sub: user['_id'] };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
