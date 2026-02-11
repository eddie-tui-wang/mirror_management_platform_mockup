'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Select, Alert, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgSessions, getOrgMembers } from '@/lib/mock-data';
import type { Session, SessionStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

const SESSION_STATUS_COLOR: Record<SessionStatus, string> = {
  ACTIVE: 'green',
  TERMINATED: 'red',
  EXPIRED: 'default',
};

export default function CustomerSessionsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [filterUser, setFilterUser] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const orgMembers = useMemo(() => getOrgMembers(orgId), [orgId]);

  const allSessions: Session[] = useMemo(() => {
    return getOrgSessions(orgId);
  }, [orgId]);

  const dataSource = useMemo(() => {
    let filtered = allSessions;
    if (filterUser) {
      filtered = filtered.filter((s) => s.user_id === filterUser);
    }
    if (filterStatus) {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }
    return filtered;
  }, [allSessions, filterUser, filterStatus]);

  const columns: ColumnsType<Session> = [
    {
      title: 'session_id',
      dataIndex: 'session_id',
      key: 'session_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: SessionStatus) => (
        <Tag color={SESSION_STATUS_COLOR[status]}>{status}</Tag>
      ),
    },
    {
      title: '登录用户',
      dataIndex: 'user_email',
      key: 'user_email',
    },
    {
      title: 'device_id',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'login_at',
      dataIndex: 'login_at',
      key: 'login_at',
    },
    {
      title: 'logout_at',
      dataIndex: 'logout_at',
      key: 'logout_at',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: 'termination_reason',
      dataIndex: 'termination_reason',
      key: 'termination_reason',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) =>
        record.status === 'ACTIVE' ? (
          <PermGuard permission="customer:sessions:terminate" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.info(`终止会话 ${record.session_id}（模拟）`)
              }
            >
              终止会话
            </Button>
          </PermGuard>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        {orgName} - 会话管理
      </Title>

      <Alert
        message="同账号只允许1个ACTIVE会话，新登录会踢下线旧设备"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <span>用户：</span>
        <Select
          placeholder="全部用户"
          allowClear
          style={{ width: 200 }}
          value={filterUser}
          onChange={setFilterUser}
          options={orgMembers.map((u) => ({
            label: `${u.name} (${u.email})`,
            value: u.user_id,
          }))}
        />
        <span>状态：</span>
        <Select
          placeholder="全部状态"
          allowClear
          style={{ width: 150 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'TERMINATED', value: 'TERMINATED' },
            { label: 'EXPIRED', value: 'EXPIRED' },
          ]}
        />
      </Space>

      <Table<Session>
        columns={columns}
        dataSource={dataSource}
        rowKey="session_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
