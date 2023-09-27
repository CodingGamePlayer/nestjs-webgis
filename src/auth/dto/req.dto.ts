import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
export class SignUpReqDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
