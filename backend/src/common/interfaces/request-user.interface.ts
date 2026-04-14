import { UserRole } from '../../entities/user.entity';

export interface RequestUser {
  id: number;
  email: string;
  role: UserRole;
}
