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
  platform: { color: '#531dab', label: 'Platform', icon: <BankOutlined />, description: 'Global admin view: manage channels, customers, users, and assets' },
  channel: { color: '#0958d9', label: 'Channel', icon: <TeamOutlined />, description: 'Channel agent view: manage customers and their accounts' },
  customer: { color: '#389e0d', label: 'Customer', icon: <ShopOutlined />, description: 'Customer view: manage members, garments, and templates' },
};

const ROLE_DESCRIPTION: Record<string, string> = {
  PlatformSuperAdmin: 'Full access to all features: channels, customers, users, and assets',
  ChannelOwner: 'Channel admin: view/create customers, manage customer accounts',
  HQOwner: 'Customer admin: manage members, garments, and templates',
  HQOps: 'Customer ops: view members, upload/edit garments, create/publish templates (no delete/disable)',
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
    message.success(`Signed in as ${account.name} (${account.role})`);
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
            Smart Mirror Management
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
            Multi-Account RBAC Demo - Select a demo account to sign in
          </Paragraph>
          <Alert
            message="Demo Guide"
            description="After signing in with different roles, you can observe permission differences at the menu, page, and button levels. Unauthorized menus are hidden, and unauthorized buttons are grayed out with a tooltip."
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
                                Permissions: {ROLE_PERMISSIONS[account.role].length}
                              </Text>
                            </div>
                          </div>
                          <Button type="primary" size="small" icon={<LoginOutlined />} style={{ backgroundColor: config.color, borderColor: config.color }}>
                            Login
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
            All passwords are &quot;demo&quot; | Data is mock only | For demonstration purposes
          </Text>
        </div>
      </div>
    </div>
  );
}
