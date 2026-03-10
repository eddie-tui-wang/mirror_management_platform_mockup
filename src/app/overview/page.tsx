'use client';

import React from 'react';
import { Typography, Card, Tag, Space } from 'antd';
import {
  AppstoreOutlined, ApartmentOutlined, FormatPainterOutlined, PlayCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

const entries = [
  {
    key: 'prototype',
    icon: <PlayCircleOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    title: 'Live Prototype',
    desc: 'Explore the full interactive demo. Log in as Platform Admin, Channel, or Customer to walk through each portal.',
    href: '/',
    tag: { label: 'Interactive', color: 'blue' },
    external: false,
  },
  {
    key: 'flow',
    icon: <ApartmentOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
    title: 'Business Flow',
    desc: 'System architecture & user journeys — org hierarchy, template assignment, garment lifecycle, device binding.',
    href: '/overview/flow',
    tag: { label: 'Architecture', color: 'purple' },
    external: false,
  },
  {
    key: 'components',
    icon: <AppstoreOutlined style={{ fontSize: 32, color: '#389e0d' }} />,
    title: 'Component Library & CSS',
    desc: 'All UI components used in this project with color tokens, typography scale, and Ant Design style specs.',
    href: '/overview/components',
    tag: { label: 'Design System', color: 'green' },
    external: false,
  },
  {
    key: 'figma',
    icon: <FormatPainterOutlined style={{ fontSize: 32, color: '#aaa' }} />,
    title: 'Figma Design File',
    desc: 'Full design specs, interaction flows, and component details. Link will be added once the file is ready.',
    href: null,
    tag: { label: 'Coming Soon', color: 'default' },
    external: true,
  },
];

export default function OverviewPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '48px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#1677ff,#722ed1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>SM</span>
            </div>
            <Tag color="blue">Dev Reference</Tag>
          </Space>
          <Title level={2} style={{ margin: '8px 0 4px' }}>AI Fitting Mirror — Project Overview</Title>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 15 }}>
            Multi-tenant AI Fitting Mirror management platform. Three portals: Platform Admin → Channel → Customer.
            Use this page as your starting point.
          </Paragraph>
        </div>

        {/* Entry Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {entries.map((entry) => {
            const cardContent = (
              <Card
                hoverable={!!entry.href}
                style={{
                  height: '100%',
                  opacity: entry.href ? 1 : 0.6,
                  cursor: entry.href ? 'pointer' : 'not-allowed',
                  borderRadius: 12,
                  border: '1px solid #e8e8e8',
                }}
                styles={{ body: { padding: 24 } }}
              >
                <div style={{ marginBottom: 16 }}>{entry.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 17 }}>{entry.title}</Text>
                  <Tag color={entry.tag.color} style={{ margin: 0 }}>{entry.tag.label}</Tag>
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 13, lineHeight: '1.6' }}>
                  {entry.desc}
                </Paragraph>
                {entry.href && (
                  <div style={{ marginTop: 16, color: '#1677ff', fontSize: 13, fontWeight: 500 }}>
                    Open <ArrowRightOutlined />
                  </div>
                )}
              </Card>
            );

            if (!entry.href) return <div key={entry.key}>{cardContent}</div>;
            if (entry.external) return <a key={entry.key} href={entry.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{cardContent}</a>;
            return <Link key={entry.key} href={entry.href} style={{ textDecoration: 'none' }}>{cardContent}</Link>;
          })}
        </div>

        {/* Demo Accounts */}
        <Card style={{ marginTop: 28, borderRadius: 12, border: '1px solid #e8e8e8' }} styles={{ body: { padding: 20 } }}>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>Demo Accounts (password: <code>demo</code> for all)</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { portal: 'Platform Admin', email: 'super@platform.com', color: '#531dab', bg: '#f9f0ff' },
              { portal: 'Channel Owner', email: 'admin@channel-a.com', color: '#0958d9', bg: '#e6f4ff' },
              { portal: 'Customer HQ', email: 'hq.admin@x.com', color: '#389e0d', bg: '#f6ffed' },
            ].map((acc) => (
              <div key={acc.email} style={{ background: acc.bg, borderRadius: 8, padding: '10px 14px' }}>
                <Text style={{ fontSize: 12, color: acc.color, fontWeight: 600, display: 'block' }}>{acc.portal}</Text>
                <code style={{ fontSize: 12 }}>{acc.email}</code>
              </div>
            ))}
          </div>
        </Card>

        <Text type="secondary" style={{ display: 'block', marginTop: 20, textAlign: 'center', fontSize: 12 }}>
          AI Fitting Mirror Demo · For Development Use Only
        </Text>
      </div>
    </div>
  );
}
