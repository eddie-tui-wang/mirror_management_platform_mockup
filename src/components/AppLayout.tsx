'use client';

import React, { useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Tag, Typography, Space, theme, Badge, Tooltip } from 'antd';
import {
  BankOutlined, TeamOutlined, UserOutlined, AppstoreOutlined,
  SkinOutlined, LayoutOutlined, DesktopOutlined, ClockCircleOutlined,
  LogoutOutlined, SwapOutlined, SettingOutlined, BellOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import { PORTAL_MENUS, MenuItemConfig } from '@/lib/menu-config';
import { getOrgNewDevices } from '@/lib/mock-data';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ICON_MAP: Record<string, React.ReactNode> = {
  BankOutlined: <BankOutlined />,
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  SkinOutlined: <SkinOutlined />,
  LayoutOutlined: <LayoutOutlined />,
  DesktopOutlined: <DesktopOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
};

const PORTAL_COLOR: Record<string, string> = {
  platform: '#531dab',
  channel: '#0958d9',
  customer: '#389e0d',
};

const PORTAL_LABEL: Record<string, string> = {
  platform: 'Platform',
  channel: 'Channel',
  customer: 'Customer',
};

function buildMenuItems(items: MenuItemConfig[], role: string): MenuProps['items'] {
  return items
    .filter(item => {
      // 如果有子菜单，只要有一个子项有权限就显示
      if (item.children) {
        return item.children.some(child =>
          !child.permission || hasPermission(role as any, child.permission)
        );
      }
      return !item.permission || hasPermission(role as any, item.permission);
    })
    .map(item => {
      if (item.children) {
        return {
          key: item.key,
          icon: ICON_MAP[item.icon],
          label: item.label,
          children: item.children
            .filter(child => !child.permission || hasPermission(role as any, child.permission))
            .map(child => ({
              key: child.path || child.key,
              icon: ICON_MAP[child.icon],
              label: child.label,
            })),
        };
      }
      return {
        key: item.path || item.key,
        icon: ICON_MAP[item.icon],
        label: item.label,
      };
    });
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore(s => s.currentUser);
  const logout = useAuthStore(s => s.logout);
  const { token } = theme.useToken();

  const menuItems = useMemo(() => {
    if (!currentUser) return [];
    return buildMenuItems(PORTAL_MENUS[currentUser.portal], currentUser.role);
  }, [currentUser]);

  if (!currentUser) {
    router.push('/');
    return null;
  }

  const portalColor = PORTAL_COLOR[currentUser.portal] || '#1677ff';

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div><Text strong>{currentUser.name}</Text></div>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{currentUser.email}</Text></div>
          <div style={{ marginTop: 4 }}>
            <Tag color={portalColor}>{PORTAL_LABEL[currentUser.portal]}</Tag>
          </div>
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Org: {currentUser.org_name}</Text>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Personal Settings',
      onClick: () => router.push('/dashboard/settings'),
    },
    { type: 'divider' },
    {
      key: 'switch',
      icon: <SwapOutlined />,
      label: 'Switch Account',
      onClick: () => {
        logout();
        router.push('/');
      },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
        router.push('/');
      },
    },
  ];

  const acknowledgedDeviceIds = useAuthStore((s) => s.acknowledgedDeviceIds);
  const acknowledgeDevices = useAuthStore((s) => s.acknowledgeDevices);

  // 新设备通知（仅 customer portal）
  const newDevices = useMemo(() => {
    if (currentUser.portal !== 'customer') return [];
    return getOrgNewDevices(currentUser.org_id).filter(
      (d) => !acknowledgedDeviceIds.includes(d.device_id)
    );
  }, [currentUser, acknowledgedDeviceIds]);

  const bellMenuItems: MenuProps['items'] = newDevices.length === 0
    ? [{ key: 'empty', label: <Text type="secondary" style={{ padding: '4px 0', display: 'block' }}>No new notifications</Text>, disabled: true }]
    : [
        ...newDevices.map((d) => ({
          key: d.device_id,
          label: (
            <div
              style={{ padding: '4px 0', maxWidth: 260 }}
              onClick={() => {
                acknowledgeDevices([d.device_id]);
                router.push('/dashboard/customer/devices');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DesktopOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                <div>
                  <div>
                    <Text strong style={{ fontSize: 13 }}>{d.device_id}</Text>
                    <Tag color="blue" style={{ marginLeft: 6, fontSize: 11 }}>New</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      First login · {d.first_seen ?? d.last_seen}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      by {d.current_user_email ?? '-'}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ),
        })),
        { type: 'divider' as const },
        {
          key: 'ack-all',
          label: (
            <Text style={{ color: '#1677ff', fontSize: 13 }}>
              Mark all as read
            </Text>
          ),
          onClick: () => acknowledgeDevices(newDevices.map((d) => d.device_id)),
        },
      ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      router.push(key);
    }
  };

  // 计算选中的 menu key
  const selectedKeys = [pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '0 16px',
        }}>
          <Space>
            <Badge color={portalColor} />
            <Text strong style={{ fontSize: 16 }}>Smart Mirror</Text>
          </Space>
        </div>
        <div style={{ padding: '8px 12px' }}>
          <Tag color={portalColor} style={{ width: '100%', textAlign: 'center', padding: '4px 0', fontSize: 13 }}>
            {PORTAL_LABEL[currentUser.portal]} - {currentUser.role}
          </Tag>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
        }}>
          <Space>
            <Text type="secondary">Org: </Text>
            <Text strong>{currentUser.org_name}</Text>
          </Space>
          <Space size={16}>
            {currentUser.portal === 'customer' && (
              <Dropdown
                menu={{ items: bellMenuItems }}
                placement="bottomRight"
                trigger={['click']}
                overlayStyle={{ width: 320 }}
              >
                <Tooltip title={newDevices.length > 0 ? `${newDevices.length} new device(s)` : 'Notifications'}>
                  <Badge count={newDevices.length} size="small" style={{ cursor: 'pointer' }}>
                    <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: token.colorTextSecondary }} />
                  </Badge>
                </Tooltip>
              </Dropdown>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: portalColor }} icon={<UserOutlined />} />
                <Text>{currentUser.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, minHeight: 360 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
