'use client';

import React, { useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Tag, Typography, Space, theme, Badge } from 'antd';
import {
  BankOutlined, TeamOutlined, UserOutlined, AppstoreOutlined,
  SkinOutlined, LayoutOutlined, DesktopOutlined, ClockCircleOutlined,
  LogoutOutlined, SwapOutlined,
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
};

const PORTAL_COLOR: Record<string, string> = {
  platform: '#531dab',
  channel: '#0958d9',
  customer: '#389e0d',
};

const PORTAL_LABEL: Record<string, string> = {
  platform: '平台端',
  channel: '渠道端',
  customer: '客户端',
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
            <Tag>{currentUser.role}</Tag>
          </div>
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>组织: {currentUser.org_name}</Text>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'switch',
      icon: <SwapOutlined />,
      label: '切换账号',
      onClick: () => {
        logout();
        router.push('/');
      },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout();
        router.push('/');
      },
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
            <Text strong style={{ fontSize: 16 }}>试衣镜管理系统</Text>
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
            <Text type="secondary">组织: </Text>
            <Text strong>{currentUser.org_name}</Text>
          </Space>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: portalColor }} icon={<UserOutlined />} />
              <Text>{currentUser.name}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, minHeight: 360 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
