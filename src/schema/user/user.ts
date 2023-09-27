import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from 'src/enums/user-role/user-role';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  company: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
