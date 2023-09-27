import { IsNotEmpty, IsString } from 'class-validator';
export class SignInResDto {
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
