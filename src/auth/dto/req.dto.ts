import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';
import { StrongPassword } from 'src/decorators/strong-password.decorator';
import { UserRole } from 'src/enums/user-role';

export class SignUpReqDto {
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
    example: 'test@email.com',
    description: 'User email',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: 'Password1234!',
    description: 'User password',
    required: true,
  })
  @IsNotEmpty()
  @StrongPassword()
  password: string;

  @ApiProperty({
    type: String,
    example: 'Password1234!',
    description: 'User password',
    required: true,
  })
  @IsNotEmpty()
  @StrongPassword()
  passwordConfirmation: string;

  @ApiProperty({
    type: String,
    example: 'Company',
    description: 'User company',
    required: false,
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({
    enum: UserRole,
  })
  @IsOptional()
  @IsString()
  role?: UserRole;
}

export class SignInReqDto {
  @ApiProperty({
    type: String,
    example: 'test@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: 'Password1234!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
