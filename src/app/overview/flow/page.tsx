'use client';

import React from 'react';
import { Typography } from 'antd';
import { ArrowLeftOutlined, ArrowDownOutlined, ArrowRightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

const COLORS = {
  platform: { bg: '#f9f0ff', border: '#d3adf7', text: '#531dab' },
  channel:  { bg: '#e6f4ff', border: '#91caff', text: '#0958d9' },
  customer: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },
  device:   { bg: '#f5f5f5', border: '#d9d9d9', text: '#595959' },
  template: { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' },
  garment:  { bg: '#fff0f6', border: '#ffadd2', text: '#c41d7f' },
  image:    { bg: '#e6fffb', border: '#87e8de', text: '#08979c' },
};

type ColorKey = keyof typeof COLORS;

function Box({ label, sublabel, colorKey, width = 140 }: { label: string; sublabel?: string; colorKey: ColorKey; width?: number }) {
  const c = COLORS[colorKey];
  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', width, textAlign: 'center', flexShrink: 0 }}>
      <Text strong style={{ color: c.text, fontSize: 13, display: 'block' }}>{label}</Text>
      {sublabel && <Text style={{ color: c.text, fontSize: 11, opacity: 0.75 }}>{sublabel}</Text>}
    </div>
  );
}

function Arrow({ dir = 'right', label }: { dir?: 'right' | 'down'; label?: string }) {
  if (dir === 'down') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#bbb', gap: 2, margin: '4px 0' }}>
      {label && <Text style={{ fontSize: 11, color: '#999' }}>{label}</Text>}
      <ArrowDownOutlined />
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', color: '#bbb', gap: 4, margin: '0 8px' }}>
      {label && <Text style={{ fontSize: 11, color: '#999' }}>{label}</Text>}
      <ArrowRightOutlined />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#999', display: 'block', marginBottom: 14 }}>
        {title}
      </Text>
      {children}
    </div>
  );
}

function FlowRow({ children, gap = 8, style }: { children: React.ReactNode; gap?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap, ...style }}>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', padding: '20px 24px' }}>
      {children}
    </div>
  );
}

const COLOR_LABELS: Record<ColorKey, string> = {
  platform: '平台超管',
  channel: '渠道',
  customer: '客户',
  device: '设备',
  template: '模板',
  garment: '服装',
  image: '图片',
};

export default function FlowPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        <Link href="/" style={{ color: '#1677ff', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeftOutlined /> 返回总览
        </Link>

        <Title level={3} style={{ margin: '0 0 4px' }}>业务流程</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 28, fontSize: 14 }}>
          系统架构、Portal 层级与数据全生命周期一览。
        </Text>

        {/* 图例 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {(Object.entries(COLORS) as [ColorKey, typeof COLORS[ColorKey]][]).map(([key, c]) => (
            <div key={key} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6, padding: '3px 10px' }}>
              <Text style={{ color: c.text, fontSize: 12, fontWeight: 600 }}>{COLOR_LABELS[key]}</Text>
            </div>
          ))}
        </div>

        <Card>
          {/* 第一节：组织层级 */}
          <Section title="1 · 组织层级">
            <FlowRow>
              <Box label="平台超管" sublabel="super@platform.com" colorKey="platform" width={160} />
              <Arrow label="创建" />
              <Box label="渠道" sublabel="如 Channel A" colorKey="channel" />
              <Arrow label="创建" />
              <Box label="客户" sublabel="渠道下属客户" colorKey="customer" />
            </FlowRow>
            <div style={{ marginTop: 10, marginLeft: 168 }}>
              <FlowRow>
                <Arrow label="也可直接创建" />
                <Box label="客户" sublabel="直客 / 试用账号" colorKey="customer" />
              </FlowRow>
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fafafa', borderRadius: 8, fontSize: 12, color: '#666' }}>
              <strong>组织类型：</strong>CHANNEL · CUSTOMER &nbsp;|&nbsp;
              <strong>客户类型：</strong>Direct · Reseller · Trial &nbsp;|&nbsp;
              <strong>试用账号：</strong>限制天数 + 最大试穿次数
            </div>
          </Section>

          {/* 第二节：模板分配 */}
          <Section title="2 · 模板分配流程">
            <FlowRow>
              <Box label="平台超管" colorKey="platform" width={160} />
              <Arrow label="创建" />
              <Box label="主模板" sublabel="提示词、状态" colorKey="template" width={156} />
              <Arrow label="分配给" />
              <Box label="客户" colorKey="customer" />
              <Arrow label="启用 / 停用" />
              <Box label="模板生效" sublabel="在设备上运行" colorKey="template" width={130} />
            </FlowRow>
            <div style={{ marginTop: 8, marginLeft: 8, fontSize: 12, color: '#999', padding: '6px 0' }}>
              渠道也可为其下属客户分配模板；客户可逐个开启或关闭已分配模板。
            </div>
          </Section>

          {/* 第三节：服装与图片 */}
          <Section title="3 · 服装 & 图片生命周期">
            <FlowRow>
              <Box label="客户" colorKey="customer" />
              <Arrow label="批量上传" />
              <Box label="图片库" sublabel="jpg / png / webp" colorKey="image" width={130} />
              <Arrow label="复制链接" />
              <Box label="服装记录" sublabel="name, category, sex, image_url" colorKey="garment" width={200} />
            </FlowRow>
            <div style={{ marginTop: 8, marginLeft: 8 }}>
              <FlowRow>
                <div style={{ width: 140, flexShrink: 0 }} />
                <Arrow dir="down" />
              </FlowRow>
            </div>
            <FlowRow style={{ marginLeft: 148 }}>
              <Box label="CSV 批量导入" sublabel="name, category, sex, image_url" colorKey="garment" width={210} />
              <Arrow label="或手动编辑" />
              <Box label="服装目录" sublabel="归属客户 org" colorKey="garment" width={156} />
            </FlowRow>
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fafafa', borderRadius: 8, fontSize: 12, color: '#666' }}>
              <strong>category 枚举：</strong>Top · Bottom · Whole look &nbsp;|&nbsp;
              <strong>sex 枚举：</strong>male · female · unisex &nbsp;|&nbsp;
              <strong>image_url：</strong>来自图片库或外部链接
            </div>
          </Section>

          {/* 第四节：设备绑定 */}
          <Section title="4 · 设备绑定 & 会话">
            <FlowRow>
              <Box label="平台 / 渠道" sublabel="管理员" colorKey="platform" width={160} />
              <Arrow label="生成" />
              <Box label="激活码" sublabel="Regular / Trial" colorKey="device" width={150} />
              <Arrow label="客户使用" />
              <Box label="设备已绑定" sublabel="状态：Unused→Bound" colorKey="device" width={170} />
            </FlowRow>
            <div style={{ marginTop: 14 }}>
              <FlowRow>
                <Box label="客户" colorKey="customer" />
                <Arrow label="将服装分配给" />
                <Box label="设备（智能镜）" colorKey="device" width={150} />
                <Arrow label="使用模板" />
                <Box label="试穿会话" sublabel="每次记录日志" colorKey="template" width={150} />
              </FlowRow>
            </div>
          </Section>

          {/* 第五节：Portal 权限 */}
          <Section title="5 · 各端权限速览">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                {
                  key: 'platform' as ColorKey, label: '平台超管',
                  items: ['管理渠道 & 客户', '创建 & 分配模板', '查看全量服装 & 设备', '查看图片资产（只读）', '邮件记录 & 官网询盘'],
                },
                {
                  key: 'channel' as ColorKey, label: '渠道',
                  items: ['管理渠道下属客户', '为客户分配模板', '生成激活码', '查看客户账号成员'],
                },
                {
                  key: 'customer' as ColorKey, label: '客户',
                  items: ['导入 & 管理服装', '上传图片库', '开启 / 停用已分配模板', '管理设备 & 会话', '管理团队成员'],
                },
              ].map((portal) => {
                const c = COLORS[portal.key];
                return (
                  <div key={portal.key} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '12px 14px' }}>
                    <Text strong style={{ color: c.text, display: 'block', marginBottom: 8 }}>{portal.label}</Text>
                    {portal.items.map((item) => (
                      <div key={item} style={{ fontSize: 12, color: '#555', padding: '2px 0' }}>· {item}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </Section>
        </Card>

        <Text type="secondary" style={{ display: 'block', marginTop: 20, textAlign: 'center', fontSize: 12 }}>
          AI Fitting Mirror Demo · 业务流程参考
        </Text>
      </div>
    </div>
  );
}
