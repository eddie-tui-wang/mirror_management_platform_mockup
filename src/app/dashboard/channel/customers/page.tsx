'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Typography, Select, message, Radio, Alert, Divider } from 'antd';
import { PlusOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getChannelCustomers, getCustomerSummary } from '@/lib/mock-data';
import { useCodeStore } from '@/lib/code-store';
import type { Organization, Status, ActivationCode, ActivationCodeStatus, CodeType } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title, Text } = Typography;

const TRIAL_LIMIT = 10; // max Unused Trial codes per customer

const CODE_STATUS_COLOR: Record<ActivationCodeStatus, string> = {
  Unused: 'blue',
  Bound: 'green',
  Expired: 'default',
  Revoked: 'red',
};

interface CustomerRow extends Organization {
  adminEmail: string;
  adminStatus: Status;
  adminLastLogin: string | null;
  memberCount: number;
  onlineDeviceCount: number;
}

export default function ChannelCustomersPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('all');
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});
  const [form] = Form.useForm();

  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [codesOrg, setCodesOrg] = useState<CustomerRow | null>(null);
  const [createCodeModalOpen, setCreateCodeModalOpen] = useState(false);
  const [createCodeForm] = Form.useForm();

  const { codes, revokeCode, assignToCustomer, createCodeForCustomer } = useCodeStore();

  const orgCodes = useMemo(
    () => (codesOrg ? codes.filter((c) => c.org_id === codesOrg.org_id) : []),
    [codes, codesOrg]
  );

  // Channel pool: unassigned codes belonging to this channel
  const channelPool = useMemo(
    () =>
      currentUser
        ? codes.filter(
            (c) =>
              c.channel_org_id === currentUser.org_id &&
              c.org_id === null &&
              c.status === 'Unused'
          )
        : [],
    [codes, currentUser]
  );

  const unusedTrialCount = useMemo(
    () => orgCodes.filter((c) => c.status === 'Unused' && c.code_type === 'Trial').length,
    [orgCodes]
  );

  const regularCount = useMemo(
    () => orgCodes.filter((c) => c.code_type === 'Regular').length,
    [orgCodes]
  );

  const baseCustomers: CustomerRow[] = useMemo(() => {
    if (!currentUser) return [];
    const customers = getChannelCustomers(currentUser.org_id);
    return customers.map((org) => {
      const summary = getCustomerSummary(org.org_id);
      return {
        ...org,
        adminEmail: summary.adminEmail,
        adminStatus: summary.adminStatus,
        adminLastLogin: summary.adminLastLogin,
        memberCount: summary.memberCount,
        onlineDeviceCount: summary.onlineDeviceCount,
      };
    });
  }, [currentUser]);

  const allCustomers: CustomerRow[] = useMemo(() => {
    return baseCustomers.map((row) => ({
      ...row,
      status: statusOverrides[row.org_id] ?? row.status,
    }));
  }, [baseCustomers, statusOverrides]);

  const filteredData = useMemo(() => {
    if (accountStatusFilter === 'all') return allCustomers;
    return allCustomers.filter((c) => c.status === accountStatusFilter);
  }, [allCustomers, accountStatusFilter]);

  const handleCreateCode = () => {
    createCodeForm.validateFields().then((values) => {
      createCodeForCustomer(
        codesOrg!.org_id,
        'Trial',
        values.trialMaxSessions,
        'channel',
        currentUser?.org_id ?? null,
      );
      message.success(`Trial code created for ${codesOrg?.name} · ${values.trialMaxSessions} sessions`);
      setCreateCodeModalOpen(false);
      createCodeForm.resetFields();
    });
  };

  const handleAssignFromPool = (code: ActivationCode) => {
    if (!codesOrg) return;
    Modal.confirm({
      title: `Assign code ${code.code} to ${codesOrg.name}?`,
      content: `This ${code.code_type} code will be moved from the channel pool and assigned to ${codesOrg.name}.`,
      okText: 'Assign',
      okType: 'primary',
      onOk: () => {
        assignToCustomer(code.code_id, codesOrg.org_id);
        message.success(`Code assigned to ${codesOrg.name}`);
      },
    });
  };

  const handleCreate = () => {
    form.validateFields().then((values) => {
      message.success(`Customer "${values.name}" created successfully (simulated)`);
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const toggleStatus = (record: CustomerRow) => {
    const next: Status = record.status === 'Active' ? 'Disabled' : 'Active';
    const action = next === 'Disabled' ? 'disabled' : 'enabled';
    Modal.confirm({
      title: `${next === 'Disabled' ? 'Disable' : 'Enable'} customer "${record.name}"?`,
      content: next === 'Disabled'
        ? 'All users under this customer will lose access until re-enabled.'
        : 'The customer account will be restored to active status.',
      okText: next === 'Disabled' ? 'Disable' : 'Enable',
      okType: next === 'Disabled' ? 'danger' : 'primary',
      onOk: () => {
        setStatusOverrides((prev) => ({ ...prev, [record.org_id]: next }));
        message.success(`Customer "${record.name}" has been ${action}.`);
      },
    });
  };

  const columns: ColumnsType<CustomerRow> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'adminEmail', key: 'adminEmail' },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'Active' ? 'green' : 'red'}>{record.status}</Tag>
      ),
    },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="channel:customers:create_code">
            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => { setCodesOrg(record); setCodesModalOpen(true); }}
            >
              Manage Codes
            </Button>
          </PermGuard>
          {record.adminLastLogin === null && (
            <PermGuard permission="channel:users:reinvite" fallback="disable">
              <Button
                type="link"
                size="small"
                onClick={() => message.success(`Invitation resent to ${record.adminEmail} (simulated)`)}
              >
                Resend Invitation
              </Button>
            </PermGuard>
          )}
          <Button
            type="link"
            size="small"
            danger={record.status === 'Active'}
            onClick={() => toggleStatus(record)}
          >
            {record.status === 'Active' ? 'Disable' : 'Enable'}
          </Button>
        </Space>
      ),
    },
  ];

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
      title: 'Action',
      key: 'action',
      render: (_: unknown, rec: ActivationCode) => (
        <PermGuard permission="channel:codes:assign">
          <Button type="link" size="small" onClick={() => handleAssignFromPool(rec)}>
            Assign
          </Button>
        </PermGuard>
      ),
    },
  ];

  if (!currentUser) return null;

  const trialLimitReached = unusedTrialCount >= TRIAL_LIMIT;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {currentUser.org_name} - Customer Management
        </Title>
        <PermGuard permission="channel:customers:create">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Create Customer (Reseller)
          </Button>
        </PermGuard>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <span>Status:</span>
        <Select
          value={accountStatusFilter}
          onChange={setAccountStatusFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Active', label: 'Active' },
            { value: 'Disabled', label: 'Disabled' },
          ]}
        />
      </Space>

      <Table<CustomerRow>
        columns={columns}
        dataSource={filteredData}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Manage Codes Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Activation Codes — {codesOrg?.name}</span>
          </Space>
        }
        open={codesModalOpen}
        onCancel={() => { setCodesModalOpen(false); setCodesOrg(null); }}
        footer={null}
        width={800}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Space direction="vertical" size={2}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Trial codes (Unused):{' '}
              <Text strong style={{ color: trialLimitReached ? '#ff4d4f' : undefined }}>
                {unusedTrialCount} / {TRIAL_LIMIT}
              </Text>
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Regular codes (assigned by platform): <Text strong>{regularCount}</Text>
            </Text>
            {codesOrg?.status === 'Disabled' && (
              <Text type="danger" style={{ fontSize: 12 }}>Account is disabled</Text>
            )}
          </Space>
          <PermGuard permission="channel:customers:create_code">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              disabled={trialLimitReached || codesOrg?.status === 'Disabled'}
              onClick={() => setCreateCodeModalOpen(true)}
            >
              Create Trial Code
            </Button>
          </PermGuard>
        </div>

        {trialLimitReached && (
          <Alert
            type="warning"
            showIcon
            message={`This customer has reached the limit of ${TRIAL_LIMIT} unused Trial codes.`}
            style={{ marginBottom: 12, fontSize: 12 }}
          />
        )}

        <Table<ActivationCode>
          size="small"
          dataSource={orgCodes}
          rowKey="code_id"
          pagination={false}
          columns={[
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
              render: (t: string) => (
                <Tag color={t === 'Regular' ? 'blue' : 'orange'}>{t}</Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (s: ActivationCodeStatus) => <Tag color={CODE_STATUS_COLOR[s]}>{s}</Tag>,
            },
            {
              title: 'Device ID',
              dataIndex: 'bound_device_id',
              key: 'bound_device_id',
              render: (id: string | null) =>
                id ? <Text code style={{ fontSize: 12 }}>{id}</Text> : <Text type="secondary">—</Text>,
            },
            {
              title: 'Nickname',
              dataIndex: 'nickname',
              key: 'nickname',
              render: (v: string | null) => v ?? <Text type="secondary">—</Text>,
            },
            {
              title: 'Created By',
              dataIndex: 'created_by_portal',
              key: 'created_by_portal',
              render: (p: 'platform' | 'channel') => (
                <Tag color={p === 'platform' ? 'purple' : 'cyan'}>
                  {p === 'platform' ? 'Platform' : 'Channel'}
                </Tag>
              ),
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
                    type="link"
                    size="small"
                    danger
                    onClick={() =>
                      Modal.confirm({
                        title: `Revoke code ${rec.code}?`,
                        content: 'This code will be permanently revoked and cannot be used to bind a device.',
                        okText: 'Revoke',
                        okType: 'danger',
                        onOk: () => { revokeCode(rec.code_id); message.success('Code revoked'); },
                      })
                    }
                  >
                    Revoke
                  </Button>
                ) : null,
            },
          ]}
        />

        {/* Assign from Channel Pool */}
        <Divider style={{ fontSize: 13 }}>Assign from Channel Pool</Divider>
        {channelPool.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 12 }}>No available codes in channel pool.</Text>
        ) : (
          <Table<ActivationCode>
            size="small"
            dataSource={channelPool}
            rowKey="code_id"
            pagination={false}
            columns={poolColumns}
            locale={{ emptyText: 'No codes available in pool.' }}
          />
        )}
      </Modal>

      {/* Create Trial Code Modal */}
      <Modal
        title={`Create Trial Activation Code — ${codesOrg?.name ?? ''}`}
        open={createCodeModalOpen}
        onOk={handleCreateCode}
        onCancel={() => { setCreateCodeModalOpen(false); createCodeForm.resetFields(); }}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={createCodeForm} layout="vertical">
          <Form.Item
            name="trialMaxSessions"
            label="Max Try-on Sessions"
            initialValue={25}
            rules={[{ required: true, message: 'Please select max sessions' }]}
          >
            <Radio.Group>
              <Radio value={25}>25 sessions</Radio>
              <Radio value={50}>50 sessions</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Customer Modal */}
      <Modal
        title="Create Customer (Reseller)"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="Please enter customer name" />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="Admin Email"
            rules={[
              { required: true, message: 'Please enter admin email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Please enter admin email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
