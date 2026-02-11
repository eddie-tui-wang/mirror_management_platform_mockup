'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { organizations, getCustomerSummary } from '@/lib/mock-data';
import type { Organization, CustomerType, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface CustomerRow extends Organization {
  customerType: CustomerType;
  channelName: string;
  adminEmail: string;
  memberCount: number;
  onlineDeviceCount: number;
}

export default function CustomersPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

    return filtered;
  }, [allCustomers, typeFilter, channelFilter, statusFilter]);

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
      title: '在线设备数',
      dataIndex: 'onlineDeviceCount',
      key: 'onlineDeviceCount',
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
            onClick={() =>
              message.info(`跳转到用户管理，筛选org=${record.org_id}`)
            }
          >
            查看成员
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() =>
              message.info(`查看客户 ${record.name} 的资产`)
            }
          >
            查看资产
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() =>
              message.info(`查看客户 ${record.name} 的设备`)
            }
          >
            查看设备
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
              onClick={() => message.info('新建直客（模拟）')}
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
    </div>
  );
}
