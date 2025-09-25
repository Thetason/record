// Role-Based Access Control (RBAC) 시스템

export enum Permission {
  // 리뷰 관리
  VIEW_REVIEWS = 'view:reviews',
  VERIFY_REVIEWS = 'verify:reviews',
  DELETE_REVIEWS = 'delete:reviews',
  MODERATE_REVIEWS = 'moderate:reviews',

  // 사용자 관리
  VIEW_USERS = 'view:users',
  EDIT_USERS = 'edit:users',
  DELETE_USERS = 'delete:users',
  CHANGE_USER_ROLES = 'change:user_roles',

  // 결제 관리
  VIEW_PAYMENTS = 'view:payments',
  PROCESS_REFUNDS = 'process:refunds',
  VIEW_ANALYTICS = 'view:analytics',

  // 시스템 관리
  MANAGE_ANNOUNCEMENTS = 'manage:announcements',
  VIEW_LOGS = 'view:logs',
  MANAGE_SETTINGS = 'manage:settings',
  
  // 고객 지원
  VIEW_TICKETS = 'view:tickets',
  RESPOND_TICKETS = 'respond:tickets',
  MANAGE_TICKETS = 'manage:tickets',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// 역할별 권한 매핑
const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [], // 일반 사용자는 별도 권한 없음
  
  [Role.ADMIN]: [
    Permission.VIEW_REVIEWS,
    Permission.VERIFY_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.VIEW_USERS,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_TICKETS,
    Permission.RESPOND_TICKETS,
    Permission.MANAGE_ANNOUNCEMENTS,
  ],
  
  [Role.SUPER_ADMIN]: [
    ...rolePermissions[Role.ADMIN],
    Permission.DELETE_REVIEWS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.CHANGE_USER_ROLES,
    Permission.PROCESS_REFUNDS,
    Permission.VIEW_LOGS,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_TICKETS,
  ],
};

export class RBACService {
  static hasPermission(userRole: string, permission: Permission): boolean {
    const role = userRole as Role;
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  }

  static hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  static hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  static canAccessAdminArea(userRole: string): boolean {
    return userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN;
  }

  static canManageUsers(userRole: string): boolean {
    return this.hasPermission(userRole, Permission.EDIT_USERS);
  }

  static canDeleteContent(userRole: string): boolean {
    return this.hasPermission(userRole, Permission.DELETE_REVIEWS) || 
           this.hasPermission(userRole, Permission.DELETE_USERS);
  }

  static getRolePermissions(userRole: string): Permission[] {
    const role = userRole as Role;
    return rolePermissions[role] || [];
  }
}

// 권한 검증 데코레이터
type RoleAwareInstance = {
  getUserRole?: () => string
} & Record<string, unknown>

export function requirePermission(permission: Permission) {
  return function (_target: unknown, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value as ((...args: unknown[]) => unknown) | undefined;
    if (!method) {
      return descriptor;
    }

    descriptor.value = function (this: RoleAwareInstance, ...args: unknown[]) {
      const userRole = this.getUserRole?.() || Role.USER;

      if (!RBACService.hasPermission(userRole, permission)) {
        throw new Error(`Insufficient permissions. Required: ${permission}`);
      }

      return method.apply(this, args);
    };
    return descriptor;
  };
}

// API 권한 검증 미들웨어
export function checkPermission(permission: Permission) {
  return (userRole: string) => {
    if (!RBACService.hasPermission(userRole, permission)) {
      return {
        error: 'Forbidden',
        message: `Access denied. Required permission: ${permission}`,
        code: 403
      };
    }
    return null;
  };
}
