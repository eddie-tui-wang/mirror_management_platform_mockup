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
      const trialLabel = isTrial ? `（试用 ${values.trialDays ?? 14} 天，试用次数 ${values.trialMaxSales ?? 50} 次）` : '';
      message.success(`客户 "${values.name}" 创建成功${trialLabel}（模拟）`);
      setCreateModalOpen(false);
      setIsTrial(false);
      form.resetFields();
    });
  };

  const renderAccountKind = (record: CustomerRow) => {
    if (!record.isTrial) {
      return <Tag color="blue">正式</Tag>;
    }
    const salesInfo = `已用 ${record.trialUsedSales}/${record.trialMaxSales} 次，剩余 ${record.trialRemainingSales} 次`;
    const daysInfo = `试用截止: ${record.trialEndDate}，剩余 ${record.remainingDays} 天`;
    const tip = `${daysInfo}\n${salesInfo}`;
    if (record.trialStatus === 'expired') {
      return (
        <Tooltip title={tip}>
          <Space size={4} direction="vertical">
            <Tag color="red" icon={<WarningOutlined />}>试用-已过期</Tag>
            <Typography.Text type="danger" style={{ fontSize: 12 }}>
              {record.trialRemainingSales <= 0 ? '次数已用完' : `剩余 ${record.trialRemainingSales} 次`}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={tip}>
        <Space size={4} direction="vertical">
          <Tag color="orange">试用中</Tag>
          <Typography.Text type="warning" style={{ fontSize: 12 }}>
            剩余 {record.trialRemainingSales}/{record.trialMaxSales} 次 · {record.remainingDays}天
          </Typography.Text>
        </Space>
      </Tooltip>
    );
  };

  const columns: ColumnsType<CustomerRow> = [
    {
      title: '客户名称',
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
      title: '客户类型',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type: CustomerType) => (
        <Tag color={type === 'Direct' ? 'blue' : 'purple'}>
          {type === 'Direct' ? '直客' : '渠道客户'}
        </Tag>
      ),
    },
    {
      title: '账户类型',
      key: 'accountKind',
      render: (_, record) => renderAccountKind(record),
    },
    {
      title: '归属渠道',
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
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/users?org=${record.org_id}`)}
          >
            查看成员
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/assets/garments?org=${record.org_id}`)}
          >
            查看资产
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>客户管理</Title>
        <Space>
          <PermGuard permission="platform:customers:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              新建客户(直客)
            </Button>
          </PermGuard>
        </Space>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <span>客户类型：</span>
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 150 }}
          options={[
            { value: 'all', label: '全部' },
            { value: 'Direct', label: '直客' },
            { value: 'Reseller', label: '渠道客户' },
          ]}
        />
        <span>账户类型：</span>
        <Select
          value={accountKindFilter}
          onChange={setAccountKindFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部' },
            { value: 'Regular', label: '正式' },
            { value: 'Trial', label: '试用' },
          ]}
        />
        <span>所属渠道：</span>
        <Select
          value={channelFilter}
          onChange={setChannelFilter}
          style={{ width: 150 }}
          options={[
            { value: 'all', label: '全部' },
            ...channels.map((ch) => ({
              value: ch.org_id,
              label: ch.name,
            })),
          ]}
        />
        <span>状态：</span>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部' },
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
        title="新建客户（直客）"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          setIsTrial(false);
          form.resetFields();
        }}
        okText="确认创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="HQ Admin邮箱"
            rules={[
              { required: true, message: '请输入HQ Admin邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入HQ Admin邮箱" />
          </Form.Item>

          <Form.Item label="试用账户">
            <Space>
              <Switch
                checked={isTrial}
                onChange={setIsTrial}
              />
              <span>{isTrial ? '开启试用' : '正式账户'}</span>
            </Space>
          </Form.Item>

          {isTrial && (
            <>
              <Form.Item
                name="trialDays"
                label="试用天数"
                initialValue={14}
                rules={[{ required: true, message: '请输入试用天数' }]}
              >
                <InputNumber min={1} max={90} style={{ width: '100%' }} placeholder="试用期限（天）" />
              </Form.Item>
              <Form.Item
                name="trialMaxSales"
                label="试用次数（销售次数上限）"
                initialValue={50}
                rules={[{ required: true, message: '请输入试用次数' }]}
              >
                <InputNumber min={1} max={9999} style={{ width: '100%' }} placeholder="该客户可使用的试用销售次数" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
