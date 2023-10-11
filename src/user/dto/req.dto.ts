import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class PageReqDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @ApiProperty({
    type: Number,
    example: 1,
    required: false,
  })
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @ApiProperty({
    type: Number,
    example: 10,
    required: false,
  })
  size: number = 10;
}

export class UpdateUserReqDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'John Doe - Updated',
    description: 'User name',
    required: false,
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'john.doe1212@example.com',
    description: 'User email',
    required: false,
  })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Password123!',
    description: 'User password',
    required: false,
  })
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Company-Updated',
    description: 'User company',
    required: false,
  })
  company: string;
}
