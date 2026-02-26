'use client';

import { useState } from 'react';
import { Button, Input, Form, Typography, message, Checkbox, Divider, Dropdown } from 'antd';
import {
  LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, DownOutlined,
  SafetyCertificateOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { demoAccounts } from '@/lib/mock-data';
import { DemoAccount, PortalType } from '@/lib/types';

const { Title, Text, Link } = Typography;

const DEFAULT_ROUTES: Record<PortalType, string> = {
  platform: '/dashboard/channels',
  channel: '/dashboard/channel/customers',
  customer: '/dashboard/customer/garments',
};

type LoginStep = 'credentials' | 'verify';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [pendingAccount, setPendingAccount] = useState<DemoAccount | null>(null);
  const [codeForm] = Form.useForm();

  const handleLogin = (account: DemoAccount) => {
    login(account);
    message.success(`Welcome back, ${account.name}`);
    router.push(DEFAULT_ROUTES[account.portal]);
  };

  const onFinish = (values: { email: string; password: string }) => {
    setLoading(true);
    setTimeout(() => {
      const account = demoAccounts.find(
        a => a.email === values.email && a.password === values.password
      );
      if (account) {
        setPendingAccount(account);
        setLoginStep('verify');
      } else {
        message.error('Invalid email or password');
      }
      setLoading(false);
    }, 800);
  };

  const onVerifyFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (pendingAccount) handleLogin(pendingAccount);
    }, 600);
  };

  const quickLoginItems = demoAccounts.map(account => ({
    key: account.user_id,
    label: (
      <div style={{ padding: '4px 0' }}>
        <div style={{ fontWeight: 500 }}>{account.name}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{account.email} · {account.org_name}</div>
      </div>
    ),
    onClick: () => {
      handleLogin(account);
    },
  }));

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '50vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 420,
        padding: '0 20px',
      }}>
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="AI Mirror Fitting" style={{ height: 36, width: 'auto', filter: 'invert(1) brightness(2)', marginBottom: 12 }} />
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              Intelligent Fitting Room Management
            </Text>
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '36px 32px 28px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        }}>

          {/* Step 1: Credentials */}
          {loginStep === 'credentials' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Sign in</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Enter your credentials to access your account
                </Text>
              </div>

              <Form
                name="login"
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
                size="large"
              >
                <Form.Item
                  name="email"
                  label={<Text strong style={{ fontSize: 13 }}>Email</Text>}
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#bbb' }} />}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<Text strong style={{ fontSize: 13 }}>Password</Text>}
                  rules={[{ required: true, message: 'Please enter your password' }]}
                  style={{ marginBottom: 4 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#bbb' }} />}
                    placeholder="Enter your password"
                    iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                    autoComplete="current-password"
                  />
                </Form.Item>

                <div style={{ textAlign: 'right', marginBottom: 20 }}>
                  <Link
                    style={{ fontSize: 12 }}
                    onClick={(e) => { e.preventDefault(); router.push('/forgot-password'); }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 20 }}>
                  <Checkbox>
                    <Text style={{ fontSize: 13 }}>Remember me for 30 days</Text>
                  </Checkbox>
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 44,
                      borderRadius: 8,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
                    }}
                  >
                    Continue
                  </Button>
                </Form.Item>
              </Form>

              <Divider style={{ margin: '16px 0', fontSize: 12, color: '#aaa' }}>
                Demo Quick Access
              </Divider>

              <Dropdown menu={{ items: quickLoginItems }} trigger={['click']} placement="bottom">
                <Button
                  block
                  style={{
                    height: 40,
                    borderRadius: 8,
                    borderStyle: 'dashed',
                    color: '#666',
                  }}
                >
                  Select a demo account <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
                </Button>
              </Dropdown>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Hint: all demo passwords are <Text code style={{ fontSize: 11 }}>demo</Text>
                </Text>
              </div>
            </>
          )}

          {/* Step 2: Email Verification Code */}
          {loginStep === 'verify' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
                  marginBottom: 16,
                }}>
                  <SafetyCertificateOutlined style={{ fontSize: 24, color: '#667eea' }} />
                </div>
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Verify your email</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  We sent a 6-digit code to <Text strong>{pendingAccount?.email}</Text>. Enter it below to sign in.
                </Text>
              </div>

              <Form
                form={codeForm}
                layout="vertical"
                requiredMark={false}
                size="large"
                onFinish={onVerifyFinish}
              >
                <Form.Item
                  name="code"
                  label={<Text strong style={{ fontSize: 13 }}>Verification code</Text>}
                  rules={[
                    { required: true, message: 'Please enter the verification code' },
                    { len: 6, message: 'Code must be exactly 6 digits' },
                    { pattern: /^\d+$/, message: 'Code must be numeric' },
                  ]}
                >
                  <Input
                    prefix={<SafetyCertificateOutlined style={{ color: '#bbb' }} />}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{ letterSpacing: 6, fontSize: 20, textAlign: 'center' }}
                    autoFocus
                  />
                </Form.Item>

                <div style={{ marginBottom: 20 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Didn't receive a code?{' '}
                    <Link style={{ fontSize: 12 }} onClick={() => message.info('Code resent (simulated)')}>
                      Resend
                    </Link>
                  </Text>
                </div>

                <Form.Item style={{ marginBottom: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 44,
                      borderRadius: 8,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
                    }}
                  >
                    Sign in
                  </Button>
                </Form.Item>

                <Button
                  type="text"
                  block
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    setLoginStep('credentials');
                    setPendingAccount(null);
                    codeForm.resetFields();
                  }}
                  style={{ color: '#888' }}
                >
                  Back
                </Button>
              </Form>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  For demo, any 6-digit code works
                </Text>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
            &copy; 2026 Smart Mirror Technologies · Privacy · Terms
          </Text>
        </div>
      </div>
    </div>
  );
}
