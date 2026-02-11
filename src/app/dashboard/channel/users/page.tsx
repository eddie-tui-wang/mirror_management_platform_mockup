'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, message, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getChannelCustomers, memberships, users, organizations } from '@/lib/mock-data';
import type { RoleKey, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface CustomerUserRow {
  key: string;
  user_id: string;
  email: string;
  name: string;
  status: Status;
  last_login: string | null;
  org_id: string;
  org_name: string;
  role_key: RoleKey;
}

export default function ChannelUsersPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const searchParams = useSearchParams();

  const [orgFilter, setOrgFilter] = useState<string>(searchParams.get('org') ?? 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const channelCustomers = useMemo(() => {
    if (!currentUser) return [];
    return getChannelCustomers(currentUser.org_id);
  }, [currentUser]);

  const allUsers: CustomerUserRow[] = useMemo(() => {
    const customerOrgIds = channelCustomers.map((c) => c.org_id);
    const customerMemberships = memberships.filter((m) =>
      customerOrgIds.includes(m.org_id)
    );

    return customerMemberships.map((m) => {
      const user = users.find((u) => u.user_id === m.user_id);
      const org = organizations.find((o) => o.org_id === m.org_id);
      return {
        key: `${m.user_id}_${m.org_id}`,
        user_id: m.user_id,
        email: user?.email ?? '-',
        name: user?.name ?? '-',
        status: user?.status ?? 'Disabled',
        last_login: user?.last_login ?? null,
        org_id: m.org_id,
        org_name: org?.name ?? '-',
        role_key: m.role_key,
      };
    });
  }, [channelCustomers]);

  const dataSource = useMemo(() => {
    let filtered = allUsers;

    if (orgFilter !== 'all') {
      filtered = filtered.filter((u) => u.org_id === orgFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role_key === roleFilter);
    }

    return filtered;
  }, [allUsers, orgFilter, statusFilter, roleFilter]);

  const columns: ColumnsType<CustomerUserRow> = [
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'user_id',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '所属客户名称',
      dataIndex: 'org_name',
      key: 'org_name',
    },
    {
      title: 'customer_id',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '角色',
      dataIndex: 'role_key',
      key: 'role_key',
      render: (role: RoleKey) => (
        <Tag color={role === 'HQOwner' ? 'blue' : 'cyan'}>{role}</Tag>
      ),
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
      title: '最后登录时间',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="channel:users:reinvite" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`已重发邀请到 ${record.email}（模拟）`)
              }
            >
              重发邀请
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  if (!currentUser) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {currentUser.org_name} - 客户账号管理
        </Title>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <span>客户：</span>
        <Select
          value={orgFilter}
          onChange={setOrgFilter}
          style={{ width: 180 }}
          options={[
            { value: 'all', label: '全部客户' },
            ...channelCustomers.map((c) => ({
              value: c.org_id,
              label: c.name,
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
        <span>角色：</span>
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          style={{ width: 140 }}
          options={[
            { value: 'all', label: '全部' },
            { value: 'HQOwner', label: 'HQOwner' },
            { value: 'HQOps', label: 'HQOps' },
          ]}
        />
      </Space>

      <Table<CustomerUserRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
