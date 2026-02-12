import { RoleKey, PortalType } from './types';

// ==================== 权限 Key 定义 ====================
// 命名规则: portal:resource:action

export const PERMISSIONS = {
  // ---- 平台端 ----
  'platform:channels:view': 'View channel list',
  'platform:channels:create': 'Create channel',
  'platform:channels:disable': 'Disable/Enable channel',
  'platform:customers:view': 'View customer list',
  'platform:customers:create': 'Create direct customer',
  'platform:customers:transfer': 'Transfer customer ownership',
  'platform:users:view': 'View all users',
  'platform:users:disable': 'Disable/Enable user',
  'platform:users:reset_password': 'Reset user password',
  'platform:users:change_role': 'Change user role',
  'platform:roles:view': 'View role permissions',
  'platform:garments:view': 'View garments (aggregated)',
  'platform:garments:edit': 'Edit garment (fallback)',
  'platform:garments:delete': 'Delete garment',
  'platform:templates:view': 'View templates (aggregated)',
  'platform:templates:create': 'Create new template',
  'platform:templates:edit': 'Edit template',
  'platform:templates:delete': 'Delete template',
  'platform:templates:assign': 'Assign template to customer',

  // ---- 渠道端 ----
  'channel:customers:view': 'View customers',
  'channel:customers:create': 'Create channel customer',
  'channel:users:view': 'View customer accounts',
  'channel:users:reinvite': 'Resend invitation',

  // ---- 客户端 ----
  'customer:users:view': 'View members',
  'customer:users:invite': 'Invite member',
  'customer:users:disable': 'Disable member',
  'customer:users:reset_password': 'Reset member password',
  'customer:garments:view': 'View garments',
  'customer:garments:upload': 'Upload/Import garment',
  'customer:garments:edit': 'Edit garment',
  'customer:garments:delete': 'Remove/Delete garment',
  'customer:garments:manage_categories': 'Manage garment categories',
  'customer:templates:view': 'View assigned templates',
  'customer:templates:toggle': 'Enable/Disable assigned template',
  'customer:devices:view': 'View devices',
  'customer:devices:manage': 'Add device / set nickname',
  'customer:garments:assign_device': 'Assign garments to devices',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

// ==================== 角色 → 权限映射 ====================

export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  PlatformSuperAdmin: Object.keys(PERMISSIONS) as PermissionKey[], // 全权限

  ChannelOwner: [
    'channel:customers:view',
    'channel:customers:create',
    'channel:users:view',
    'channel:users:reinvite',
  ],

  HQOwner: [
    'customer:users:view',
    'customer:users:invite',
    'customer:users:disable',
    'customer:users:reset_password',
    'customer:garments:view',
    'customer:garments:upload',
    'customer:garments:edit',
    'customer:garments:delete',
    'customer:garments:manage_categories',
    'customer:templates:view',
    'customer:templates:toggle',
    'customer:devices:view',
    'customer:devices:manage',
    'customer:garments:assign_device',
  ],

};

// ==================== 角色 → Portal 映射 ====================

export const ROLE_PORTAL: Record<RoleKey, PortalType> = {
  PlatformSuperAdmin: 'platform',
  ChannelOwner: 'channel',
  HQOwner: 'customer',
};

// ==================== 路由权限映射 ====================

export const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  '/dashboard/channels': 'platform:channels:view',
  '/dashboard/customers': 'platform:customers:view',
  '/dashboard/users': 'platform:users:view',
  '/dashboard/assets/garments': 'platform:garments:view',
  '/dashboard/assets/templates': 'platform:templates:view',
  // 渠道端
  '/dashboard/channel/customers': 'channel:customers:view',
  '/dashboard/channel/users': 'channel:users:view',
  // 客户端
  '/dashboard/customer/users': 'customer:users:view',
  '/dashboard/customer/garments': 'customer:garments:view',
  '/dashboard/customer/templates': 'customer:templates:view',
  '/dashboard/customer/devices': 'customer:devices:view',
};

// ==================== 权限检查工具函数 ====================

export function hasPermission(role: RoleKey, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: RoleKey, permissions: PermissionKey[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasRouteAccess(role: RoleKey, path: string): boolean {
  const requiredPerm = ROUTE_PERMISSIONS[path];
  if (!requiredPerm) return true; // 无权限要求的路由默认放行
  return hasPermission(role, requiredPerm);
}
