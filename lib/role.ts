export enum UserRole {
  SUPER = 'SUPER',
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
    role: UserRole.SUPER,
    routes: ['/manage-admin', '/manage-admin/add', '/api/manage-staff', '/api/clients', '/api/organizations', '/api/client-organization', '/profile', '/calendar', '/api/classes', '/api/sections', '/api/session', '/api/auth/signup'],
  },
  {
    role: UserRole.ADMIN,
    routes: ['/manage-staff', '/manage-staff/add', '/api/manage-staff', '/manage-student', '/manage-student/add', '/api/manage-student', '/api/student-class', '/manage-course', '/manage-course/add', '/api/manage-course', '/manage-subject', '/manage-subject/add', '/api/manage-subject', '/attendance', '/attendance/add', '/api/attendance', '/manage-leave', '/manage-leave/add', '/api/leave', '/manage-result', '/manage-result/add', '/api/manage-result', '/profile', '/calendar', '/api/classes', '/api/sections', '/api/session'],
  },
  {
    role: UserRole.STAFF,
      routes: ['/manage-staff', '/manage-student', '/manage-student/add', '/api/manage-staff', '/api/student-class', '/manage-course', '/manage-course/add', '/api/manage-course', '/manage-subject', '/manage-subject/add', '/api/manage-subject', '/attendance', '/attendance/add', '/api/attendance', '/manage-leave', '/manage-leave/add', '/api/leave', '/manage-result', '/manage-result/add', '/api/manage-result', '/profile', '/calendar', '/api/classes', '/api/sections', '/api/session'],
  },
  {
    role: UserRole.STUDENT,
    routes: ['/manage-student', '/api/manage-staff', '/api/student-class', '/manage-course', '/api/manage-course', '/manage-subject', '/api/manage-subject', '/attendance', '/api/attendance', '/manage-result', '/api/manage-result', '/profile', '/calendar', '/api/classes', '/api/sections', '/api/session'],
  },
];

export const hasAccess = (userRole: UserRole, path: string): boolean => {
  const access = roleAccess.find((access) => access.role === userRole);
  if (!access) return false;
  
  // First check for exact match
  if (access.routes.includes(path)) {
    return true;
  }
  
  // For paths with subpaths like /manage-course/add
  const pathParts = path.split('/');
  
  // If this is an "add" or other special subpath, it must be explicitly allowed
  if (pathParts.length > 2 && pathParts[2] !== '') {
    const exactPath = path;
    return access.routes.includes(exactPath);
  }
  
  // For API routes, we need to be more careful
  if (path.startsWith('/api/')) {
    return access.routes.includes(path);
  }
  
  // For regular routes, check if the base path is allowed
  const basePath = `/${pathParts[1]}`;
  return access.routes.includes(basePath);
};
