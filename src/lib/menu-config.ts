import { PortalType } from './types';
import { PermissionKey } from './permissions';

export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string; // Ant Design icon name
  path?: string;
  permission?: PermissionKey;
  children?: MenuItemConfig[];
}

// 平台端菜单
const platformMenu: MenuItemConfig[] = [
  { key: 'channels', label: '渠道管理', icon: 'BankOutlined', path: '/dashboard/channels', permission: 'platform:channels:view' },
  { key: 'customers', label: '客户管理', icon: 'TeamOutlined', path: '/dashboard/customers', permission: 'platform:customers:view' },
  { key: 'users', label: '账号与权限', icon: 'UserOutlined', path: '/dashboard/users', permission: 'platform:users:view' },
  {
    key: 'assets', label: '组织与资产', icon: 'AppstoreOutlined',
    children: [
      { key: 'garments', label: '服装库', icon: 'SkinOutlined', path: '/dashboard/assets/garments', permission: 'platform:garments:view' },
      { key: 'templates', label: '模板库', icon: 'LayoutOutlined', path: '/dashboard/assets/templates', permission: 'platform:templates:view' },
    ],
  },
];

// 渠道端菜单
const channelMenu: MenuItemConfig[] = [
  { key: 'ch-customers', label: '客户管理', icon: 'TeamOutlined', path: '/dashboard/channel/customers', permission: 'channel:customers:view' },
  { key: 'ch-users', label: '客户账号', icon: 'UserOutlined', path: '/dashboard/channel/users', permission: 'channel:users:view' },
];

// 客户端菜单
const customerMenu: MenuItemConfig[] = [
  { key: 'cu-users', label: '组织成员', icon: 'UserOutlined', path: '/dashboard/customer/users', permission: 'customer:users:view' },
  { key: 'cu-garments', label: '服装库', icon: 'SkinOutlined', path: '/dashboard/customer/garments', permission: 'customer:garments:view' },
  { key: 'cu-templates', label: '模板库', icon: 'LayoutOutlined', path: '/dashboard/customer/templates', permission: 'customer:templates:view' },
];

export const PORTAL_MENUS: Record<PortalType, MenuItemConfig[]> = {
  platform: platformMenu,
  channel: channelMenu,
  customer: customerMenu,
};
