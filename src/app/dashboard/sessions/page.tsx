'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Select, Alert, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { organizations, sessions, devices } from '@/lib/mock-data';
import type { Session, SessionStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

const STATUS_TAG_MAP: Record<SessionStatus, { color: string }> = {
  ACTIVE: { color: 'green' },
  TERMINATED: { color: 'red' },
  EXPIRED: { color: 'default' },
};

export default function SessionsPage() {
  const [filterOrgId, setFilterOrgId] = useState<string | undefined>(undefined);
  const [filterUserId, setFilterUserId] = useState<string | undefined>(undefined);
  const [filterDeviceId, setFilterDeviceId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<SessionStatus | undefined>(undefined);

  const orgOptions = useMemo(() => {
    return organizations.map((o) => ({ label: `${o.name} (${o.org_id})`, value: o.org_id }));
  }, []);

  const userOptions = useMemo(() => {
    const uniqueUsers = new Map<string, string>();
    sessions.forEach((s) => {
      if (!uniqueUsers.has(s.user_id)) {
        uniqueUsers.set(s.user_id, s.user_email);
      }
    });
    return Array.from(uniqueUsers.entries()).map(([id, email]) => ({
      label: `${email} (${id})`,
      value: id,
    }));
  }, []);

  const deviceOptions = useMemo(() => {
    return devices.map((d) => ({ label: d.device_id, value: d.device_id }));
  }, []);

  const dataSource: Session[] = useMemo(() => {
    return sessions.filter((s) => {
      if (filterOrgId && s.org_id !== filterOrgId) return false;
      if (filterUserId && s.user_id !== filterUserId) return false;
      if (filterDeviceId && s.device_id !== filterDeviceId) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      return true;
    });
  }, [filterOrgId, filterUserId, filterDeviceId, filterStatus]);

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
        <Tag color={STATUS_TAG_MAP[status].color}>{status}</Tag>
      ),
    },
    {
      title: '登录用户邮箱',
      dataIndex: 'user_email',
      key: 'user_email',
    },
    {
      title: 'user_id',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'device_id',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '组织名称',
      dataIndex: 'org_name',
      key: 'org_name',
    },
    {
      title: 'org_id',
      dataIndex: 'org_id',
      key: 'org_id',
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
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="platform:sessions:terminate">
            <Button
              type="link"
              size="small"
              danger
              disabled={record.status !== 'ACTIVE'}
              onClick={() =>
                message.warning(
                  `终止会话 ${record.session_id}（用户: ${record.user_email}）（模拟）`
                )
              }
            >
              终止会话
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>会话管理</Title>

      <Alert
        message="规则提示：同账号只允许1个ACTIVE会话，新登录会踢下线旧设备"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="组织"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 220 }}
          value={filterOrgId}
          onChange={setFilterOrgId}
          options={orgOptions}
        />
        <Select
          placeholder="用户"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 240 }}
          value={filterUserId}
          onChange={setFilterUserId}
          options={userOptions}
        />
        <Select
          placeholder="设备"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 140 }}
          value={filterDeviceId}
          onChange={setFilterDeviceId}
          options={deviceOptions}
        />
        <Select
          placeholder="状态"
          allowClear
          style={{ width: 140 }}
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
