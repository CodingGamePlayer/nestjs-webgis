import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class SignInResDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    description: 'User access token',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    description: 'User refresh token',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class SignUpResDto {
  constructor(name: string, email: string, company: string) {
    this.name = name;
    this.email = email;
    this.company = company;
  }

  @ApiProperty({
    type: String,
    example: 'John Doe',
    description: 'User name',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: String,
    example: 'Company',
    description: 'User company',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  company: string;
}
