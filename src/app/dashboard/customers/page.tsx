'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, message, Select, Modal, Form, Input, Switch, InputNumber, Tooltip } from 'antd';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter, useSearchParams } from 'next/navigation';
import { organizations, getCustomerSummary } from '@/lib/mock-data';
import type { Organization, CustomerType, Status, TrialStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface CustomerRow extends Organization {
  customerType: CustomerType;
  channelName: string;
  adminEmail: string;
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

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>(searchParams.get('channel') ?? 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accountKindFilter, setAccountKindFilter] = useState<string>(searchParams.get('accountKind') ?? 'all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [form] = Form.useForm();

  const channels = useMemo(
    () => organizations.filter((o) => o.org_type === 'CHANNEL'),
    []
  );

  const allCustomers: CustomerRow[] = useMemo(() => {
    return organizations
      .filter((org) => org.org_type === 'CUSTOMER')
      .map((org) => {
        const summary = getCustomerSummary(org.org_id);
        return {
          ...org,
          customerType: summary.customerType,
          channelName: summary.channelName,
          adminEmail: summary.adminEmail,
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
  }, []);

  const dataSource = useMemo(() => {
    let filtered = allCustomers;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((c) => c.customerType === typeFilter);
    }

    if (channelFilter !== 'all') {
      filtered = filtered.filter((c) => c.parent_org_id === channelFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (accountKindFilter !== 'all') {
      if (accountKindFilter === 'Trial') {
        filtered = filtered.filter((c) => c.isTrial);
      } else {
        filtered = filtered.filter((c) => !c.isTrial);
      }
    }

    return filtered;
  }, [allCustomers, typeFilter, channelFilter, statusFilter, accountKindFilter]);

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
              {record.trialRemainingSales <= 0 ? 'Quota exhausted' : `${record.trialRemainingSales} remaining`}
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

  const columns: ColumnsType<CustomerRow> = [
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'customer_id',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'Customer Type',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type: CustomerType) => (
        <Tag color={type === 'Direct' ? 'blue' : 'purple'}>
          {type === 'Direct' ? 'Direct' : 'Reseller'}
        </Tag>
      ),
    },
    {
      title: 'Account Type',
      key: 'accountKind',
      render: (_, record) => renderAccountKind(record),
    },
    {
      title: 'Channel',
      dataIndex: 'channelName',
      key: 'channelName',
      render: (name: string) => (name === '-' ? '-' : name),
    },
    {
      title: 'HQ Admin',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/users?org=${record.org_id}`)}
          >
            View Members
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/assets/garments?org=${record.org_id}`)}
          >
            View Assets
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Customer Management</Title>
        <Space>
          <PermGuard permission="platform:customers:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Customer (Direct)
            </Button>
          </PermGuard>
        </Space>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <span>Customer Type:</span>
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 150 }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Direct', label: 'Direct' },
            { value: 'Reseller', label: 'Reseller' },
          ]}
        />
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
        <span>Channel:</span>
        <Select
          value={channelFilter}
          onChange={setChannelFilter}
          style={{ width: 150 }}
          options={[
            { value: 'all', label: 'All' },
            ...channels.map((ch) => ({
              value: ch.org_id,
              label: ch.name,
            })),
          ]}
        />
        <span>Status:</span>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
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
        dataSource={dataSource}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Create Customer (Direct)"
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
            <Input placeholder="Please enter HQ Admin email" />
          </Form.Item>

          <Form.Item label="Trial Account">
            <Space>
              <Switch
                checked={isTrial}
                onChange={setIsTrial}
              />
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
