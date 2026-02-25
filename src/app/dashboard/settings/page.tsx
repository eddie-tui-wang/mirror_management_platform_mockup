'use client';

import { useState } from 'react';
import {
  Typography, Card, Avatar, Tag, Divider, Button,
  Form, Input, Steps, Result, Space, Row, Col,
} from 'antd';
import {
  UserOutlined, MailOutlined, LockOutlined,
  SafetyCertificateOutlined, EyeInvisibleOutlined, EyeTwoTone,
  CheckCircleOutlined, ArrowLeftOutlined, KeyOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/lib/store';

const { Title, Text } = Typography;

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

type PasswordStep = 'idle' | 'currentPwd' | 'verify' | 'newPwd' | 'success';

export default function SettingsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  // ── Change Password wizard state ─────────────────────────
  const [pwdStep, setPwdStep] = useState<PasswordStep>('idle');
  const [loading, setLoading] = useState(false);
  const [currentPwdForm] = Form.useForm();
  const [verifyForm] = Form.useForm();
  const [newPwdForm] = Form.useForm();

  if (!currentUser) return null;

  const portalColor = PORTAL_COLOR[currentUser.portal] ?? '#1677ff';

  // ── Step handlers ─────────────────────────────────────────
  const handleCurrentPwdSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPwdStep('verify');
    }, 700);
  };

  const handleVerifySubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPwdStep('newPwd');
    }, 600);
  };

  const handleNewPwdSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPwdStep('success');
    }, 700);
  };

  const handleReset = () => {
    currentPwdForm.resetFields();
    verifyForm.resetFields();
    newPwdForm.resetFields();
    setPwdStep('idle');
  };

  const stepIndex: Record<Exclude<PasswordStep, 'idle' | 'success'>, number> = {
    currentPwd: 0,
    verify: 1,
    newPwd: 2,
  };

  const primaryBtnStyle = {
    height: 40,
    borderRadius: 8,
    fontWeight: 600 as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>Personal Settings</Title>

      {/* ── Profile Card ── */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <Avatar
            size={64}
            style={{ backgroundColor: portalColor, fontSize: 24, flexShrink: 0 }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text strong style={{ fontSize: 18 }}>{currentUser.name}</Text>
              <Tag color={portalColor}>{PORTAL_LABEL[currentUser.portal]}</Tag>
              <Tag>{currentUser.role}</Tag>
            </div>
            <Text type="secondary">{currentUser.email}</Text>
          </div>
        </div>

        <Divider style={{ margin: '0 0 16px' }} />

        <Row gutter={[24, 12]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
              Email
            </Text>
            <Text>{currentUser.email}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
              Organization
            </Text>
            <Text>{currentUser.org_name}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
              Role
            </Text>
            <Text>{currentUser.role}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
              Portal
            </Text>
            <Text>{PORTAL_LABEL[currentUser.portal]}</Text>
          </Col>
        </Row>
      </Card>

      {/* ── Security Card ── */}
      <Card style={{ borderRadius: 12 }} title="Security">

        {pwdStep === 'idle' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text strong>Password</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Change your account password. A verification code will be sent to your email.
                </Text>
              </div>
            </div>
            <Button
              icon={<KeyOutlined />}
              onClick={() => setPwdStep('currentPwd')}
            >
              Change Password
            </Button>
          </div>
        )}

        {pwdStep !== 'idle' && pwdStep !== 'success' && (
          <>
            <Steps
              current={stepIndex[pwdStep as Exclude<PasswordStep, 'idle' | 'success'>]}
              size="small"
              style={{ marginBottom: 28 }}
              items={[
                { title: 'Current Password', icon: <LockOutlined /> },
                { title: 'Verify Email', icon: <SafetyCertificateOutlined /> },
                { title: 'New Password', icon: <KeyOutlined /> },
              ]}
            />

            {/* ── Step 1: Current Password ── */}
            {pwdStep === 'currentPwd' && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <Text strong style={{ fontSize: 15 }}>Confirm your current password</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Enter your current password to verify your identity before we send a code to{' '}
                      <Text strong>{currentUser.email}</Text>.
                    </Text>
                  </div>
                </div>
                <Form
                  form={currentPwdForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleCurrentPwdSubmit}
                  style={{ maxWidth: 360 }}
                >
                  <Form.Item
                    name="currentPassword"
                    label={<Text strong style={{ fontSize: 13 }}>Current password</Text>}
                    rules={[{ required: true, message: 'Please enter your current password' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#bbb' }} />}
                      placeholder="Enter current password"
                      iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      size="large"
                    />
                  </Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={primaryBtnStyle}
                    >
                      Send verification code
                    </Button>
                    <Button type="text" onClick={handleReset} style={{ color: '#888' }}>
                      Cancel
                    </Button>
                  </Space>
                </Form>
              </>
            )}

            {/* ── Step 2: Email Verification ── */}
            {pwdStep === 'verify' && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <Text strong style={{ fontSize: 15 }}>Check your email</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      We sent a 6-digit code to <Text strong>{currentUser.email}</Text>.{' '}
                      Enter it below to continue.
                    </Text>
                  </div>
                </div>
                <Form
                  form={verifyForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleVerifySubmit}
                  style={{ maxWidth: 360 }}
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
                      size="large"
                      style={{ letterSpacing: 6, fontSize: 20, textAlign: 'center' }}
                      autoFocus
                    />
                  </Form.Item>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Didn't receive a code?{' '}
                      <Typography.Link style={{ fontSize: 12 }}>Resend</Typography.Link>
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                      (For demo, any 6-digit code works)
                    </Text>
                  </div>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={primaryBtnStyle}
                    >
                      Verify code
                    </Button>
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => setPwdStep('currentPwd')}
                      style={{ color: '#888' }}
                    >
                      Back
                    </Button>
                  </Space>
                </Form>
              </>
            )}

            {/* ── Step 3: New Password ── */}
            {pwdStep === 'newPwd' && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <Text strong style={{ fontSize: 15 }}>Set a new password</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Choose a strong password for your account.
                    </Text>
                  </div>
                </div>
                <Form
                  form={newPwdForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleNewPwdSubmit}
                  style={{ maxWidth: 360 }}
                >
                  <Form.Item
                    name="password"
                    label={<Text strong style={{ fontSize: 13 }}>New password</Text>}
                    rules={[
                      { required: true, message: 'Please enter a new password' },
                      { min: 8, message: 'Password must be at least 8 characters' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#bbb' }} />}
                      placeholder="At least 8 characters"
                      size="large"
                      iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label={<Text strong style={{ fontSize: 13 }}>Confirm new password</Text>}
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm your password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#bbb' }} />}
                      placeholder="Re-enter your new password"
                      size="large"
                      iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={primaryBtnStyle}
                    >
                      Reset password
                    </Button>
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => setPwdStep('verify')}
                      style={{ color: '#888' }}
                    >
                      Back
                    </Button>
                  </Space>
                </Form>
              </>
            )}
          </>
        )}

        {/* ── Step 4: Success ── */}
        {pwdStep === 'success' && (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Password changed successfully"
            subTitle="Your password has been updated. Use your new password next time you sign in."
            extra={
              <Button onClick={handleReset} style={{ borderRadius: 8 }}>
                Done
              </Button>
            }
            style={{ padding: '24px 0' }}
          />
        )}
      </Card>
    </div>
  );
}
