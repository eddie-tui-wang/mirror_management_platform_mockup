'use client';

import { useState } from 'react';
import { Button, Input, Form, Typography, Steps, Result } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text, Link } = Typography;

type Step = 'email' | 'newPassword' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const currentStepIndex = { email: 0, newPassword: 1, success: 2 }[step];

  const handleSendCode = () => {
    emailForm.validateFields(['email']).then((values) => {
      setSendingCode(true);
      setTimeout(() => {
        setEmail(values.email);
        setCodeSent(true);
        setSendingCode(false);
      }, 800);
    });
  };

  const handleEmailSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('newPassword');
    }, 600);
  };

  const handlePasswordSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 800);
  };

  const primaryBtnStyle = {
    height: 44,
    borderRadius: 8,
    fontWeight: 600,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
  } as const;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      {/* Background */}
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
        maxWidth: 480,
        padding: '0 20px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="AI Mirror Fitting" style={{ height: 36, width: 'auto', filter: 'invert(1) brightness(2)', marginBottom: 12 }} />
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              Reset your password
            </Text>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '36px 32px 28px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        }}>
          {step !== 'success' && (
            <Steps
              current={currentStepIndex}
              size="small"
              style={{ marginBottom: 32 }}
              items={[
                { title: 'Verify Email', icon: <SafetyCertificateOutlined /> },
                { title: 'New Password', icon: <LockOutlined /> },
              ]}
            />
          )}

          {/* Step 1: Verify Email */}
          {step === 'email' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Verify your email</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Enter your account email and we'll send you a verification code.
                </Text>
              </div>
              <Form form={emailForm} layout="vertical" requiredMark={false} size="large" onFinish={handleEmailSubmit}>
                <Form.Item
                  name="email"
                  label={<Text strong style={{ fontSize: 13 }}>Email address</Text>}
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#bbb' }} />}
                    placeholder="name@company.com"
                    autoComplete="email"
                    suffix={
                      <Button
                        type="link"
                        size="small"
                        loading={sendingCode}
                        onClick={handleSendCode}
                        style={{ padding: '0 4px', fontSize: 13 }}
                      >
                        {codeSent ? 'Resend' : 'Send Code'}
                      </Button>
                    }
                  />
                </Form.Item>

                {codeSent && (
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
                      autoFocus
                      style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }}
                    />
                  </Form.Item>
                )}

                {codeSent && (
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Sent to <Text strong style={{ fontSize: 12 }}>{email}</Text>.{' '}
                      <Link style={{ fontSize: 12 }} onClick={handleSendCode}>Resend</Link>
                    </Text>
                  </div>
                )}

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!codeSent}
                    block
                    style={primaryBtnStyle}
                  >
                    Verify & Continue
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}

          {/* Step 2: New Password */}
          {step === 'newPassword' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Set a new password</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Choose a strong password for your account.
                </Text>
              </div>
              <Form form={passwordForm} layout="vertical" requiredMark={false} size="large" onFinish={handlePasswordSubmit}>
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
                    iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
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
                    placeholder="Re-enter your password"
                    iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={primaryBtnStyle}
                  >
                    Reset password
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}

          {/* Success */}
          {step === 'success' && (
            <Result
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title="Password reset successfully!"
              subTitle="Your password has been updated. You can now sign in with your new password."
              extra={[
                <Button
                  key="login"
                  type="primary"
                  block
                  style={primaryBtnStyle}
                  onClick={() => router.push('/login')}
                >
                  Back to Sign in
                </Button>,
              ]}
            />
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
              Remember your password?{' '}
              <Link style={{ color: 'rgba(255,255,255,0.85)' }} onClick={() => router.push('/login')}>
                Sign in
              </Link>
            </Text>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
            &copy; 2026 AI Fitting Mirror Technologies · Privacy · Terms
          </Text>
        </div>
      </div>
    </div>
  );
}
