import { PortalType } from './types';

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
  'platform:customers:create_code': 'Create activation code for customer',
  'platform:users:view': 'View all users',
  'platform:users:disable': 'Disable/Enable user',
  'platform:users:reset_password': 'Reset user password',
  'platform:garments:view': 'View garments (aggregated)',
  'platform:garments:edit': 'Edit garment (fallback)',
  'platform:garments:delete': 'Delete garment',
  'platform:templates:view': 'View templates (aggregated)',
  'platform:templates:create': 'Create new template',
  'platform:templates:edit': 'Edit template',
  'platform:templates:delete': 'Delete template',
  'platform:templates:assign': 'Assign template to customer',
  'platform:devices:view': 'View all devices (aggregated)',
  'platform:email_records:view': 'View email send records',
  'platform:website_inquiries:view': 'View website form submissions',

  // ---- 渠道端 ----
  'channel:customers:view': 'View customers',
  'channel:customers:create': 'Create channel customer',
  'channel:customers:create_code': 'Create activation code for channel customer',
  'channel:users:view': 'View customer accounts',
  'channel:users:reinvite': 'Resend invitation',
  'channel:templates:view': 'View templates',
  'channel:templates:assign': 'Assign template to customer',

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

// ==================== Portal → 权限映射 ====================

export const PORTAL_PERMISSIONS: Record<PortalType, PermissionKey[]> = {
  platform: Object.keys(PERMISSIONS) as PermissionKey[],

  channel: [
    'channel:customers:view',
    'channel:customers:create',
    'channel:customers:create_code',
    'channel:users:view',
    'channel:users:reinvite',
    'channel:templates:view',
    'channel:templates:assign',
  ],

  customer: [
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

// ==================== 路由权限映射 ====================

export const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  '/dashboard/channels': 'platform:channels:view',
  '/dashboard/customers': 'platform:customers:view',
  '/dashboard/assets/garments': 'platform:garments:view',
  '/dashboard/assets/templates': 'platform:templates:view',
  '/dashboard/assets/devices': 'platform:devices:view',
  '/dashboard/email-records': 'platform:email_records:view',
  '/dashboard/website-inquiries': 'platform:website_inquiries:view',
  // 渠道端
  '/dashboard/channel/customers': 'channel:customers:view',
  '/dashboard/channel/templates': 'channel:templates:view',
  // 客户端
  '/dashboard/customer/users': 'customer:users:view',
  '/dashboard/customer/garments': 'customer:garments:view',
  '/dashboard/customer/templates': 'customer:templates:view',
  '/dashboard/customer/devices': 'customer:devices:view',
};

// ==================== 权限检查工具函数 ====================

export function hasPermission(portal: PortalType, permission: PermissionKey): boolean {
  return PORTAL_PERMISSIONS[portal]?.includes(permission) ?? false;
}

export function hasRouteAccess(portal: PortalType, path: string): boolean {
  const requiredPerm = ROUTE_PERMISSIONS[path];
  if (!requiredPerm) return true;
  return hasPermission(portal, requiredPerm);
}
