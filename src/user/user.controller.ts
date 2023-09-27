import { UserService } from './user.service';
import { Controller, HttpStatus, Post, HttpCode, Body } from '@nestjs/common';
import { SignUpReqDto } from './dto/req.dto';
import { User } from 'src/schema/user/user';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() signUpReqDto: SignUpReqDto): Promise<User> {
    return this.UserService.create(signUpReqDto);
  }
}
