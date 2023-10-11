import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from 'src/enums/user-role';
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
  @ApiProperty({
    type: String,
    example: 'John Doe',
    description: 'User name',
    required: true,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'john.doe1212@example.com',
    description: 'User email',
    required: false,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'Company',
    description: 'User company',
    required: false,
  })
  company: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    enum: [UserRole.ADMIN, UserRole.USER, UserRole.GUEST],
  })
  role: string;
}
