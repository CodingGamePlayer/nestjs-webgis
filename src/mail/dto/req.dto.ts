import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendMailReqDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  confirmationLink: string;
}
