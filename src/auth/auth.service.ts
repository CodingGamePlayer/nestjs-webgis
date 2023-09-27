import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SignInReqDto } from 'src/user/dto/req.dto';
import { UserService } from 'src/user/user.service';
import { SignInResDto } from './dto/res.dto';
import { ExceptionMassage } from 'src/enums/excepion/exception';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

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

    return new SignInResDto();
  }
}
