'use client';

import React, { useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Tag, Typography, Space, theme } from 'antd';
import {
  BankOutlined, TeamOutlined, UserOutlined, AppstoreOutlined,
  SkinOutlined, LayoutOutlined, DesktopOutlined, ClockCircleOutlined,
  LogoutOutlined, SettingOutlined, MailOutlined, FormOutlined, PictureOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import { PORTAL_MENUS, MenuItemConfig } from '@/lib/menu-config';
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
  MailOutlined: <MailOutlined />,
  FormOutlined: <FormOutlined />,
  PictureOutlined: <PictureOutlined />,
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

function buildMenuItems(items: MenuItemConfig[], portal: string): MenuProps['items'] {
  return items
    .filter(item => {
      if (item.children) {
        return item.children.some(child =>
          !child.permission || hasPermission(portal as any, child.permission)
        );
      }
      return !item.permission || hasPermission(portal as any, item.permission);
    })
    .map(item => {
      if (item.children) {
        return {
          key: item.key,
          icon: ICON_MAP[item.icon],
          label: item.label,
          children: item.children
            .filter(child => !child.permission || hasPermission(portal as any, child.permission))
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
    return buildMenuItems(PORTAL_MENUS[currentUser.portal], currentUser.portal);
  }, [currentUser]);

  if (!currentUser) {
    router.push('/login');
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
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
        router.push('/login');
      },
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      router.push(key);
    }
  };

  const selectedKeys = [pathname];

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        width={220}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div style={{
          height: 64,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '0 20px',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="AI Mirror Fitting" style={{ height: 22, width: 'auto' }} />
        </div>
        <div style={{ padding: '8px 12px', flexShrink: 0 }}>
          <Tag color={portalColor} style={{ width: '100%', textAlign: 'center', padding: '4px 0', fontSize: 13 }}>
            {PORTAL_LABEL[currentUser.portal]}
          </Tag>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
          />
        </div>
        <div style={{ flexShrink: 0, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
            items={[
              {
                key: '/dashboard/settings',
                icon: <SettingOutlined />,
                label: 'Settings',
              },
            ]}
          />
        </div>
      </Sider>
      <Layout style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header style={{
          flexShrink: 0,
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
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: portalColor }} icon={<UserOutlined />} />
                <Text>{currentUser.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          flex: 1,
          overflow: 'auto',
          margin: 24,
          padding: 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
