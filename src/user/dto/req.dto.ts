import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StrongPassword } from 'src/decorators/strong-password.decorator';

export class SignUpReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @StrongPassword()
  password: string;

  @IsNotEmpty()
  @StrongPassword()
  passwordConfirmation: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class SignInReqDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
