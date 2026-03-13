'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Button, Tag, Space, Modal, Form, Input, Typography, message, Radio,
} from 'antd';
import { PlusOutlined, SearchOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { organizations, users, getChannelSummary } from '@/lib/mock-data';
import { useCodeStore } from '@/lib/code-store';
import type { Organization, Status, ActivationCode, ActivationCodeStatus, CodeType } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title, Text } = Typography;

const CODE_STATUS_COLOR: Record<ActivationCodeStatus, string> = {
  Unused: 'blue', Bound: 'green', Expired: 'default', Revoked: 'red',
};

interface ChannelRow {
  org_id: string;
  name: string;
  status: Status;
  created_at: string;
  adminEmail: string;
  customerCount: number;
}

export default function ChannelsPage() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});

  // Code pool modal
  const [codesChannel, setCodesChannel] = useState<ChannelRow | null>(null);
  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [createCodeModalOpen, setCreateCodeModalOpen] = useState(false);
  const [codeTypeChoice, setCodeTypeChoice] = useState<CodeType>('Regular');
  const [trialSessions, setTrialSessions] = useState<25 | 50>(25);

  const { codes, revokeCode, createCodeForChannel } = useCodeStore();

  const channelPool = useMemo(
    () => codes.filter((c) => c.channel_org_id === codesChannel?.org_id && c.org_id === null),
    [codes, codesChannel]
  );

  const baseData: ChannelRow[] = useMemo(() => {
    return organizations
      .filter((org) => org.org_type === 'CHANNEL')
      .map((org) => {
        const summary = getChannelSummary(org.org_id);
        return {
          org_id: org.org_id,
          name: org.name,
          status: org.status as Status,
          created_at: org.created_at,
          adminEmail: summary.adminEmail,
          customerCount: summary.customerCount,
        };
      });
  }, []);

  const dataSource: ChannelRow[] = useMemo(() => {
    const lower = searchText.toLowerCase();
    return baseData
      .map((row) => ({ ...row, status: statusOverrides[row.org_id] ?? row.status }))
      .filter((row) => !lower || row.name.toLowerCase().includes(lower));
  }, [baseData, statusOverrides, searchText]);

  const toggleStatus = (record: ChannelRow) => {
    const current = statusOverrides[record.org_id] ?? record.status;
    const next: Status = current === 'Active' ? 'Disabled' : 'Active';
    Modal.confirm({
      title: `${next === 'Disabled' ? 'Disable' : 'Enable'} channel "${record.name}"?`,
      content: next === 'Disabled'
        ? 'All users under this channel will be immediately logged out.'
        : 'The channel will be restored to active status.',
      okText: next === 'Disabled' ? 'Disable' : 'Enable',
      okType: next === 'Disabled' ? 'danger' : 'primary',
      onOk: () => {
        setStatusOverrides((prev) => ({ ...prev, [record.org_id]: next }));
        message.success(`Channel "${record.name}" ${next === 'Disabled' ? 'disabled' : 'enabled'}.`);
      },
    });
  };

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const nameTaken = organizations.some(
        (o) => o.org_type === 'CHANNEL' && o.name.toLowerCase() === values.name.trim().toLowerCase()
      );
      if (nameTaken) { form.setFields([{ name: 'name', errors: ['Channel name already exists'] }]); return; }
      const emailTaken = users.some((u) => u.email.toLowerCase() === values.adminEmail.trim().toLowerCase());
      if (emailTaken) { form.setFields([{ name: 'adminEmail', errors: ['Email is already registered'] }]); return; }
      message.success(`Channel "${values.name}" created (simulated)`);
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const handleCreateCode = () => {
    if (!codesChannel) return;
    createCodeForChannel(
      codesChannel.org_id,
      codeTypeChoice,
      codeTypeChoice === 'Trial' ? trialSessions : null,
    );
    message.success(`${codeTypeChoice} code created for ${codesChannel.name}`);
    setCreateCodeModalOpen(false);
  };

  const poolColumns: ColumnsType<ActivationCode> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (c: string) => <Text code style={{ fontSize: 12 }}>{c}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'code_type',
      key: 'code_type',
      render: (t: CodeType) => <Tag color={t === 'Trial' ? 'orange' : 'blue'}>{t}</Tag>,
    },
    {
      title: 'Sessions',
      key: 'sessions',
      render: (_: unknown, r: ActivationCode) =>
        r.code_type === 'Trial' ? <Text>{r.trial_max_sessions}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: ActivationCodeStatus) => <Tag color={CODE_STATUS_COLOR[s]}>{s}</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, rec: ActivationCode) =>
        rec.status === 'Unused' ? (
          <Button
            type="link" size="small" danger
            onClick={() =>
              Modal.confirm({
                title: `Revoke ${rec.code}?`,
                content: 'This code will be permanently revoked.',
                okText: 'Revoke', okType: 'danger',
                onOk: () => { revokeCode(rec.code_id); message.success('Code revoked'); },
              })
            }
          >
            Revoke
          </Button>
        ) : null,
    },
  ];

  const columns: ColumnsType<ChannelRow> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'channel_id', dataIndex: 'org_id', key: 'org_id',
      render: (id: string) => <Text code>{id}</Text>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: Status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>,
    },
    { title: 'Admin Email', dataIndex: 'adminEmail', key: 'adminEmail' },
    { title: 'Customers', dataIndex: 'customerCount', key: 'customerCount' },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => {
        const currentStatus = statusOverrides[record.org_id] ?? record.status;
        return (
          <Space size="small">
            <Button type="link" size="small" onClick={() => router.push(`/dashboard/customers?channel=${record.org_id}`)}>
              View Customers
            </Button>
            <PermGuard permission="platform:channels:assign_code">
              <Button
                type="link" size="small" icon={<KeyOutlined />}
                onClick={() => { setCodesChannel(record); setCodesModalOpen(true); }}
              >
                Manage Codes
              </Button>
            </PermGuard>
            <PermGuard permission="platform:channels:disable">
              <Button
                type="link" size="small"
                danger={currentStatus === 'Active'}
                onClick={() => toggleStatus(record)}
              >
                {currentStatus === 'Active' ? 'Disable' : 'Enable'}
              </Button>
            </PermGuard>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Channel Management</Title>
        <PermGuard permission="platform:channels:create">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Create Channel
          </Button>
        </PermGuard>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Search by channel name"
          allowClear
          style={{ width: 260 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table<ChannelRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Channel Code Pool Modal */}
      <Modal
        title={<Space><KeyOutlined /><span>Activation Code Pool — {codesChannel?.name}</span></Space>}
        open={codesModalOpen}
        onCancel={() => { setCodesModalOpen(false); setCodesChannel(null); }}
        footer={null}
        width={720}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text type="secondary">
            Codes in pool: <Text strong>{channelPool.filter(c => c.status === 'Unused').length} Unused</Text>
            {' · '}
            <Text>{channelPool.length} Total</Text>
          </Text>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setCodeTypeChoice('Regular'); setTrialSessions(25); setCreateCodeModalOpen(true); }}>
            Create Code
          </Button>
        </div>
        <Table<ActivationCode>
          size="small"
          dataSource={channelPool}
          rowKey="code_id"
          pagination={false}
          columns={poolColumns}
          locale={{ emptyText: 'No codes in pool. Create some above.' }}
        />
      </Modal>

      {/* Create Code for Channel Modal */}
      <Modal
        title={`Create Code for ${codesChannel?.name}`}
        open={createCodeModalOpen}
        onOk={handleCreateCode}
        onCancel={() => setCreateCodeModalOpen(false)}
        okText="Create"
        cancelText="Cancel"
      >
        <Form layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item label="Code Type">
            <Radio.Group value={codeTypeChoice} onChange={(e) => setCodeTypeChoice(e.target.value)}>
              <Radio value="Regular">Regular — permanent access, no session limit</Radio>
              <Radio value="Trial">Trial — limited sessions for demo use</Radio>
            </Radio.Group>
          </Form.Item>
          {codeTypeChoice === 'Trial' && (
            <Form.Item label="Max Try-on Sessions">
              <Radio.Group value={trialSessions} onChange={(e) => setTrialSessions(e.target.value)}>
                <Radio value={25}>25 sessions</Radio>
                <Radio value={50}>50 sessions</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Create Channel Modal */}
      <Modal
        title="Create Channel"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Channel Name" rules={[{ required: true, message: 'Please enter channel name' }]}>
            <Input placeholder="e.g. Channel B" />
          </Form.Item>
          <Form.Item name="adminEmail" label="Admin Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="admin@channel.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
