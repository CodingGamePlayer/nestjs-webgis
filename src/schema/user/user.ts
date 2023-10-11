import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SignUpResDto } from 'src/auth/dto/res.dto';
import { UserRole } from 'src/enums/user-role';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  @ApiProperty({
    type: String,
    required: true,
  })
  name: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop()
  company: string;

  @ApiProperty({
    enum: UserRole,
    default: UserRole.USER,
  })
  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @Prop({ default: Date.now })
  createdAt: Date;

  toSignUpResDto(): SignUpResDto {
    return new SignUpResDto(this.name, this.email, this.company);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
