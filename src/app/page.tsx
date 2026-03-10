'use client';

import React from 'react';
import { Typography, Card, Tag, Space } from 'antd';
import {
  AppstoreOutlined, FormatPainterOutlined, PlayCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function OverviewPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '48px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

        {/* 页头 */}
        <div style={{ marginBottom: 40 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#1677ff,#722ed1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>SM</span>
            </div>
            <Tag color="blue">开发参考</Tag>
          </Space>
          <Title level={2} style={{ margin: '8px 0 4px' }}>AI Fitting Mirror — 项目总览</Title>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 15 }}>
            多租户 AI Fitting Mirror 管理平台，三端入口：平台超管 → 渠道 → 客户。从这里开始了解整个项目。
          </Paragraph>
        </div>

        {/* 交互原型 — 全宽主入口 */}
        <Link href="/login" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              border: 'none',
              cursor: 'pointer',
            }}
            styles={{ body: { padding: '28px 32px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <PlayCircleOutlined style={{ fontSize: 44, color: 'rgba(255,255,255,0.9)' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Text strong style={{ fontSize: 20, color: '#fff' }}>交互原型</Text>
                    <Tag style={{ margin: 0, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff' }}>
                      可交互
                    </Tag>
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: '1.6' }}>
                    进入完整的可交互 Demo，以平台超管、渠道或客户账号登录，体验各端功能。
                  </Text>
                </div>
              </div>
              <ArrowRightOutlined style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
            </div>
          </Card>
        </Link>

        {/* 下方两列：组件库 + Figma（置灰） */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* 组件库 */}
          <Link href="/overview/components" style={{ textDecoration: 'none' }}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: 12, border: '1px solid #e8e8e8' }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ marginBottom: 16 }}>
                <AppstoreOutlined style={{ fontSize: 32, color: '#389e0d' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text strong style={{ fontSize: 17 }}>组件库 &amp; CSS 规范</Text>
                <Tag color="green" style={{ margin: 0 }}>设计规范</Tag>
              </div>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 13, lineHeight: '1.6' }}>
                项目中使用的所有 UI 组件，包含色彩 Token、字体规范及 Ant Design 样式说明。
              </Paragraph>
              <div style={{ marginTop: 16, color: '#1677ff', fontSize: 13, fontWeight: 500 }}>
                进入 <ArrowRightOutlined />
              </div>
            </Card>
          </Link>

          {/* Figma — 置灰 */}
          <div>
            <Card
              style={{
                height: '100%',
                borderRadius: 12,
                border: '1px solid #e8e8e8',
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ marginBottom: 16 }}>
                <FormatPainterOutlined style={{ fontSize: 32, color: '#aaa' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text strong style={{ fontSize: 17 }}>Figma 设计文件</Text>
                <Tag color="default" style={{ margin: 0 }}>即将上线</Tag>
              </div>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 13, lineHeight: '1.6' }}>
                完整设计稿、交互流程与组件细节。文件就绪后将在此处添加链接。
              </Paragraph>
            </Card>
          </div>

        </div>

        {/* Demo 账号 */}
        <Card style={{ marginTop: 28, borderRadius: 12, border: '1px solid #e8e8e8' }} styles={{ body: { padding: 20 } }}>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>Demo 账号（密码统一为 <code>demo</code>）</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { portal: '平台超管', email: 'super@platform.com', color: '#531dab', bg: '#f9f0ff' },
              { portal: '渠道负责人', email: 'admin@channel-a.com', color: '#0958d9', bg: '#e6f4ff' },
              { portal: '客户 HQ', email: 'hq.admin@x.com', color: '#389e0d', bg: '#f6ffed' },
            ].map((acc) => (
              <div key={acc.email} style={{ background: acc.bg, borderRadius: 8, padding: '10px 14px' }}>
                <Text style={{ fontSize: 12, color: acc.color, fontWeight: 600, display: 'block' }}>{acc.portal}</Text>
                <code style={{ fontSize: 12 }}>{acc.email}</code>
              </div>
            ))}
          </div>
        </Card>

        <Text type="secondary" style={{ display: 'block', marginTop: 20, textAlign: 'center', fontSize: 12 }}>
          AI Fitting Mirror Demo · 仅供开发参考
        </Text>
      </div>
    </div>
  );
}
