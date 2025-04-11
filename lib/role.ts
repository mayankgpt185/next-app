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
    routes: ['/manage-staff', '/manage-staff/add', '/api/manage-staff', '/manage-student', '/manage-student/add', '/api/manage-student', '/api/student-class', '/manage-course', '/manage-course/add', '/api/manage-course', '/manage-subject', '/manage-subject/add', '/api/manage-subject', '/attendance', '/attendance/add', '/api/attendance', '/manage-leave', '/manage-leave/add', '/api/leave', '/manage-result', '/manage-result/add', '/api/manage-result'],
  },
  {
    role: UserRole.STAFF,
      routes: ['/manage-student', '/manage-student/add', '/api/manage-staff', '/api/student-class', '/manage-course', '/manage-course/add', '/api/manage-course', '/manage-subject', '/manage-subject/add', '/api/manage-subject', '/attendance', '/attendance/add', '/api/attendance', '/manage-leave', '/manage-leave/add', '/api/leave', '/manage-result', '/manage-result/add', '/api/manage-result'],
  },
  {
    role: UserRole.STUDENT,
    routes: ['/manage-student', '/manage-student/add', '/api/manage-staff', '/api/student-class', '/manage-course', '/manage-course/add', '/api/manage-course', '/manage-subject', '/manage-subject/add', '/api/manage-subject', '/attendance', '/attendance/add', '/api/attendance', '/manage-result', '/api/manage-result'],
  },
];

export const hasAccess = (userRole: UserRole, path: string): boolean => {
  const access = roleAccess.find((access) => access.role === userRole);
  if (!access) return false;
  return access.routes.some((route) => path.startsWith(route));
};
