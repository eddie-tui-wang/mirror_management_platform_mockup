'use client';

import { Card, Typography, Space, Tag, Button, Row, Col, message, Divider, Alert } from 'antd';
import { UserOutlined, BankOutlined, TeamOutlined, ShopOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { demoAccounts } from '@/lib/mock-data';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import { DemoAccount, PortalType } from '@/lib/types';

const { Title, Paragraph, Text } = Typography;

const PORTAL_CONFIG: Record<PortalType, { color: string; label: string; icon: React.ReactNode; description: string }> = {
  platform: { color: '#531dab', label: '平台端', icon: <BankOutlined />, description: '全局管理视角，管理渠道、客户、用户、资产、设备' },
  channel: { color: '#0958d9', label: '渠道端', icon: <TeamOutlined />, description: '渠道代理视角，管理名下客户和客户账号' },
  customer: { color: '#389e0d', label: '客户端', icon: <ShopOutlined />, description: '终端客户视角，管理成员、服装、模板、设备' },
};

const ROLE_DESCRIPTION: Record<string, string> = {
  PlatformSuperAdmin: '拥有全部权限，可管理所有渠道、客户、用户、资产和设备',
  ChannelOwner: '渠道管理员，可查看/创建名下客户，管理客户账号',
  ChannelOps: '渠道运营，仅可查看名下客户和客户账号（只读）',
  HQOwner: '客户管理员，可管理成员、服装库、模板库、设备和会话',
  HQOps: '客户运营，可查看成员、上传/编辑服装、创建/发布模板（无删除/禁用权限）',
};

const DEFAULT_ROUTES: Record<PortalType, string> = {
  platform: '/dashboard/channels',
  channel: '/dashboard/channel/customers',
  customer: '/dashboard/customer/users',
};

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);

  const handleLogin = (account: DemoAccount) => {
    login(account);
    message.success(`已登录为 ${account.name} (${account.role})`);
    router.push(DEFAULT_ROUTES[account.portal]);
  };

  const grouped = {
    platform: demoAccounts.filter(a => a.portal === 'platform'),
    channel: demoAccounts.filter(a => a.portal === 'channel'),
    customer: demoAccounts.filter(a => a.portal === 'customer'),
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title style={{ color: '#fff', marginBottom: 8 }}>
            试衣镜管理系统
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
            多账号权限体系演示 - 请选择一个 Demo 账号登录
          </Paragraph>
          <Alert
            message="演示说明"
            description="选择不同角色登录后，可以看到菜单、页面、按钮级别的权限差异。无权限的菜单会隐藏，无权限的按钮会置灰并提示原因。"
            type="info"
            showIcon
            style={{ maxWidth: 600, margin: '16px auto', textAlign: 'left' }}
          />
        </div>

        <Row gutter={[24, 24]}>
          {(['platform', 'channel', 'customer'] as PortalType[]).map(portal => {
            const config = PORTAL_CONFIG[portal];
            const accounts = grouped[portal];
            return (
              <Col xs={24} md={8} key={portal}>
                <Card
                  title={
                    <Space style={{ color: '#fff' }}>
                      {config.icon}
                      <span>{config.label}</span>
                    </Space>
                  }
                  styles={{ header: { background: config.color, color: '#fff' } }}
                  style={{ height: '100%' }}
                >
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                    {config.description}
                  </Paragraph>

                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {accounts.map(account => (
                      <Card
                        key={account.user_id}
                        size="small"
                        hoverable
                        style={{ border: `1px solid ${config.color}22` }}
                        onClick={() => handleLogin(account)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <Space>
                              <UserOutlined />
                              <Text strong>{account.name}</Text>
                            </Space>
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>{account.email}</Text>
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Tag color={config.color}>{account.role}</Tag>
                              <Tag>{account.org_name}</Tag>
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {ROLE_DESCRIPTION[account.role]}
                              </Text>
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                权限数: {ROLE_PERMISSIONS[account.role].length}
                              </Text>
                            </div>
                          </div>
                          <Button type="primary" size="small" icon={<LoginOutlined />} style={{ backgroundColor: config.color, borderColor: config.color }}>
                            登录
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            所有账号密码均为 demo | 数据为 Mock 假数据 | 仅用于交互演示
          </Text>
        </div>
      </div>
    </div>
  );
}
