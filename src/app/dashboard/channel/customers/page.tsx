'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Switch, InputNumber, Typography, Select, Tooltip, message } from 'antd';
import { PlusOutlined, WarningOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getChannelCustomers, getCustomerSummary, getOrgActivationCodes } from '@/lib/mock-data';
import type { Organization, Status, TrialStatus, ActivationCode, ActivationCodeStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title, Text } = Typography;

const CODE_LIMIT = 5;
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
  isTrial: boolean;
  trialStatus: TrialStatus;
  remainingDays: number;
  trialEndDate: string;
  trialMaxSales: number;
  trialUsedSales: number;
  trialRemainingSales: number;
}

export default function ChannelCustomersPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [accountKindFilter, setAccountKindFilter] = useState<string>('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('all');
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});
  const [form] = Form.useForm();

  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [codesOrg, setCodesOrg] = useState<CustomerRow | null>(null);
  const orgCodes = useMemo(
    () => (codesOrg ? getOrgActivationCodes(codesOrg.org_id) : []),
    [codesOrg]
  );
  const unusedCount = useMemo(
    () => orgCodes.filter((c) => c.status === 'Unused').length,
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
        isTrial: summary.isTrial,
        trialStatus: summary.trialStatus,
        remainingDays: summary.remainingDays,
        trialEndDate: summary.trialEndDate,
        trialMaxSales: summary.trialMaxSales,
        trialUsedSales: summary.trialUsedSales,
        trialRemainingSales: summary.trialRemainingSales,
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
    let result = allCustomers;
    if (accountKindFilter === 'Trial') result = result.filter((c) => c.isTrial);
    else if (accountKindFilter === 'Regular') result = result.filter((c) => !c.isTrial);
    if (accountStatusFilter !== 'all') result = result.filter((c) => c.status === accountStatusFilter);
    return result;
  }, [allCustomers, accountKindFilter, accountStatusFilter]);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const trialLabel = isTrial ? ` (Trial: ${values.trialDays ?? 14} days, ${values.trialMaxSales ?? 50} sales)` : '';
      message.success(`Customer "${values.name}" created successfully${trialLabel} (simulated)`);
      setCreateModalOpen(false);
      setIsTrial(false);
      form.resetFields();
    });
  };

  const renderAccountKind = (record: CustomerRow) => {
    if (!record.isTrial) {
      return <Tag color="blue">Regular</Tag>;
    }
    const salesInfo = `Used ${record.trialUsedSales}/${record.trialMaxSales}, ${record.trialRemainingSales} remaining`;
    const daysInfo = `Trial ends: ${record.trialEndDate}, ${record.remainingDays} days remaining`;
    const tip = `${daysInfo}\n${salesInfo}`;
    if (record.trialStatus === 'expired') {
      return (
        <Tooltip title={tip}>
          <Space size={4} direction="vertical">
            <Tag color="red" icon={<WarningOutlined />}>Trial - Expired</Tag>
            <Typography.Text type="danger" style={{ fontSize: 12 }}>
              {record.trialRemainingSales <= 0 ? 'Quota exhausted' : `${record.remainingDays} days left`}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={tip}>
        <Space size={4} direction="vertical">
          <Tag color="orange">Trial</Tag>
          <Typography.Text type="warning" style={{ fontSize: 12 }}>
            {record.trialRemainingSales}/{record.trialMaxSales} remaining · {record.remainingDays} days
          </Typography.Text>
        </Space>
      </Tooltip>
    );
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
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Account',
      key: 'accountKind',
      render: (_, record) => renderAccountKind(record),
    },
    {
      title: 'Admin',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'Active' ? 'green' : 'red'}>{record.status}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
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

  if (!currentUser) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {currentUser.org_name} - Customer Management
        </Title>
        <PermGuard permission="channel:customers:create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Customer (Reseller)
          </Button>
        </PermGuard>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <span>Account Type:</span>
        <Select
          value={accountKindFilter}
          onChange={setAccountKindFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Regular', label: 'Regular' },
            { value: 'Trial', label: 'Trial' },
          ]}
        />
        <span>Account Status:</span>
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
        width={760}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text type="secondary">
            {unusedCount} / {CODE_LIMIT} Unused slots used
            {codesOrg?.status === 'Disabled' && (
              <Text type="danger" style={{ marginLeft: 8 }}>— Account is disabled</Text>
            )}
          </Text>
          <PermGuard permission="channel:customers:create_code">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              disabled={unusedCount >= CODE_LIMIT || codesOrg?.status === 'Disabled'}
              onClick={() =>
                message.success(`New activation code created for ${codesOrg?.name} (simulated)`)
              }
            >
              Create Code
            </Button>
          </PermGuard>
        </div>
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
                        onOk: () => message.success('Code revoked (simulated)'),
                      })
                    }
                  >
                    Revoke
                  </Button>
                ) : null,
            },
          ]}
        />
      </Modal>

      <Modal
        title="Create Customer (Reseller)"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          setIsTrial(false);
          form.resetFields();
        }}
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
            label="HQ Admin Email"
            rules={[
              { required: true, message: 'Please enter HQ Admin email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Will become this customer's HQ Owner account" />
          </Form.Item>

          <Form.Item label="Trial Account">
            <Space>
              <Switch checked={isTrial} onChange={setIsTrial} />
              <span>{isTrial ? 'Trial Enabled' : 'Regular Account'}</span>
            </Space>
          </Form.Item>

          {isTrial && (
            <>
              <Form.Item
                name="trialDays"
                label="Trial Days"
                initialValue={14}
                rules={[{ required: true, message: 'Please enter trial days' }]}
              >
                <InputNumber min={1} max={90} style={{ width: '100%' }} placeholder="Trial period (days)" />
              </Form.Item>
              <Form.Item
                name="trialMaxSales"
                label="Trial Limit (Max Sales)"
                initialValue={50}
                rules={[{ required: true, message: 'Please enter trial limit' }]}
              >
                <InputNumber min={1} max={9999} style={{ width: '100%' }} placeholder="Max sales count for trial" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
