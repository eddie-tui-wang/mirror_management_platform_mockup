'use client';

import React, { useState } from 'react';
import {
  Typography, Tag, Button, Space, Table, Switch, Select, Input,
  Alert, Divider, Form, Modal,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, LinkOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

// ── 工具组件 ─────────────────────────────────────────────────────────────

function Spec({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 4 }}>
      <Text type="secondary" style={{ width: 160, flexShrink: 0 }}>{label}</Text>
      <code style={{
        background: highlight ? '#fff7e6' : '#f5f5f5',
        border: highlight ? '1px solid #ffd591' : 'none',
        padding: '1px 6px', borderRadius: 4, fontSize: 12,
      }}>{value}</code>
    </div>
  );
}

// Card 组件支持可选的 Ant Design 文档链接
function Card({ title, docUrl, children }: { title: string; docUrl?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#999' }}>
          {title}
        </Text>
        {docUrl && (
          <a href={docUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#1677ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Ant Design 文档 <LinkOutlined />
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

// 状态说明行
function StateRow({ state, desc, children }: { state: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
      <Text style={{ width: 100, flexShrink: 0, fontSize: 12 }}>
        <code style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: 4 }}>{state}</code>
      </Text>
      <Text type="secondary" style={{ width: 220, flexShrink: 0, fontSize: 12 }}>{desc}</Text>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>
    </div>
  );
}

// ── 表格示例数据 ──────────────────────────────────────────────────────────

const sampleTableData = [
  { key: '1', name: 'Black Suit Set', category: 'Whole look', sex: 'male', status: 'Active' },
  { key: '2', name: 'Evening Gown', category: 'Whole look', sex: 'female', status: 'Active' },
  { key: '3', name: 'Casual Jacket', category: 'Top', sex: 'unisex', status: 'Disabled' },
];

// ── 页面 ──────────────────────────────────────────────────────────────────

export default function ComponentsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        <Link href="/" style={{ color: '#1677ff', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeftOutlined /> 返回总览
        </Link>

        <Title level={3} style={{ margin: '0 0 4px' }}>组件库 & CSS 规范</Title>
        <Text type="secondary" style={{ display: 'block', fontSize: 14 }}>
          项目中使用的所有 UI 组件、设计 Token 与状态规范。
        </Text>

        {/* 使用说明 */}
        <Alert
          style={{ margin: '16px 0 28px', borderRadius: 8 }}
          type="info"
          showIcon
          message="两层参考策略"
          description={
            <div style={{ fontSize: 13, lineHeight: '1.8' }}>
              <strong>第一层（本页）：</strong>项目内实际使用的组件变体、定制样式与状态规范。<br />
              <strong>第二层（Ant Design 文档）：</strong>每个组件卡片右上角有「Ant Design 文档 ↗」链接，
              hover / focus / active 等交互态请直接在官方文档查阅完整说明。
            </div>
          }
        />

        {/* ── 1. 颜色 Token ── */}
        <Card title="1 · 颜色 Token" docUrl="https://ant.design/docs/react/customize-theme">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { name: 'Primary', hex: '#1677ff', usage: '主操作、链接' },
              { name: 'Success', hex: '#52c41a', usage: 'Active 状态、OK' },
              { name: 'Warning', hex: '#faad14', usage: '警告、试用提示' },
              { name: 'Error', hex: '#ff4d4f', usage: '错误、危险操作' },
              { name: 'Platform', hex: '#531dab', usage: '平台端 Portal 标签' },
              { name: 'Channel', hex: '#0958d9', usage: '渠道端 Portal 标签' },
              { name: 'Customer', hex: '#389e0d', usage: '客户端 Portal 标签' },
              { name: 'Neutral', hex: '#8c8c8c', usage: '次要文字、占位符' },
            ].map((color) => (
              <div key={color.name} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                <div style={{ background: color.hex, height: 44 }} />
                <div style={{ padding: '8px 10px', background: '#fff' }}>
                  <Text strong style={{ fontSize: 11, display: 'block' }}>{color.name}</Text>
                  <code style={{ fontSize: 11, color: '#888' }}>{color.hex}</code>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>{color.usage}</Text>
                </div>
              </div>
            ))}
          </div>
          <Spec label="主色 CSS 变量" value="--ant-color-primary: #1677ff" />
          <Spec label="成功色 CSS 变量" value="--ant-color-success: #52c41a" />
          <Spec label="Portal 颜色" value="platform #531dab / channel #0958d9 / customer #389e0d（hardcode）" highlight />
        </Card>

        {/* ── 2. 字体规范 ── */}
        <Card title="2 · 字体规范" docUrl="https://ant.design/components/typography">
          <div style={{ marginBottom: 16 }}>
            {[
              { el: 'Title h2', size: '30px', weight: '600', sample: '页面大标题' },
              { el: 'Title h3', size: '24px', weight: '600', sample: '章节标题' },
              { el: 'Title h4', size: '20px', weight: '600', sample: 'Garments — Customer X' },
              { el: 'Body / 正文', size: '14px', weight: '400', sample: '表格内容、表单默认文字' },
              { el: 'Secondary / 次要', size: '14px', weight: '400', sample: '说明文字、时间戳、描述' },
              { el: 'Small / 提示', size: '12px', weight: '400', sample: '字段提示、表格脚注' },
              { el: 'Code / 代码', size: '12px', weight: '400', sample: 'g_9001  cat_01  dev_09' },
            ].map((t) => (
              <div key={t.el} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <Text style={{ width: 160, flexShrink: 0, fontSize: 12, color: '#aaa' }}>{t.el}</Text>
                <Text style={{ width: 70, flexShrink: 0, fontSize: 12, color: '#aaa' }}>{t.size} / {t.weight}</Text>
                <span style={{ fontSize: t.size, fontWeight: t.weight as React.CSSProperties['fontWeight'], color: t.el.includes('次要') ? '#8c8c8c' : undefined }}>
                  {t.el === 'Code / 代码' ? <code>{t.sample}</code> : t.sample}
                </span>
              </div>
            ))}
          </div>
          <Spec label="字体族" value="system-ui, -apple-system, sans-serif" />
          <Spec label="行高" value="1.5714（正文），1.3（标题）" />
        </Card>

        {/* ── 3. 状态 Tag ── */}
        <Card title="3 · 状态 & 分类 Tag" docUrl="https://ant.design/components/tag">
          <Space wrap size={[8, 12]}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>组织 / 服装状态</Text>
              <Space><Tag color="green">Active</Tag><Tag color="red">Disabled</Tag></Space>
            </div>
            <Divider type="vertical" style={{ height: 40 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>设备状态</Text>
              <Space><Tag color="green">Online</Tag><Tag color="default">Offline</Tag></Space>
            </div>
            <Divider type="vertical" style={{ height: 40 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>性别（sex）</Text>
              <Space><Tag color="blue">male</Tag><Tag color="pink">female</Tag><Tag color="purple">unisex</Tag></Space>
            </div>
            <Divider type="vertical" style={{ height: 40 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>品类（category）</Text>
              <Space><Tag color="cyan">Top</Tag><Tag color="cyan">Bottom</Tag><Tag color="cyan">Whole look</Tag></Space>
            </div>
            <Divider type="vertical" style={{ height: 40 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>激活码状态</Text>
              <Space><Tag color="blue">Unused</Tag><Tag color="green">Bound</Tag><Tag color="red">Expired</Tag><Tag color="default">Revoked</Tag></Space>
            </div>
            <Divider type="vertical" style={{ height: 40 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>会话状态</Text>
              <Space><Tag color="green">ACTIVE</Tag><Tag color="orange">EXPIRED</Tag><Tag color="default">TERMINATED</Tag></Space>
            </div>
            <Divider type="vertical" style={{ height: 40 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>图片格式</Text>
              <Space><Tag color="blue">JPG</Tag><Tag color="green">PNG</Tag><Tag color="purple">WEBP</Tag></Space>
            </div>
          </Space>
        </Card>

        {/* ── 4. 按钮状态 ── */}
        <Card title="4 · 按钮（Button）— 所有状态" docUrl="https://ant.design/components/button">
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
            ⚠️ hover / focus / active 的颜色变化由 Ant Design 内部 token 控制，点击右上角文档查看完整交互态。
            下方展示项目中出现的所有静态状态。
          </Text>

          <StateRow state="default" desc="正常态，未交互">
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
            <Button type="text">Text</Button>
          </StateRow>
          <StateRow state="danger" desc="危险 / 破坏性操作">
            <Button danger>Default Danger</Button>
            <Button type="primary" danger>Primary Danger</Button>
            <Button type="link" danger>Link Danger</Button>
          </StateRow>
          <StateRow state="disabled" desc="无权限或条件不满足时禁用，颜色变灰，不可点击">
            <Button disabled>Default</Button>
            <Button type="primary" disabled>Primary</Button>
            <Button danger disabled>Danger</Button>
          </StateRow>
          <StateRow state="loading" desc="异步操作进行中，防止重复提交">
            <Button type="primary" loading>保存中...</Button>
            <Button loading>加载中</Button>
          </StateRow>
          <StateRow state="size" desc="small 用于表格操作列，default 用于页面主操作">
            <Button type="primary" size="small">Small</Button>
            <Button type="primary">Default</Button>
          </StateRow>
          <StateRow state="icon" desc="带图标按钮，图标在文字左侧">
            <Button type="primary" icon={<PlusOutlined />}>新增</Button>
            <Button type="link" size="small" icon={<EditOutlined />}>Edit</Button>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </StateRow>

          <div style={{ marginTop: 14 }}>
            <Spec label="圆角" value="6px（默认），8px（登录页专用）" />
            <Spec label="高度 default" value="32px" />
            <Spec label="高度 small" value="24px" />
            <Spec label="高度 large（登录页）" value="44px" highlight />
            <Spec label="登录按钮背景（定制）" value="linear-gradient(135deg, #667eea, #764ba2)" highlight />
            <Spec label="hover 色（Primary）" value="自动加亮 10%，由 Ant Design token 控制" />
            <Spec label="disabled 透明度" value="opacity: 0.65（Ant Design 默认）" />
          </div>
        </Card>

        {/* ── 5. 表单元素状态 ── */}
        <Card title="5 · 表单元素（Input / Select / Switch）— 所有状态" docUrl="https://ant.design/components/input">
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
            focus 状态会出现蓝色外发光边框（`box-shadow: 0 0 0 2px rgba(22,119,255,0.2)`），error 状态为红色。
          </Text>

          <StateRow state="default" desc="正常态">
            <Input placeholder="请输入..." style={{ width: 200 }} />
            <Select placeholder="请选择" style={{ width: 160 }} options={[{ label: 'Top', value: 'Top' }]} />
            <Switch />
          </StateRow>
          <StateRow state="with value" desc="已填写 / 已选中">
            <Input defaultValue="Black Suit Set" style={{ width: 200 }} />
            <Select defaultValue="Top" style={{ width: 160 }} options={[{ label: 'Top', value: 'Top' }, { label: 'Bottom', value: 'Bottom' }]} />
            <Switch defaultChecked checkedChildren="Active" unCheckedChildren="Disabled" />
          </StateRow>
          <StateRow state="disabled" desc="禁用，背景变灰，不可交互">
            <Input disabled placeholder="不可编辑" style={{ width: 200 }} />
            <Select disabled defaultValue="Top" style={{ width: 160 }} options={[{ label: 'Top', value: 'Top' }]} />
            <Switch disabled />
          </StateRow>
          <StateRow state="error" desc="校验失败，红色边框（表单 validateStatus=error）">
            <Form.Item validateStatus="error" help="名称不能为空" style={{ margin: 0 }}>
              <Input placeholder="名称" style={{ width: 200 }} />
            </Form.Item>
          </StateRow>
          <StateRow state="allowClear" desc="搜索框带清除按钮">
            <Input.Search placeholder="搜索文件名..." allowClear style={{ width: 240 }} />
          </StateRow>

          <div style={{ marginTop: 14 }}>
            <Spec label="focus 边框色" value="#1677ff，外发光 box-shadow rgba(22,119,255,0.2)" />
            <Spec label="error 边框色" value="#ff4d4f，外发光 rgba(255,77,79,0.2)" />
            <Spec label="disabled 背景" value="rgba(0,0,0,0.04)（Ant Design 默认）" />
            <Spec label="Switch 激活色" value="#1677ff（跟随 Primary Token）" />
          </div>
        </Card>

        {/* ── 6. 表格 ── */}
        <Card title="6 · 表格（Table）" docUrl="https://ant.design/components/table">
          <Table
            size="middle"
            dataSource={sampleTableData}
            rowKey="key"
            pagination={false}
            columns={[
              {
                title: '预览',
                width: 70,
                render: () => (
                  <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 10 }}>img</Text>
                  </div>
                ),
              },
              { title: '名称', dataIndex: 'name' },
              { title: 'Category', dataIndex: 'category', render: (v: string) => <Tag color="cyan">{v}</Tag> },
              { title: 'Sex', dataIndex: 'sex', render: (v: string) => <Tag color={v === 'male' ? 'blue' : v === 'female' ? 'pink' : 'purple'}>{v}</Tag> },
              { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'Active' ? 'green' : 'red'}>{v}</Tag> },
              {
                title: '操作', render: () => (
                  <Space size="small">
                    <Button type="link" size="small" icon={<EditOutlined />}>Edit</Button>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
                  </Space>
                ),
              },
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <Spec label="row hover 背景" value="#fafafa（Ant Design 默认，由 token.colorFillAlter 控制）" />
            <Spec label="error 行背景（导入预览）" value="background: #fff2f0（手动设置 onRow style）" highlight />
            <Spec label="行高" value="54px（middle），40px（small）" />
            <Spec label="分页" value="pageSize: 10（服装），20（图片）" />
            <Spec label="图片缩略图" value="60×60px，border-radius: 4px，objectFit: cover" />
          </div>
        </Card>

        {/* ── 7. 提示 & 反馈 ── */}
        <Card title="7 · 提示 & 反馈（Alert / message）" docUrl="https://ant.design/components/alert">
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            <Alert type="info" showIcon message="已选中 2 件服装" description="可使用上方操作栏进行批量操作。" />
            <Alert type="warning" showIcon message="存在错误行" description="可选择「忽略错误，强制导入」或修正后重新上传。" />
            <Alert type="error" showIcon message="无法删除该分类" description="3 件服装正在使用此分类，请先重新分类。" />
            <Alert type="success" showIcon message="成功导入 3 件服装。" />
          </Space>
          <div style={{ marginTop: 14 }}>
            <Spec label="圆角" value="8px" />
            <Spec label="info 用途" value="批量选中操作栏" />
            <Spec label="warning 用途" value="导入有错误行时" />
            <Spec label="error 用途" value="操作被阻止（删除分类等）" />
            <Spec label="success 用途" value="操作成功（导入、保存等）" />
            <Spec label="全局提示" value="message.success / error / info（顶部弹出，2s 消失）" />
          </div>
        </Card>

        {/* ── 8. 弹窗 ── */}
        <Card title="8 · 弹窗（Modal）" docUrl="https://ant.design/components/modal">
          <Space style={{ marginBottom: 16 }}>
            <Button onClick={() => setModalOpen(true)}>打开示例弹窗</Button>
          </Space>
          <Modal
            title={`编辑服装 — "Black Suit Set"`}
            open={modalOpen}
            onOk={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
            okText="保存"
            cancelText="取消"
            width={520}
          >
            <Form layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item label="名称">
                <Input defaultValue="Black Suit Set" />
              </Form.Item>
              <Form.Item label="状态">
                <Switch defaultChecked checkedChildren="Active" unCheckedChildren="Disabled" />
              </Form.Item>
              <Form.Item label="品类">
                <Select defaultValue="Whole look" style={{ width: '100%' }}
                  options={[{ label: 'Top', value: 'Top' }, { label: 'Bottom', value: 'Bottom' }, { label: 'Whole look', value: 'Whole look' }]}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            Footer 模式汇总：
          </Text>
          <Space wrap size={[8, 8]} style={{ marginBottom: 14 }}>
            <div style={{ display: 'inline-flex', gap: 8, background: '#f5f5f5', padding: '8px 12px', borderRadius: 6 }}>
              <Button size="small">取消</Button>
              <Button type="primary" size="small">确认</Button>
            </div>
            <div style={{ display: 'inline-flex', gap: 8, background: '#f5f5f5', padding: '8px 12px', borderRadius: 6 }}>
              <Button size="small">取消</Button>
              <Button danger size="small">忽略错误，强制导入</Button>
              <Button type="primary" size="small" disabled>Confirm Import</Button>
            </div>
          </Space>

          <Spec label="宽度（标准）" value="520px" />
          <Spec label="宽度（宽版）" value="680px（批量导入预览）" />
          <Spec label="Form layout" value="vertical，marginTop: 16px" />
          <Spec label="overlay 背景" value="rgba(0,0,0,0.45)（Ant Design 默认）" />
        </Card>

        {/* ── 9. 间距 & 布局 ── */}
        <Card title="9 · 间距 & 布局">
          <Spec label="页面水平内边距" value="24px" />
          <Spec label="筛选栏 margin-bottom" value="16px（filter bar），12px（bulk bar）" />
          <Spec label="卡片圆角" value="8px（弹窗、Alert），12px（总览卡片）" />
          <Spec label="卡片边框" value="1px solid #f0f0f0 或 #e8e8e8" />
          <Spec label="侧边栏宽度" value="220px" />
          <Spec label="顶部导航栏高度" value="64px" />
          <Spec label="Content 区域" value="margin: 24px，padding: 24px，white bg，borderRadius from token" />
          <Spec label="图片缩略图（表格）" value="60×60px，border-radius: 4px，objectFit: cover" />
          <Spec label="图片缩略图（Edit 弹窗）" value="64×64px，border-radius: 6px，border: 1px solid #f0f0f0" />
          <Spec label="图片选择器" value="4 列网格，gap: 10px，选中边框: 2px solid #1677ff" highlight />
          <Spec label="选中图标" value="CheckCircleFilled，color: #1677ff，右上角绝对定位" highlight />
        </Card>

        {/* ── 10. PermGuard ── */}
        <Card title="10 · 权限守卫组件（PermGuard）">
          <Paragraph style={{ fontSize: 13 }}>
            用 <code>&lt;PermGuard permission=&quot;key&quot;&gt;</code> 包裹按钮，实现 RBAC 控制。
          </Paragraph>
          <div style={{ background: '#f6f6f6', borderRadius: 8, padding: 16 }}>
            <pre style={{ margin: 0, fontSize: 12, color: '#333' }}>{`// 默认：无权限时隐藏
<PermGuard permission="customer:garments:upload">
  <Button type="primary">Upload / Import</Button>
</PermGuard>

// fallback="disable"：禁用 + 锁图标 tooltip
<PermGuard permission="customer:garments:delete" fallback="disable">
  <Button danger>Delete</Button>
</PermGuard>`}</pre>
          </div>
          <div style={{ marginTop: 14 }}>
            <Spec label="默认 fallback" value="hide（元素不渲染）" />
            <Spec label="disable fallback" value="按钮禁用 + 🔒 tooltip" />
            <Spec label="权限配置来源" value="src/lib/permissions.ts → PORTAL_PERMISSIONS" />
          </div>
        </Card>

        {/* ── 11. 项目定制 Token ── */}
        <Card title="11 · 项目定制（与 Ant Design 默认值不同的部分）">
          <Alert
            type="warning" showIcon style={{ marginBottom: 16 }}
            message="以下是本项目覆盖或新增的样式，Ant Design 文档中找不到这些值，开发时以此为准。"
          />

          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#555' }}>登录页按钮</Text>
          <Spec label="背景（定制渐变）" value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" highlight />
          <Spec label="box-shadow" value="0 4px 12px rgba(102,126,234,0.35)" highlight />
          <Spec label="高度" value="44px（大于 Ant 默认 32px）" highlight />
          <Spec label="border-radius" value="8px（大于 Ant 默认 6px）" highlight />
          <Spec label="border" value="none（覆盖默认边框）" highlight />

          <Divider style={{ margin: '16px 0' }} />
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#555' }}>Portal 颜色标识</Text>
          <Spec label="Platform（平台）" value="#531dab" highlight />
          <Spec label="Channel（渠道）" value="#0958d9" highlight />
          <Spec label="Customer（客户）" value="#389e0d" highlight />
          <Spec label="使用位置" value="侧边栏 Portal Tag、顶部 Avatar 背景色、用户下拉菜单 Tag" />

          <Divider style={{ margin: '16px 0' }} />
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#555' }}>导入预览表格</Text>
          <Spec label="错误行背景" value="background: #fff2f0（通过 onRow 注入 style）" highlight />
          <Spec label="错误文字色" value="color: #ff4d4f" highlight />

          <Divider style={{ margin: '16px 0' }} />
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#555' }}>图片选择器（图片库 Picker）</Text>
          <Spec label="选中边框" value="2px solid #1677ff" highlight />
          <Spec label="未选中边框" value="2px solid transparent" highlight />
          <Spec label="选中角标图标" value="CheckCircleFilled，color #1677ff，position absolute，top 4px right 4px" highlight />

          <Divider style={{ margin: '16px 0' }} />
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: '#555' }}>字段规范（导入模板）</Text>
          <Spec label="category 枚举值" value="Top | Bottom | Whole look" highlight />
          <Spec label="sex 枚举值" value="male | female | unisex" highlight />
          <Spec label="image_url" value="来自图片库 URL 或外部链接，非必填" />
        </Card>

        <Text type="secondary" style={{ display: 'block', marginTop: 4, textAlign: 'center', fontSize: 12 }}>
          AI Fitting Mirror Demo · 组件规范参考
        </Text>
      </div>
    </div>
  );
}
