// ==================== 数据模型类型 ====================

export type OrgType = 'CHANNEL' | 'CUSTOMER';
export type RoleKey = 'PlatformSuperAdmin' | 'ChannelOwner' | 'ChannelOps' | 'HQOwner' | 'HQOps';
export type PortalType = 'platform' | 'channel' | 'customer';
export type Status = 'Active' | 'Disabled';
export type DeviceStatus = 'Online' | 'Offline';
export type SessionStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
export type CustomerType = 'Direct' | 'Reseller';

export interface Platform {
  platform_id: string;
  name: string;
}

export interface Organization {
  org_id: string;
  platform_id: string;
  org_type: OrgType;
  name: string;
  parent_org_id: string | null; // 渠道客户指向所属渠道
  status: Status;
  created_at: string;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  status: Status;
  last_login: string | null;
  current_device: string | null;
}

export interface OrgMembership {
  user_id: string;
  org_id: string;
  role_key: RoleKey;
  invited_by: string | null;
  created_at: string;
}

export interface GarmentCatalog {
  catalog_id: string;
  garment_id: string;
  org_id: string;
  name: string;
  status: Status;
  updated_at: string;
}

export interface TemplateSet {
  template_set_id: string;
  template_id: string;
  org_id: string;
  name: string;
  version: string;
  status: Status;
  updated_at: string;
}

export interface Device {
  device_id: string;
  status: DeviceStatus;
  last_seen: string;
  current_org_id: string | null;
  current_org_name: string | null;
  current_user_id: string | null;
  current_user_email: string | null;
  session_start: string | null;
}

export interface Session {
  session_id: string;
  device_id: string;
  user_id: string;
  user_email: string;
  org_id: string;
  org_name: string;
  status: SessionStatus;
  login_at: string;
  logout_at: string | null;
  termination_reason: string | null;
}

// ==================== 认证相关 ====================

export interface DemoAccount {
  user_id: string;
  email: string;
  name: string;
  role: RoleKey;
  portal: PortalType;
  org_id: string;
  org_name: string;
  password: string; // demo 密码
}

export interface AuthState {
  currentUser: DemoAccount | null;
  isAuthenticated: boolean;
  login: (account: DemoAccount) => void;
  logout: () => void;
}

// ==================== 菜单与路由 ====================

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  permission?: string; // 需要的 permission_key
  children?: MenuItem[];
}
