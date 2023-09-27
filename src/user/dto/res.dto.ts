import { UserRole } from 'src/enums/user-role';

export class SignUpResDto {
  name: string;
  email: string;
  company: string;
  role: UserRole;
  createdAt: Date;
}
