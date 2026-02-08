export type UserRole = 'ADMIN' | 'FAMILY' | 'GUEST';

export interface Me {
  uid?: string;
  email?: string;
  role?: UserRole;
}
