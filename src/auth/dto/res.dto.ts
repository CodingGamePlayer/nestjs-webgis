import { IsNotEmpty, IsString } from 'class-validator';
export class SignInResDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
