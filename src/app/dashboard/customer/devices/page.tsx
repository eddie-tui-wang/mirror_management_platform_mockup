'use client';

import React, { useMemo } from 'react';
import { Table, Tag, Typography, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgActivationCodes } from '@/lib/mock-data';
import type { ActivationCode, ActivationCodeStatus } from '@/lib/types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<ActivationCodeStatus, string> = {
  Unused: 'blue',
  Bound: 'green',
  Expired: 'default',
  Revoked: 'red',
};

export default function CustomerDevicesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const dataSource = useMemo(() => getOrgActivationCodes(orgId), [orgId]);

  const columns: ColumnsType<ActivationCode> = [
    {
      title: 'Activation Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Text code copyable style={{ fontSize: 13 }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ActivationCodeStatus) => (
        <Tag color={STATUS_COLOR[status]}>{status}</Tag>
      ),
    },
    {
      title: 'Bound Device ID',
      dataIndex: 'bound_device_id',
      key: 'bound_device_id',
      render: (id: string | null) =>
        id ? <Text code>{id}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Nickname',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (val: string | null) =>
        val ? <Text>{val}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Created By',
      dataIndex: 'created_by_portal',
      key: 'created_by_portal',
      render: (portal: 'platform' | 'channel') => (
        <Tag color={portal === 'platform' ? 'purple' : 'cyan'}>
          {portal === 'platform' ? 'Platform' : 'Channel'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Expires At',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (val: string, record) =>
        record.status === 'Unused' ? (
          <Text type="warning">{val}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <Title level={4} style={{ margin: 0 }}>
          {orgName} — Devices
        </Title>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
        Each activation code is single-use. Once entered on a device, it binds that device to your account.
        Contact your account manager to obtain new codes.
      </Text>

      <Table<ActivationCode>
        columns={columns}
        dataSource={dataSource}
        rowKey="code_id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No activation codes yet. Contact your account manager.' }}
      />
    </div>
  );
}
