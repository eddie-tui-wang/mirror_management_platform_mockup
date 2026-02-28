import dayjs from 'dayjs';
import {
  Organization, User, OrgMembership, GarmentCatalog, GarmentCategory,
  MasterTemplate, TemplateAssignment, Device, DeviceGarmentAssignment, Session, DemoAccount,
  ActivationCode,
} from './types';

// ==================== 组织数据 ====================

export const organizations: Organization[] = [
  // 渠道
  { org_id: 'org_ch_001', platform_id: 'p1', org_type: 'CHANNEL', name: 'Channel A', parent_org_id: null, status: 'Active', created_at: '2026-02-01' },
  { org_id: 'org_ch_002', platform_id: 'p1', org_type: 'CHANNEL', name: 'Channel B', parent_org_id: null, status: 'Disabled', created_at: '2026-01-15' },
  { org_id: 'org_ch_003', platform_id: 'p1', org_type: 'CHANNEL', name: 'Channel C', parent_org_id: null, status: 'Active', created_at: '2026-01-20' },
  // 客户（直客）
  { org_id: 'org_cu_1001', platform_id: 'p1', org_type: 'CUSTOMER', name: 'Customer X', parent_org_id: null, status: 'Active', created_at: '2026-02-03' },
  { org_id: 'org_cu_1004', platform_id: 'p1', org_type: 'CUSTOMER', name: 'Customer W', parent_org_id: null, status: 'Active', created_at: '2026-02-07' },
  // 客户（渠道客户）
  { org_id: 'org_cu_1002', platform_id: 'p1', org_type: 'CUSTOMER', name: 'Customer Y', parent_org_id: 'org_ch_001', status: 'Active', created_at: '2026-02-05' },
  { org_id: 'org_cu_1003', platform_id: 'p1', org_type: 'CUSTOMER', name: 'Customer Z', parent_org_id: 'org_ch_001', status: 'Active', created_at: '2026-02-06' },
  { org_id: 'org_cu_1005', platform_id: 'p1', org_type: 'CUSTOMER', name: 'Customer V', parent_org_id: 'org_ch_003', status: 'Active', created_at: '2026-01-20' },
];

// ==================== 用户数据 ====================

export const users: User[] = [
  // 平台
  { user_id: 'u_super', email: 'super@platform.com', name: 'Platform Admin', status: 'Active', last_login: '2026-02-10 10:00', current_device: null },
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
  { user_id: 'u_004', org_id: 'org_ch_001', role_key: 'ChannelOwner', invited_by: 'u_001', created_at: '2026-02-02' },
  // 渠道B
  { user_id: 'u_005', org_id: 'org_ch_002', role_key: 'ChannelOwner', invited_by: null, created_at: '2026-01-15' },
  // 渠道C
  { user_id: 'u_015', org_id: 'org_ch_003', role_key: 'ChannelOwner', invited_by: null, created_at: '2026-01-20' },
  // 客户X
  { user_id: 'u_002', org_id: 'org_cu_1001', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-03' },
  { user_id: 'u_006', org_id: 'org_cu_1001', role_key: 'HQOwner', invited_by: 'u_002', created_at: '2026-02-03' },
  { user_id: 'u_007', org_id: 'org_cu_1001', role_key: 'HQOwner', invited_by: 'u_002', created_at: '2026-02-04' },
  { user_id: 'u_016', org_id: 'org_cu_1001', role_key: 'HQOwner', invited_by: 'u_002', created_at: '2026-02-05' },
  // 客户Y
  { user_id: 'u_010', org_id: 'org_cu_1002', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-05' },
  { user_id: 'u_011', org_id: 'org_cu_1002', role_key: 'HQOwner', invited_by: 'u_010', created_at: '2026-02-05' },
  // 客户Z
  { user_id: 'u_012', org_id: 'org_cu_1003', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-06' },
  { user_id: 'u_013', org_id: 'org_cu_1003', role_key: 'HQOwner', invited_by: 'u_012', created_at: '2026-02-06' },
  // 客户W
  { user_id: 'u_014', org_id: 'org_cu_1004', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-07' },
  // 客户V
  { user_id: 'u_017', org_id: 'org_cu_1005', role_key: 'HQOwner', invited_by: null, created_at: '2026-02-08' },
];

// ==================== 服装库 ====================

export const garments: GarmentCatalog[] = [
  // Customer X (org_cu_1001): assigned templates tpl_001, tpl_003, tpl_006
  { catalog_id: 'cat_01', garment_id: 'g_9001', org_id: 'org_cu_1001', name: 'Black Suit Set',  image_url: 'https://picsum.photos/seed/g9001/80/80', category_id: 'gc_01', template_ids: ['tpl_001', 'tpl_006'], status: 'Active',   updated_at: '2026-02-09 18:32' },
  { catalog_id: 'cat_03', garment_id: 'g_9003', org_id: 'org_cu_1001', name: 'Casual Jacket',   image_url: 'https://picsum.photos/seed/g9003/80/80', category_id: 'gc_03', template_ids: ['tpl_003'],         status: 'Active',   updated_at: '2026-02-07 14:22' },
  { catalog_id: 'cat_07', garment_id: 'g_9007', org_id: 'org_cu_1001', name: 'Evening Gown',    image_url: 'https://picsum.photos/seed/g9007/80/80', category_id: 'gc_02', template_ids: ['tpl_001', 'tpl_003', 'tpl_006'], status: 'Active', updated_at: '2026-02-03 20:15' },
  // Customer Y (org_cu_1002): assigned templates tpl_002, tpl_003
  { catalog_id: 'cat_04', garment_id: 'g_9004', org_id: 'org_cu_1002', name: 'Winter Coat',     image_url: 'https://picsum.photos/seed/g9004/80/80', category_id: 'gc_07', template_ids: ['tpl_002'],         status: 'Active',   updated_at: '2026-02-06 09:10' },
  // Customer Z (org_cu_1003): assigned templates tpl_005, tpl_006, tpl_010
  { catalog_id: 'cat_05', garment_id: 'g_9005', org_id: 'org_cu_1003', name: 'Silk Blouse',     image_url: 'https://picsum.photos/seed/g9005/80/80', category_id: null,    template_ids: [],                 status: 'Disabled', updated_at: '2026-02-05 16:45' },
  // Customer W (org_cu_1004): assigned templates tpl_001, tpl_007
  { catalog_id: 'cat_08', garment_id: 'g_9008', org_id: 'org_cu_1004', name: 'Sport Wear',      image_url: 'https://picsum.photos/seed/g9008/80/80', category_id: null,    template_ids: ['tpl_007'],        status: 'Active',   updated_at: '2026-02-02 10:30' },
  // Channel-owned (no customer template assignments)
  { catalog_id: 'cat_02', garment_id: 'g_9002', org_id: 'org_ch_001',  name: 'Summer Dress',    image_url: 'https://picsum.photos/seed/g9002/80/80', category_id: null,    template_ids: [],                 status: 'Active',   updated_at: '2026-02-08 11:05' },
  { catalog_id: 'cat_06', garment_id: 'g_9006', org_id: 'org_ch_003',  name: 'Denim Series',    image_url: 'https://picsum.photos/seed/g9006/80/80', category_id: null,    template_ids: [],                 status: 'Active',   updated_at: '2026-02-04 12:00' },
];

// ==================== 服装分类（客户端管理） ====================

export const garmentCategories: GarmentCategory[] = [
  // 客户X (org_cu_1001)
  { category_id: 'gc_01', org_id: 'org_cu_1001', name: 'Tops', created_at: '2026-02-01' },
  { category_id: 'gc_02', org_id: 'org_cu_1001', name: 'Dresses', created_at: '2026-02-01' },
  { category_id: 'gc_03', org_id: 'org_cu_1001', name: 'Outerwear', created_at: '2026-02-02' },
  { category_id: 'gc_04', org_id: 'org_cu_1001', name: 'Accessories', created_at: '2026-02-03' },
  // 客户Y (org_cu_1002)
  { category_id: 'gc_05', org_id: 'org_cu_1002', name: 'Tops', created_at: '2026-02-05' },
  { category_id: 'gc_06', org_id: 'org_cu_1002', name: 'Bottoms', created_at: '2026-02-05' },
  { category_id: 'gc_07', org_id: 'org_cu_1002', name: 'Outerwear', created_at: '2026-02-05' },
  // 客户Z (org_cu_1003)
  { category_id: 'gc_08', org_id: 'org_cu_1003', name: 'Formal', created_at: '2026-02-06' },
  { category_id: 'gc_09', org_id: 'org_cu_1003', name: 'Casual', created_at: '2026-02-06' },
];

// ==================== 主模板库（平台统一管理的模块化场景） ====================

export const masterTemplates: MasterTemplate[] = [
  { template_id: 'tpl_001', name: 'Daily Life Scene', prompts: ['Casual daily outfit recommendation', 'Seasonal outfit matching', 'Accessory pairing suggestion'], status: 'Active', created_at: '2026-01-10 09:00', updated_at: '2026-02-09 17:00' },
  { template_id: 'tpl_002', name: 'Brand Showcase', prompts: ['Display brand story and heritage', 'Highlight signature products', 'Show latest collection lookbook'], status: 'Active', created_at: '2026-01-12 10:00', updated_at: '2026-02-08 10:00' },
  { template_id: 'tpl_003', name: 'Fitting Room', prompts: ['Virtual try-on with body scan', 'Suggest matching items', 'Show size recommendation'], status: 'Active', created_at: '2026-01-14 14:00', updated_at: '2026-02-07 14:00' },
  { template_id: 'tpl_004', name: 'Holiday Promotion', prompts: ['Show limited-time offers', 'Countdown timer for flash sale', 'Gift bundle recommendation', 'Loyalty points reminder'], status: 'Active', created_at: '2026-01-05 11:00', updated_at: '2026-02-06 11:00' },
  { template_id: 'tpl_005', name: 'Store Guide', prompts: ['Interactive floor map navigation', 'Product location finder', 'Department directory display'], status: 'Active', created_at: '2026-01-18 09:00', updated_at: '2026-02-05 09:00' },
  { template_id: 'tpl_006', name: 'Lookbook', prompts: ['Swipeable outfit gallery', 'Style inspiration feed', 'Cross-sell related items', 'Save favorite looks'], status: 'Active', created_at: '2026-01-20 15:00', updated_at: '2026-02-04 15:00' },
  { template_id: 'tpl_007', name: 'Summer Collection', prompts: ['Feature summer new arrivals', 'Beach and resort outfit ideas', 'Lightweight fabric highlights'], status: 'Active', created_at: '2026-01-25 12:00', updated_at: '2026-02-03 12:00' },
  { template_id: 'tpl_008', name: 'VIP Welcome', prompts: ['Personalized greeting by name', 'Show purchase history highlights', 'Exclusive VIP offers', 'Loyalty tier and rewards'], status: 'Active', created_at: '2026-01-28 10:00', updated_at: '2026-02-02 10:00' },
  { template_id: 'tpl_009', name: 'Product Comparison', prompts: ['Side-by-side spec comparison', 'Price and value analysis'], status: 'Disabled', created_at: '2026-01-30 08:00', updated_at: '2026-02-01 08:00' },
  { template_id: 'tpl_010', name: 'Winter Theme', prompts: ['Winter holiday gift guide', 'Cozy outfit recommendations', 'Seasonal color palette showcase', 'Gift wrapping options'], status: 'Active', created_at: '2026-01-08 16:00', updated_at: '2026-01-30 16:00' },
];

// ==================== 模板分配记录（平台管理员分配给客户） ====================

export const templateAssignments: TemplateAssignment[] = [
  // 客户X (org_cu_1001) - 4个模板
  { assignment_id: 'ta_001', template_id: 'tpl_001', org_id: 'org_cu_1001', enabled: true,  assigned_at: '2026-02-01 10:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_002', template_id: 'tpl_003', org_id: 'org_cu_1001', enabled: true,  assigned_at: '2026-02-01 10:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_003', template_id: 'tpl_004', org_id: 'org_cu_1001', enabled: false, assigned_at: '2026-02-02 14:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_004', template_id: 'tpl_006', org_id: 'org_cu_1001', enabled: true,  assigned_at: '2026-02-03 09:00', assigned_by: 'u_super' },
  // 客户Y (org_cu_1002) - 3个模板
  { assignment_id: 'ta_005', template_id: 'tpl_002', org_id: 'org_cu_1002', enabled: true,  assigned_at: '2026-02-05 11:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_006', template_id: 'tpl_003', org_id: 'org_cu_1002', enabled: true,  assigned_at: '2026-02-05 11:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_007', template_id: 'tpl_008', org_id: 'org_cu_1002', enabled: false, assigned_at: '2026-02-06 10:00', assigned_by: 'u_super' },
  // 客户Z (org_cu_1003) - 3个模板
  { assignment_id: 'ta_008', template_id: 'tpl_005', org_id: 'org_cu_1003', enabled: true,  assigned_at: '2026-02-06 12:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_009', template_id: 'tpl_006', org_id: 'org_cu_1003', enabled: true,  assigned_at: '2026-02-06 12:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_010', template_id: 'tpl_010', org_id: 'org_cu_1003', enabled: true,  assigned_at: '2026-02-07 09:00', assigned_by: 'u_super' },
  // 客户W (org_cu_1004) - 2个模板（试用账户）
  { assignment_id: 'ta_011', template_id: 'tpl_001', org_id: 'org_cu_1004', enabled: true,  assigned_at: '2026-02-07 14:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_012', template_id: 'tpl_007', org_id: 'org_cu_1004', enabled: true,  assigned_at: '2026-02-07 14:00', assigned_by: 'u_super' },
  // 客户V (org_cu_1005) - 2个模板（试用账户）
  { assignment_id: 'ta_013', template_id: 'tpl_004', org_id: 'org_cu_1005', enabled: true,  assigned_at: '2026-02-08 10:00', assigned_by: 'u_super' },
  { assignment_id: 'ta_014', template_id: 'tpl_005', org_id: 'org_cu_1005', enabled: false, assigned_at: '2026-02-08 10:00', assigned_by: 'u_super' },
];

// ==================== 设备数据 ====================

export const devices: Device[] = [
  { device_id: 'dev_09', nickname: 'Front Door Mirror',  status: 'Online',  last_seen: '2026-02-10 10:05', current_org_id: 'org_cu_1001', current_org_name: 'Customer X', current_user_id: 'u_002', current_user_email: 'hq.admin@x.com', session_start: '2026-02-10 09:55' },
  { device_id: 'dev_20', nickname: 'Fitting Room #2',    status: 'Online',  last_seen: '2026-02-10 10:08', current_org_id: 'org_cu_1001', current_org_name: 'Customer X', current_user_id: 'u_006', current_user_email: 'ops1@x.com',    session_start: '2026-02-10 08:30' },
  // ── 新设备：首次登录 Customer X，尚未被管理员确认 ──
  { device_id: 'dev_31', nickname: null, status: 'Online',  last_seen: '2026-02-10 10:22', current_org_id: 'org_cu_1001', current_org_name: 'Customer X', current_user_id: 'u_016', current_user_email: 'sales@x.com',       session_start: '2026-02-10 10:22', is_new: true, first_seen: '2026-02-10 10:22' },
  { device_id: 'dev_34', nickname: null, status: 'Online',  last_seen: '2026-02-10 10:35', current_org_id: 'org_cu_1001', current_org_name: 'Customer X', current_user_id: 'u_006', current_user_email: 'ops1@x.com',        session_start: '2026-02-10 10:35', is_new: true, first_seen: '2026-02-10 10:35' },
  // ── 其他 org 设备 ──
  { device_id: 'dev_12', nickname: 'VIP Lounge',         status: 'Offline', last_seen: '2026-02-09 21:10', current_org_id: 'org_cu_1002', current_org_name: 'Customer Y', current_user_id: null,    current_user_email: null,            session_start: null },
  { device_id: 'dev_15', nickname: null,                  status: 'Online',  last_seen: '2026-02-10 09:30', current_org_id: 'org_cu_1003', current_org_name: 'Customer Z', current_user_id: 'u_012', current_user_email: 'admin@z.com',   session_start: '2026-02-10 09:00' },
  { device_id: 'dev_07', nickname: 'Showroom A',          status: 'Offline', last_seen: '2026-02-10 09:12', current_org_id: null,          current_org_name: null,         current_user_id: null,    current_user_email: null,            session_start: null },
  { device_id: 'dev_22', nickname: null,                  status: 'Offline', last_seen: '2026-02-08 18:00', current_org_id: 'org_cu_1004', current_org_name: 'Customer W', current_user_id: null,    current_user_email: null,            session_start: null },
];

// ==================== 设备-服装分配 ====================

export const deviceGarmentAssignments: DeviceGarmentAssignment[] = [
  // Customer X: dev_09 (Front Door Mirror)
  { device_id: 'dev_09', catalog_id: 'cat_01', org_id: 'org_cu_1001', assigned_at: '2026-02-08 10:00' },
  { device_id: 'dev_09', catalog_id: 'cat_03', org_id: 'org_cu_1001', assigned_at: '2026-02-08 10:00' },
  { device_id: 'dev_09', catalog_id: 'cat_07', org_id: 'org_cu_1001', assigned_at: '2026-02-08 11:00' },
  // Customer X: dev_20 (Fitting Room #2)
  { device_id: 'dev_20', catalog_id: 'cat_01', org_id: 'org_cu_1001', assigned_at: '2026-02-09 09:00' },
  { device_id: 'dev_20', catalog_id: 'cat_07', org_id: 'org_cu_1001', assigned_at: '2026-02-09 09:00' },
  // Customer Y: dev_12 (VIP Lounge)
  { device_id: 'dev_12', catalog_id: 'cat_04', org_id: 'org_cu_1002', assigned_at: '2026-02-07 14:00' },
  // Customer Z: dev_15
  { device_id: 'dev_15', catalog_id: 'cat_05', org_id: 'org_cu_1003', assigned_at: '2026-02-07 16:00' },
];

// ==================== 会话数据 ====================

export const sessions: Session[] = [
  { session_id: 's_001', device_id: 'dev_09', user_id: 'u_002', user_email: 'hq.admin@x.com', org_id: 'org_cu_1001', org_name: 'Customer X', status: 'ACTIVE', login_at: '2026-02-10 09:55', logout_at: null, termination_reason: null },
  // s_002 removed: channel accounts cannot log in to devices
  { session_id: 's_003', device_id: 'dev_15', user_id: 'u_012', user_email: 'admin@z.com', org_id: 'org_cu_1003', org_name: 'Customer Z', status: 'ACTIVE', login_at: '2026-02-10 09:00', logout_at: null, termination_reason: null },
  { session_id: 's_004', device_id: 'dev_20', user_id: 'u_006', user_email: 'ops1@x.com', org_id: 'org_cu_1001', org_name: 'Customer X', status: 'ACTIVE', login_at: '2026-02-10 08:30', logout_at: null, termination_reason: null },
  { session_id: 's_005', device_id: 'dev_12', user_id: 'u_010', user_email: 'owner@y.com', org_id: 'org_cu_1002', org_name: 'Customer Y', status: 'EXPIRED', login_at: '2026-02-09 20:00', logout_at: '2026-02-09 21:10', termination_reason: 'SESSION_EXPIRED' },
  { session_id: 's_006', device_id: 'dev_22', user_id: 'u_014', user_email: 'admin@w.com',    org_id: 'org_cu_1004', org_name: 'Customer W', status: 'TERMINATED', login_at: '2026-02-08 16:00', logout_at: '2026-02-08 18:00', termination_reason: 'USER_LOGOUT' },
  // 新设备首次登录 session
  { session_id: 's_007', device_id: 'dev_31', user_id: 'u_016', user_email: 'sales@x.com',    org_id: 'org_cu_1001', org_name: 'Customer X', status: 'ACTIVE',     login_at: '2026-02-10 10:22', logout_at: null,              termination_reason: null },
  { session_id: 's_008', device_id: 'dev_34', user_id: 'u_006', user_email: 'ops1@x.com',     org_id: 'org_cu_1001', org_name: 'Customer X', status: 'ACTIVE',     login_at: '2026-02-10 10:35', logout_at: null,              termination_reason: null },
];

// ==================== 激活码 ====================

export const activationCodes: ActivationCode[] = [
  // Customer X: 1 Regular Bound, 1 Trial Bound (7 days / 33 sessions left), 1 Regular Unused, 1 Regular Revoked
  { code_id: 'ac_001', code: 'SMRT-A1B2-C3D4', org_id: 'org_cu_1001', created_by_portal: 'platform', created_at: '2026-02-01 10:00', expires_at: '2026-02-08 10:00', status: 'Bound',   bound_device_id: 'dev_09', bound_at: '2026-02-03 09:00', nickname: 'Front Door Mirror', code_type: 'Regular', trial_duration_days: null, trial_max_sessions: null,  trial_used_sessions: null },
  { code_id: 'ac_002', code: 'SMRT-E5F6-G7H8', org_id: 'org_cu_1001', created_by_portal: 'platform', created_at: '2026-02-02 11:00', expires_at: '2026-02-09 11:00', status: 'Bound',   bound_device_id: 'dev_20', bound_at: '2026-02-05 14:00', nickname: 'Fitting Room #2',   code_type: 'Trial',   trial_duration_days: 30,   trial_max_sessions: 100, trial_used_sessions: 67 },
  { code_id: 'ac_003', code: 'SMRT-I9J0-K1L2', org_id: 'org_cu_1001', created_by_portal: 'channel',  created_at: '2026-02-09 09:00', expires_at: '2026-02-16 09:00', status: 'Unused',  bound_device_id: null,     bound_at: null,              nickname: null,                code_type: 'Regular', trial_duration_days: null, trial_max_sessions: null,  trial_used_sessions: null },
  { code_id: 'ac_004', code: 'SMRT-M3N4-O5P6', org_id: 'org_cu_1001', created_by_portal: 'channel',  created_at: '2026-02-01 08:00', expires_at: '2026-02-08 08:00', status: 'Revoked', bound_device_id: null,     bound_at: null,              nickname: null,                code_type: 'Regular', trial_duration_days: null, trial_max_sessions: null,  trial_used_sessions: null },
  // Customer Y: 1 Regular Bound, 1 Trial Unused, 1 Trial Expired (quota exhausted)
  { code_id: 'ac_005', code: 'SMRT-Q7R8-S9T0', org_id: 'org_cu_1002', created_by_portal: 'channel',  created_at: '2026-02-05 10:00', expires_at: '2026-02-12 10:00', status: 'Bound',   bound_device_id: 'dev_12', bound_at: '2026-02-07 11:00', nickname: 'VIP Lounge',        code_type: 'Regular', trial_duration_days: null, trial_max_sessions: null,  trial_used_sessions: null },
  { code_id: 'ac_006', code: 'SMRT-U1V2-W3X4', org_id: 'org_cu_1002', created_by_portal: 'channel',  created_at: '2026-02-09 14:00', expires_at: '2026-02-16 14:00', status: 'Unused',  bound_device_id: null,     bound_at: null,              nickname: null,                code_type: 'Trial',   trial_duration_days: 14,   trial_max_sessions: 50,  trial_used_sessions: null },
  { code_id: 'ac_007', code: 'SMRT-Y5Z6-A7B8', org_id: 'org_cu_1002', created_by_portal: 'channel',  created_at: '2026-02-01 09:00', expires_at: '2026-02-08 09:00', status: 'Expired', bound_device_id: null,     bound_at: null,              nickname: null,                code_type: 'Trial',   trial_duration_days: 14,   trial_max_sessions: 50,  trial_used_sessions: 50 },
  // Customer Z: 1 Regular Bound, 1 Regular Unused
  { code_id: 'ac_008', code: 'SMRT-C9D0-E1F2', org_id: 'org_cu_1003', created_by_portal: 'channel',  created_at: '2026-02-06 10:00', expires_at: '2026-02-13 10:00', status: 'Bound',   bound_device_id: 'dev_15', bound_at: '2026-02-08 16:00', nickname: null,                code_type: 'Regular', trial_duration_days: null, trial_max_sessions: null,  trial_used_sessions: null },
  { code_id: 'ac_009', code: 'SMRT-G3H4-I5J6', org_id: 'org_cu_1003', created_by_portal: 'channel',  created_at: '2026-02-09 15:00', expires_at: '2026-02-16 15:00', status: 'Unused',  bound_device_id: null,     bound_at: null,              nickname: null,                code_type: 'Regular', trial_duration_days: null, trial_max_sessions: null,  trial_used_sessions: null },
  // Customer W: 1 Trial Bound (9 days / 38 sessions left), 1 Regular Unused
  { code_id: 'ac_010', code: 'SMRT-K7L8-M9N0', org_id: 'org_cu_1004', created_by_portal: 'platform', created_at: '2026-02-07 09:00', expires_at: '2026-02-14 09:00', status: 'Bound',   bound_device_id: 'dev_22', bound_at: '2026-02-08 10:00', nickname: null,                code_type: 'Trial',   trial_duration_days: 30,   trial_max_sessions: 50,  trial_used_sessions: 12 },
  { code_id: 'ac_011', code: 'SMRT-O1P2-Q3R4', org_id: 'org_cu_1004', created_by_portal: 'platform', created_at: '2026-02-09 10:00', expires_at: '2026-02-16 10:00', status: 'Unused',  bound_device_id: null,     bound_at: null,              nickname: null,                code_type: 'Regular', trial_duration_days: null, trial_max_sessions: null,  trial_used_sessions: null },
  // Customer V: 1 Trial Unused
  { code_id: 'ac_012', code: 'SMRT-S5T6-U7V8', org_id: 'org_cu_1005', created_by_portal: 'channel',  created_at: '2026-02-09 11:00', expires_at: '2026-02-16 11:00', status: 'Unused',  bound_device_id: null,     bound_at: null,              nickname: null,                code_type: 'Trial',   trial_duration_days: 14,   trial_max_sessions: 30,  trial_used_sessions: null },
];

// ==================== Demo 账号 ====================

export const demoAccounts: DemoAccount[] = [
  { user_id: 'u_super', email: 'super@platform.com', name: 'Platform Admin', role: 'PlatformSuperAdmin', portal: 'platform', org_id: 'platform', org_name: 'Smart Mirror Platform', password: 'demo' },
  { user_id: 'u_001', email: 'admin@channel-a.com', name: 'Alice Chen', role: 'ChannelOwner', portal: 'channel', org_id: 'org_ch_001', org_name: 'Channel A', password: 'demo' },
  { user_id: 'u_002', email: 'hq.admin@x.com', name: 'David Zhang', role: 'HQOwner', portal: 'customer', org_id: 'org_cu_1001', org_name: 'Customer X', password: 'demo' },
];

// ==================== 试用辅助函数 ====================

/** 计算试用客户的状态信息（含天数 + 销售次数） */
export function getTrialInfo(org: Organization): {
  trialStatus: TrialStatus;
  remainingDays: number;
  trialEndDate: string;
  trialMaxSales: number;
  trialUsedSales: number;
  trialRemainingSales: number;
} {
  if (!org.is_trial || !org.trial_start_date || !org.trial_days) {
    return { trialStatus: 'not_trial', remainingDays: 0, trialEndDate: '', trialMaxSales: 0, trialUsedSales: 0, trialRemainingSales: 0 };
  }
  const endDate = dayjs(org.trial_start_date).add(org.trial_days, 'day');
  const today = dayjs();
  const remaining = endDate.diff(today, 'day');
  const maxSales = org.trial_max_sales ?? 0;
  const usedSales = org.trial_used_sales ?? 0;
  const daysExpired = remaining < 0;
  const salesExhausted = usedSales >= maxSales;
  return {
    trialStatus: (daysExpired || salesExhausted) ? 'expired' : 'active',
    remainingDays: Math.max(remaining, 0),
    trialEndDate: endDate.format('YYYY-MM-DD'),
    trialMaxSales: maxSales,
    trialUsedSales: usedSales,
    trialRemainingSales: Math.max(maxSales - usedSales, 0),
  };
}

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

/** 获取客户的服装分类列表 */
export function getOrgGarmentCategories(orgId: string) {
  return garmentCategories.filter(c => c.org_id === orgId);
}

/** 根据分类 ID 获取分类名称 */
export function getGarmentCategoryName(categoryId: string | null) {
  if (!categoryId) return null;
  return garmentCategories.find(c => c.category_id === categoryId)?.name ?? null;
}

/** 根据 ID 查找主模板 */
export function getMasterTemplateById(templateId: string) {
  return masterTemplates.find(t => t.template_id === templateId);
}

/** 获取客户被分配的模板（含主模板详情） */
export function getCustomerAssignedTemplates(orgId: string) {
  return templateAssignments
    .filter(a => a.org_id === orgId)
    .map(a => {
      const tpl = getMasterTemplateById(a.template_id);
      return {
        ...a,
        template_name: tpl?.name ?? '-',
        template_prompts: tpl?.prompts ?? [],
        template_status: tpl?.status ?? ('Disabled' as const),
      };
    });
}

/** 获取某模板已分配的客户列表 */
export function getTemplateAssignedOrgs(templateId: string) {
  return templateAssignments
    .filter(a => a.template_id === templateId)
    .map(a => {
      const org = getOrgById(a.org_id);
      return { ...a, org_name: org?.name ?? '-', org_status: org?.status ?? ('Disabled' as const) };
    });
}

/** 获取某模板尚未分配的客户列表 */
export function getTemplateUnassignedOrgs(templateId: string) {
  const assignedOrgIds = templateAssignments.filter(a => a.template_id === templateId).map(a => a.org_id);
  return organizations.filter(o => o.org_type === 'CUSTOMER' && !assignedOrgIds.includes(o.org_id));
}

export function getOrgDevices(orgId: string) {
  return devices.filter(d => d.current_org_id === orgId);
}

export function getDeviceAssignedGarments(deviceId: string) {
  return deviceGarmentAssignments
    .filter(a => a.device_id === deviceId)
    .map(a => {
      const garment = garments.find(g => g.catalog_id === a.catalog_id);
      return { ...a, garment_name: garment?.name ?? '-', garment_image: garment?.image_url ?? '' };
    });
}

export function getGarmentAssignedDevices(catalogId: string) {
  return deviceGarmentAssignments
    .filter(a => a.catalog_id === catalogId)
    .map(a => {
      const device = devices.find(d => d.device_id === a.device_id);
      return { ...a, device_nickname: device?.nickname ?? null, device_status: device?.status ?? 'Offline' };
    });
}

export function getOrgSessions(orgId: string) {
  return sessions.filter(s => s.org_id === orgId);
}

/** 获取某服装绑定的模板 ID 列表 */
export function getGarmentTemplateIds(catalogId: string): string[] {
  return garments.find(g => g.catalog_id === catalogId)?.template_ids ?? [];
}

/** 获取某组织下首次登录、尚未被确认的新设备列表 */
export function getOrgNewDevices(orgId: string): Device[] {
  return devices.filter(d => d.current_org_id === orgId && d.is_new === true);
}

/** 获取某客户账号下的所有激活码 */
export function getOrgActivationCodes(orgId: string): ActivationCode[] {
  return activationCodes.filter(ac => ac.org_id === orgId);
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
  const trialInfo = parentOrg ? getTrialInfo(parentOrg) : { trialStatus: 'not_trial' as const, remainingDays: 0, trialEndDate: '', trialMaxSales: 0, trialUsedSales: 0, trialRemainingSales: 0 };
  return {
    memberCount: members.length,
    onlineDeviceCount: onlineDevices,
    adminEmail: adminUser?.email ?? '-',
    adminName: adminUser?.name ?? '-',
    adminStatus: adminUser?.status ?? 'Disabled',
    adminLastLogin: adminUser?.last_login ?? null,
    customerType: parentOrg?.parent_org_id ? 'Reseller' as const : 'Direct' as const,
    channelName: channelOrg?.name ?? '-',
    channelOrgId: channelOrg?.org_id ?? null,
    isTrial: parentOrg?.is_trial ?? false,
    trialStatus: trialInfo.trialStatus,
    remainingDays: trialInfo.remainingDays,
    trialEndDate: trialInfo.trialEndDate,
    trialMaxSales: trialInfo.trialMaxSales,
    trialUsedSales: trialInfo.trialUsedSales,
    trialRemainingSales: trialInfo.trialRemainingSales,
  };
}
