import { RoleKey, PortalType } from './types';

// ==================== 权限 Key 定义 ====================
// 命名规则: portal:resource:action

export const PERMISSIONS = {
  // ---- 平台端 ----
  'platform:channels:view': '查看渠道列表',
  'platform:channels:create': '新建渠道',
  'platform:channels:disable': '禁用/启用渠道',
  'platform:channels:export': '导出渠道',
  'platform:customers:view': '查看客户列表',
  'platform:customers:create': '新建直客',
  'platform:customers:transfer': '变更客户归属',
  'platform:users:view': '查看全局用户',
  'platform:users:disable': '禁用/启用用户',
  'platform:users:reset_password': '重置用户密码',
  'platform:users:change_role': '变更用户角色',
  'platform:roles:view': '查看角色权限表',
  'platform:garments:view': '查看服装库(聚合)',
  'platform:garments:edit': '编辑服装(兜底)',
  'platform:templates:view': '查看模板库(聚合)',
  'platform:templates:edit': '编辑模板(兜底)',
  'platform:devices:view': '查看设备列表',
  'platform:devices:force_logout': '强制登出设备',
  'platform:devices:disable': '禁用设备',
  'platform:sessions:view': '查看会话列表',
  'platform:sessions:terminate': '终止会话',

  // ---- 渠道端 ----
  'channel:customers:view': '查看名下客户',
  'channel:customers:create': '新建渠道客户',
  'channel:users:view': '查看客户账号',
  'channel:users:reinvite': '重发邀请',
  'channel:sessions:view': '查看客户设备/会话',

  // ---- 客户端 ----
  'customer:users:view': '查看组织成员',
  'customer:users:invite': '邀请成员',
  'customer:users:disable': '禁用成员',
  'customer:users:reset_password': '重置成员密码',
  'customer:garments:view': '查看服装库',
  'customer:garments:upload': '上传/导入服装',
  'customer:garments:edit': '编辑服装',
  'customer:garments:delete': '下架/删除服装',
  'customer:templates:view': '查看模板库',
  'customer:templates:create': '新建模板',
  'customer:templates:publish': '发布模板',
  'customer:templates:rollback': '回滚模板',
  'customer:templates:disable': '停用模板',
  'customer:devices:view': '查看设备',
  'customer:devices:force_logout': '强制登出',
  'customer:sessions:view': '查看会话',
  'customer:sessions:terminate': '终止会话',
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
    'channel:sessions:view',
  ],

  ChannelOps: [
    'channel:customers:view',
    'channel:users:view',
    // 无 create / reinvite 权限
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
    'customer:templates:view',
    'customer:templates:create',
    'customer:templates:publish',
    'customer:templates:rollback',
    'customer:templates:disable',
    'customer:devices:view',
    'customer:devices:force_logout',
    'customer:sessions:view',
    'customer:sessions:terminate',
  ],

  HQOps: [
    'customer:users:view',
    'customer:garments:view',
    'customer:garments:upload',
    'customer:garments:edit',
    'customer:templates:view',
    'customer:templates:create',
    'customer:templates:publish',
    'customer:devices:view',
    'customer:sessions:view',
    // 无 invite/disable/delete/rollback/terminate 等管理权限
  ],
};

// ==================== 角色 → Portal 映射 ====================

export const ROLE_PORTAL: Record<RoleKey, PortalType> = {
  PlatformSuperAdmin: 'platform',
  ChannelOwner: 'channel',
  ChannelOps: 'channel',
  HQOwner: 'customer',
  HQOps: 'customer',
};

// ==================== 路由权限映射 ====================

export const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  '/dashboard/channels': 'platform:channels:view',
  '/dashboard/customers': 'platform:customers:view',
  '/dashboard/users': 'platform:users:view',
  '/dashboard/assets/garments': 'platform:garments:view',
  '/dashboard/assets/templates': 'platform:templates:view',
  '/dashboard/devices': 'platform:devices:view',
  '/dashboard/sessions': 'platform:sessions:view',
  // 渠道端
  '/dashboard/channel/customers': 'channel:customers:view',
  '/dashboard/channel/users': 'channel:users:view',
  '/dashboard/channel/sessions': 'channel:sessions:view',
  // 客户端
  '/dashboard/customer/users': 'customer:users:view',
  '/dashboard/customer/garments': 'customer:garments:view',
  '/dashboard/customer/templates': 'customer:templates:view',
  '/dashboard/customer/devices': 'customer:devices:view',
  '/dashboard/customer/sessions': 'customer:sessions:view',
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
