import {
  Organization, User, OrgMembership, GarmentCatalog, TemplateSet,
  Device, Session, DemoAccount,
} from './types';

// ==================== 组织数据 ====================

export const organizations: Organization[] = [
  // 渠道
  { org_id: 'org_ch_001', platform_id: 'p1', org_type: 'CHANNEL', name: '渠道A', parent_org_id: null, status: 'Active', created_at: '2026-02-01' },
  { org_id: 'org_ch_002', platform_id: 'p1', org_type: 'CHANNEL', name: '渠道B', parent_org_id: null, status: 'Disabled', created_at: '2026-01-15' },
  { org_id: 'org_ch_003', platform_id: 'p1', org_type: 'CHANNEL', name: '渠道C', parent_org_id: null, status: 'Active', created_at: '2026-01-20' },
  // 客户（直客）
  { org_id: 'org_cu_1001', platform_id: 'p1', org_type: 'CUSTOMER', name: '客户X', parent_org_id: null, status: 'Active', created_at: '2026-02-03' },
  { org_id: 'org_cu_1004', platform_id: 'p1', org_type: 'CUSTOMER', name: '客户W', parent_org_id: null, status: 'Active', created_at: '2026-02-07' },
  // 客户（渠道客户）
  { org_id: 'org_cu_1002', platform_id: 'p1', org_type: 'CUSTOMER', name: '客户Y', parent_org_id: 'org_ch_001', status: 'Active', created_at: '2026-02-05' },
  { org_id: 'org_cu_1003', platform_id: 'p1', org_type: 'CUSTOMER', name: '客户Z', parent_org_id: 'org_ch_001', status: 'Active', created_at: '2026-02-06' },
  { org_id: 'org_cu_1005', platform_id: 'p1', org_type: 'CUSTOMER', name: '客户V', parent_org_id: 'org_ch_003', status: 'Active', created_at: '2026-02-08' },
];

// ==================== 用户数据 ====================

export const users: User[] = [
  // 平台
  { user_id: 'u_super', email: 'super@platform.com', name: '平台超管', status: 'Active', last_login: '2026-02-10 10:00', current_device: null },
  // 渠道A
  { user_id: 'u_001', email: 'admin@channel-a.com', name: 'Alice Chen', status: 'Active', last_login: '2026-02-10 10:01', current_device: 'dev_09' },
  { user_id: 'u_004', email: 'ops@channel-a.com', name: 'Bob Li', status: 'Active', last_login: '2026-02-09 15:30', current_device: null },
  // 渠道B
  { user_id: 'u_005', email: 'owner@channel-b.com', name: 'Carol Wang', status: 'Active', last_login: '2026-02-08 11:20', current_device: null },
  // 渠道C
  { user_id: 'u_015', email: 'admin@channel-c.com', name: 'Frank Zhao', status: 'Active', last_login: '2026-02-10 09:00', current_device: null },
  // 客户X
  { user_id: 'u_002', email: 'hq.admin@x.com', name: 'David Zhang', status: 'Active', last_login: '2026-02-10 09:20', current_device: 'dev_09' },
  { user_id: 'u_006', email: 'ops1@x.com', name: 'Eva Liu', status: 'Active', last_login: '2026-02-09 18:00', current_device: null },
  { user_id: 'u_007', email: 'ops2@x.com', name: 'George Sun', status: 'Disabled', last_login: '2026-02-05 12:00', current_device: null },
  { user_id: 'u_016', email: 'sales@x.com', name: 'Ivy Xu', status: 'Active', last_login: '2026-02-10 08:30', current_device: null },
  // 客户Y
  { user_id: 'u_010', email: 'owner@y.com', name: 'Henry Qian', status: 'Active', last_login: '2026-02-10 08:15', current_device: null },
  { user_id: 'u_011', email: 'ops@y.com', name: 'Iris Fan', status: 'Active', last_login: '2026-02-09 19:02', current_device: null },
  // 客户Z
  { user_id: 'u_012', email: 'admin@z.com', name: 'Jack Ding', status: 'Active', last_login: '2026-02-10 09:05', current_device: 'dev_15' },
  { user_id: 'u_013', email: 'ops@z.com', name: 'Karen Wu', status: 'Active', last_login: '2026-02-09 20:30', current_device: null },
  // 客户W
  { user_id: 'u_014', email: 'admin@w.com', name: 'Leo Ma', status: 'Active', last_login: '2026-02-10 07:50', current_device: null },
  // 客户V
  { user_id: 'u_017', email: 'admin@v.com', name: 'Mia Hou', status: 'Active', last_login: '2026-02-10 08:45', current_device: null },
];

// ==================== 组织成员关系 ====================

export const memberships: OrgMembership[] = [
  // 渠道A
  { user_id: 'u_001', org_id: 'org_ch_001', role_key: 'ChannelOwner', invited_by: null, created_at: '2026-02-01' },
  { user_id: 'u_004', org_id: 'org_ch_001', role_key: 'ChannelOps', invited_by: 'u_001', created_at: '2026-02-02' },
  // 渠道B
  { user_id: 'u_005', org_id: 'org_ch_002', role_key: 'ChannelOwner', invited_by: null, created_at: '2026-01-15' },
  // 渠道C
  { user_id: 'u_015', org_id: 'org_ch_003', role_key: 'ChannelOwner', invited_by: null, created_at: '2026-01-20' },
  // 客户X
  { user_id: 'u_002', org_id: 'org_cu_1001', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-03' },
  { user_id: 'u_006', org_id: 'org_cu_1001', role_key: 'HQOps', invited_by: 'u_002', created_at: '2026-02-03' },
  { user_id: 'u_007', org_id: 'org_cu_1001', role_key: 'HQOps', invited_by: 'u_002', created_at: '2026-02-04' },
  { user_id: 'u_016', org_id: 'org_cu_1001', role_key: 'HQOps', invited_by: 'u_002', created_at: '2026-02-05' },
  // 客户Y
  { user_id: 'u_010', org_id: 'org_cu_1002', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-05' },
  { user_id: 'u_011', org_id: 'org_cu_1002', role_key: 'HQOps', invited_by: 'u_010', created_at: '2026-02-05' },
  // 客户Z
  { user_id: 'u_012', org_id: 'org_cu_1003', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-06' },
  { user_id: 'u_013', org_id: 'org_cu_1003', role_key: 'HQOps', invited_by: 'u_012', created_at: '2026-02-06' },
  // 客户W
  { user_id: 'u_014', org_id: 'org_cu_1004', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-07' },
  // 客户V
  { user_id: 'u_017', org_id: 'org_cu_1005', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-08' },
];

// ==================== 服装库 ====================

export const garments: GarmentCatalog[] = [
  { catalog_id: 'cat_01', garment_id: 'g_9001', org_id: 'org_cu_1001', name: 'Black Suit Set', status: 'Active', updated_at: '2026-02-09 18:32' },
  { catalog_id: 'cat_02', garment_id: 'g_9002', org_id: 'org_ch_001', name: 'Summer Dress', status: 'Active', updated_at: '2026-02-08 11:05' },
  { catalog_id: 'cat_03', garment_id: 'g_9003', org_id: 'org_cu_1001', name: 'Casual Jacket', status: 'Active', updated_at: '2026-02-07 14:22' },
  { catalog_id: 'cat_04', garment_id: 'g_9004', org_id: 'org_cu_1002', name: 'Winter Coat', status: 'Active', updated_at: '2026-02-06 09:10' },
  { catalog_id: 'cat_05', garment_id: 'g_9005', org_id: 'org_cu_1003', name: 'Silk Blouse', status: 'Disabled', updated_at: '2026-02-05 16:45' },
  { catalog_id: 'cat_06', garment_id: 'g_9006', org_id: 'org_ch_003', name: 'Denim Series', status: 'Active', updated_at: '2026-02-04 12:00' },
  { catalog_id: 'cat_07', garment_id: 'g_9007', org_id: 'org_cu_1001', name: 'Evening Gown', status: 'Active', updated_at: '2026-02-03 20:15' },
  { catalog_id: 'cat_08', garment_id: 'g_9008', org_id: 'org_cu_1004', name: 'Sport Wear', status: 'Active', updated_at: '2026-02-02 10:30' },
];

// ==================== 模板库 ====================

export const templates: TemplateSet[] = [
  { template_set_id: 'ts_01', template_id: 't_001', org_id: 'org_cu_1001', name: '春季主题模板', version: 'v2.1', status: 'Active', updated_at: '2026-02-09 17:00' },
  { template_set_id: 'ts_02', template_id: 't_002', org_id: 'org_ch_001', name: '品牌展示模板', version: 'v1.0', status: 'Active', updated_at: '2026-02-08 10:00' },
  { template_set_id: 'ts_03', template_id: 't_003', org_id: 'org_cu_1002', name: '简约试衣模板', version: 'v1.3', status: 'Active', updated_at: '2026-02-07 14:00' },
  { template_set_id: 'ts_04', template_id: 't_004', org_id: 'org_cu_1001', name: '促销活动模板', version: 'v3.0', status: 'Disabled', updated_at: '2026-02-06 11:00' },
  { template_set_id: 'ts_05', template_id: 't_005', org_id: 'org_cu_1003', name: '门店导购模板', version: 'v1.1', status: 'Active', updated_at: '2026-02-05 09:00' },
  { template_set_id: 'ts_06', template_id: 't_006', org_id: 'org_ch_003', name: '渠道通用模板', version: 'v2.0', status: 'Active', updated_at: '2026-02-04 15:00' },
];

// ==================== 设备数据 ====================

export const devices: Device[] = [
  { device_id: 'dev_09', status: 'Online', last_seen: '2026-02-10 10:05', current_org_id: 'org_cu_1001', current_org_name: '客户X', current_user_id: 'u_002', current_user_email: 'hq.admin@x.com', session_start: '2026-02-10 09:55' },
  { device_id: 'dev_12', status: 'Offline', last_seen: '2026-02-09 21:10', current_org_id: 'org_cu_1002', current_org_name: '客户Y', current_user_id: null, current_user_email: null, session_start: null },
  { device_id: 'dev_15', status: 'Online', last_seen: '2026-02-10 09:30', current_org_id: 'org_cu_1003', current_org_name: '客户Z', current_user_id: 'u_012', current_user_email: 'admin@z.com', session_start: '2026-02-10 09:00' },
  { device_id: 'dev_07', status: 'Offline', last_seen: '2026-02-10 09:12', current_org_id: 'org_ch_001', current_org_name: '渠道A', current_user_id: null, current_user_email: null, session_start: null },
  { device_id: 'dev_20', status: 'Online', last_seen: '2026-02-10 10:08', current_org_id: 'org_cu_1001', current_org_name: '客户X', current_user_id: 'u_006', current_user_email: 'ops1@x.com', session_start: '2026-02-10 08:30' },
  { device_id: 'dev_22', status: 'Offline', last_seen: '2026-02-08 18:00', current_org_id: 'org_cu_1004', current_org_name: '客户W', current_user_id: null, current_user_email: null, session_start: null },
];

// ==================== 会话数据 ====================

export const sessions: Session[] = [
  { session_id: 's_001', device_id: 'dev_09', user_id: 'u_002', user_email: 'hq.admin@x.com', org_id: 'org_cu_1001', org_name: '客户X', status: 'ACTIVE', login_at: '2026-02-10 09:55', logout_at: null, termination_reason: null },
  { session_id: 's_002', device_id: 'dev_07', user_id: 'u_001', user_email: 'admin@channel-a.com', org_id: 'org_ch_001', org_name: '渠道A', status: 'TERMINATED', login_at: '2026-02-10 09:10', logout_at: '2026-02-10 09:12', termination_reason: 'NEW_LOGIN_KICK' },
  { session_id: 's_003', device_id: 'dev_15', user_id: 'u_012', user_email: 'admin@z.com', org_id: 'org_cu_1003', org_name: '客户Z', status: 'ACTIVE', login_at: '2026-02-10 09:00', logout_at: null, termination_reason: null },
  { session_id: 's_004', device_id: 'dev_20', user_id: 'u_006', user_email: 'ops1@x.com', org_id: 'org_cu_1001', org_name: '客户X', status: 'ACTIVE', login_at: '2026-02-10 08:30', logout_at: null, termination_reason: null },
  { session_id: 's_005', device_id: 'dev_12', user_id: 'u_010', user_email: 'owner@y.com', org_id: 'org_cu_1002', org_name: '客户Y', status: 'EXPIRED', login_at: '2026-02-09 20:00', logout_at: '2026-02-09 21:10', termination_reason: 'SESSION_EXPIRED' },
  { session_id: 's_006', device_id: 'dev_22', user_id: 'u_014', user_email: 'admin@w.com', org_id: 'org_cu_1004', org_name: '客户W', status: 'TERMINATED', login_at: '2026-02-08 16:00', logout_at: '2026-02-08 18:00', termination_reason: 'USER_LOGOUT' },
];

// ==================== Demo 账号 ====================

export const demoAccounts: DemoAccount[] = [
  { user_id: 'u_super', email: 'super@platform.com', name: '平台超管', role: 'PlatformSuperAdmin', portal: 'platform', org_id: 'platform', org_name: '试衣镜平台', password: 'demo' },
  { user_id: 'u_001', email: 'admin@channel-a.com', name: 'Alice Chen', role: 'ChannelOwner', portal: 'channel', org_id: 'org_ch_001', org_name: '渠道A', password: 'demo' },
  { user_id: 'u_004', email: 'ops@channel-a.com', name: 'Bob Li', role: 'ChannelOps', portal: 'channel', org_id: 'org_ch_001', org_name: '渠道A', password: 'demo' },
  { user_id: 'u_002', email: 'hq.admin@x.com', name: 'David Zhang', role: 'HQOwner', portal: 'customer', org_id: 'org_cu_1001', org_name: '客户X', password: 'demo' },
  { user_id: 'u_006', email: 'ops1@x.com', name: 'Eva Liu', role: 'HQOps', portal: 'customer', org_id: 'org_cu_1001', org_name: '客户X', password: 'demo' },
];

// ==================== 辅助函数 ====================

export function getOrgById(orgId: string) {
  return organizations.find(o => o.org_id === orgId);
}

export function getOrgMembers(orgId: string) {
  const memberIds = memberships.filter(m => m.org_id === orgId).map(m => m.user_id);
  return users.filter(u => memberIds.includes(u.user_id));
}

export function getMembershipInfo(userId: string, orgId: string) {
  return memberships.find(m => m.user_id === userId && m.org_id === orgId);
}

export function getChannelCustomers(channelOrgId: string) {
  return organizations.filter(o => o.org_type === 'CUSTOMER' && o.parent_org_id === channelOrgId);
}

export function getChannelCustomerUserIds(channelOrgId: string) {
  const customerOrgIds = getChannelCustomers(channelOrgId).map(o => o.org_id);
  return memberships.filter(m => customerOrgIds.includes(m.org_id)).map(m => m.user_id);
}

export function getOrgGarments(orgId: string) {
  return garments.filter(g => g.org_id === orgId);
}

export function getOrgTemplates(orgId: string) {
  return templates.filter(t => t.org_id === orgId);
}

export function getOrgDevices(orgId: string) {
  return devices.filter(d => d.current_org_id === orgId);
}

export function getOrgSessions(orgId: string) {
  return sessions.filter(s => s.org_id === orgId);
}

/** 获取渠道的汇总信息 */
export function getChannelSummary(channelOrgId: string) {
  const members = memberships.filter(m => m.org_id === channelOrgId);
  const customerCount = organizations.filter(o => o.parent_org_id === channelOrgId).length;
  const admin = members.find(m => m.role_key === 'ChannelOwner');
  const adminUser = admin ? users.find(u => u.user_id === admin.user_id) : null;
  return {
    memberCount: members.length,
    customerCount,
    adminEmail: adminUser?.email ?? '-',
    adminName: adminUser?.name ?? '-',
  };
}

/** 获取客户的汇总信息 */
export function getCustomerSummary(customerOrgId: string) {
  const members = memberships.filter(m => m.org_id === customerOrgId);
  const onlineDevices = devices.filter(d => d.current_org_id === customerOrgId && d.status === 'Online').length;
  const admin = members.find(m => m.role_key === 'HQOwner');
  const adminUser = admin ? users.find(u => u.user_id === admin.user_id) : null;
  const parentOrg = organizations.find(o => o.org_id === customerOrgId);
  const channelOrg = parentOrg?.parent_org_id ? organizations.find(o => o.org_id === parentOrg.parent_org_id) : null;
  return {
    memberCount: members.length,
    onlineDeviceCount: onlineDevices,
    adminEmail: adminUser?.email ?? '-',
    adminName: adminUser?.name ?? '-',
    customerType: parentOrg?.parent_org_id ? 'Reseller' as const : 'Direct' as const,
    channelName: channelOrg?.name ?? '-',
    channelOrgId: channelOrg?.org_id ?? null,
  };
}
