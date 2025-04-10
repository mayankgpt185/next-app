export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
}

export interface UserRoleAccess {
  role: UserRole;
  routes: string[];
}

export const roleAccess: UserRoleAccess[] = [
  {
    role: UserRole.ADMIN,
    routes: ['/manage-staff', '/manage-staff/add', '/manage-student', '/manage-student/add', '/manage-course', '/manage-course/add', '/manage-subject', '/manage-subject/add', '/attendance', '/attendance/add', '/manage-leave', '/manage-leave/add', '/manage-result', '/manage-result/add'],
  },
  {
    role: UserRole.STAFF,
    routes: ['/manage-student', '/manage-student/add', '/manage-course', '/manage-course/add', '/manage-subject', '/manage-subject/add', '/attendance', '/attendance/add', '/manage-leave', '/manage-leave/add', '/manage-result', '/manage-result/add'],
  },
  {
    role: UserRole.STUDENT,
    routes: ['/manage-student', '/manage-course', '/manage-subject', '/attendance', '/manage-result'],
  },
];

export const hasAccess = (userRole: UserRole, path: string): boolean => {
  const access = roleAccess.find((access) => access.role === userRole);
  if (!access) return false;
  return access.routes.some((route) => path.startsWith(route));
};
