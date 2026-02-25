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
  { key: 'channels', label: 'Channel Management', icon: 'BankOutlined', path: '/dashboard/channels', permission: 'platform:channels:view' },
  { key: 'customers', label: 'Customer Management', icon: 'TeamOutlined', path: '/dashboard/customers', permission: 'platform:customers:view' },
  { key: 'users', label: 'Users & Roles', icon: 'UserOutlined', path: '/dashboard/users', permission: 'platform:users:view' },
  {
    key: 'assets', label: 'Assets', icon: 'AppstoreOutlined',
    children: [
      { key: 'garments', label: 'Garments', icon: 'SkinOutlined', path: '/dashboard/assets/garments', permission: 'platform:garments:view' },
      { key: 'templates', label: 'Template Management', icon: 'LayoutOutlined', path: '/dashboard/assets/templates', permission: 'platform:templates:view' },
    ],
  },
];

// 渠道端菜单
const channelMenu: MenuItemConfig[] = [
  { key: 'ch-customers', label: 'Customer Management', icon: 'TeamOutlined', path: '/dashboard/channel/customers', permission: 'channel:customers:view' },
  { key: 'ch-users', label: 'Customer Accounts', icon: 'UserOutlined', path: '/dashboard/channel/users', permission: 'channel:users:view' },
];

// 客户端菜单
const customerMenu: MenuItemConfig[] = [
  { key: 'cu-garments', label: 'Garments', icon: 'SkinOutlined', path: '/dashboard/customer/garments', permission: 'customer:garments:view' },
  { key: 'cu-templates', label: 'Templates', icon: 'LayoutOutlined', path: '/dashboard/customer/templates', permission: 'customer:templates:view' },
  { key: 'cu-devices', label: 'Devices', icon: 'DesktopOutlined', path: '/dashboard/customer/devices', permission: 'customer:devices:view' },
];

export const PORTAL_MENUS: Record<PortalType, MenuItemConfig[]> = {
  platform: platformMenu,
  channel: channelMenu,
  customer: customerMenu,
};
