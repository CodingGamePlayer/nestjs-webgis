import { IsNotEmpty, IsString } from 'class-validator';
import { User, UserDocument } from 'src/schema/user/user';

export class PageResDto {
  constructor(user: User) {
    this.name = user.name;
    this.email = user.email;
    this.company = user.company;
    this.role = user.role;
  }

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
