'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Switch, InputNumber, Typography, Select, Tooltip, message } from 'antd';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getChannelCustomers, getCustomerSummary } from '@/lib/mock-data';
import type { Organization, Status, TrialStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface CustomerRow extends Organization {
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

export default function ChannelCustomersPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [accountKindFilter, setAccountKindFilter] = useState<string>('all');
  const [form] = Form.useForm();

  const dataSource: CustomerRow[] = useMemo(() => {
    if (!currentUser) return [];
    const customers = getChannelCustomers(currentUser.org_id);
    return customers.map((org) => {
      const summary = getCustomerSummary(org.org_id);
      return {
        ...org,
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
  }, [currentUser]);

  const filteredData = useMemo(() => {
    if (accountKindFilter === 'all') return dataSource;
    if (accountKindFilter === 'Trial') return dataSource.filter((c) => c.isTrial);
    return dataSource.filter((c) => !c.isTrial);
  }, [dataSource, accountKindFilter]);

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
      title: 'Account Type',
      key: 'accountKind',
      render: (_, record) => renderAccountKind(record),
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
            onClick={() => router.push(`/dashboard/channel/users?org=${record.org_id}`)}
          >
            View Accounts
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
        <Space>
          <PermGuard permission="channel:customers:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Customer (Reseller)
            </Button>
          </PermGuard>
        </Space>
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
      </Space>

      <Table<CustomerRow>
        columns={columns}
        dataSource={filteredData}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

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
