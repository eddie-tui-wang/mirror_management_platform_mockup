// ==================== 数据模型类型 ====================

export type OrgType = 'CHANNEL' | 'CUSTOMER';
export type PortalType = 'platform' | 'channel' | 'customer';
export type Status = 'Active' | 'Disabled';
export type DeviceStatus = 'Online' | 'Offline';
export type SessionStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
export type CustomerType = 'Direct' | 'Reseller';
export type CodeType = 'Regular' | 'Trial';
export type TrialStatus = 'not_trial' | 'active' | 'expired';

export interface Platform {
  platform_id: string;
  name: string;
}

export interface Organization {
  org_id: string;
  platform_id: string;
  org_type: OrgType;
  name: string;
  parent_org_id: string | null;
  status: Status;
  created_at: string;
  // Trial fields (optional, present only for trial accounts)
  is_trial?: boolean;
  trial_start_date?: string;
  trial_days?: number;
  trial_max_sales?: number;
  trial_used_sales?: number;
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
  invited_by: string | null;
  created_at: string;
}

export interface GarmentCatalog {
  catalog_id: string;
  garment_id: string;
  org_id: string;
  name: string;
  image_url: string;
  category_id: string | null;
  template_ids: string[];
  status: Status;
  updated_at: string;
}

export interface GarmentCategory {
  category_id: string;
  org_id: string;
  name: string;
  created_at: string;
}

export interface MasterTemplate {
  template_id: string;
  name: string;
  prompts: string[];
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface TemplateAssignment {
  assignment_id: string;
  template_id: string;
  org_id: string;
  enabled: boolean;
  assigned_at: string;
  assigned_by: string;
}

export interface Device {
  device_id: string;
  nickname: string | null;
  status: DeviceStatus;
  last_seen: string;
  current_org_id: string | null;
  current_org_name: string | null;
  current_user_id: string | null;
  current_user_email: string | null;
  session_start: string | null;
  is_new?: boolean;
  first_seen?: string;
}

export interface DeviceGarmentAssignment {
  device_id: string;
  catalog_id: string;
  org_id: string;
  assigned_at: string;
}

export type ActivationCodeStatus = 'Unused' | 'Bound' | 'Expired' | 'Revoked';

export interface ActivationCode {
  code_id: string;
  code: string;
  org_id: string;
  created_by_portal: 'platform' | 'channel';
  created_at: string;
  expires_at: string;                // Unused codes expire 7 days after creation
  status: ActivationCodeStatus;
  bound_device_id: string | null;
  bound_at: string | null;
  nickname: string | null;
  // Code type
  code_type: CodeType;
  // Trial-only fields (null for Regular)
  trial_duration_days: number | null;   // days of device access after binding
  trial_max_sessions: number | null;    // max try-on sessions allowed
  trial_used_sessions: number | null;   // sessions consumed so far
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
  portal: PortalType;
  org_id: string;
  org_name: string;
  password: string;
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
  permission?: string;
  children?: MenuItem[];
}
