'use client';

import React, { useMemo, useState } from 'react';
import { Table, Tag, Typography, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { useCodeStore } from '@/lib/code-store';
import { organizations } from '@/lib/mock-data';
import type { ActivationCode, ActivationCodeStatus, CodeType } from '@/lib/types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<ActivationCodeStatus, string> = {
  Unused: 'blue', Bound: 'green', Expired: 'default', Revoked: 'red',
};

export default function ChannelCodesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { codes } = useCodeStore();
  const [filterStatus, setFilterStatus] = useState<ActivationCodeStatus | undefined>(undefined);
  const [filterType, setFilterType] = useState<CodeType | undefined>(undefined);

  const orgMap = useMemo(() => {
    const m: Record<string, string> = {};
    organizations.forEach((o) => { m[o.org_id] = o.name; });
    return m;
  }, []);

  const channelCodes = useMemo(() =>
    codes.filter((c) => {
      if (c.channel_org_id !== currentUser?.org_id) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterType && c.code_type !== filterType) return false;
      return true;
    }),
    [codes, currentUser, filterStatus, filterType]
  );

  const columns: ColumnsType<ActivationCode> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (c: string) => <Text code copyable style={{ fontSize: 13 }}>{c}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'code_type',
      key: 'code_type',
      render: (t: CodeType) => <Tag color={t === 'Trial' ? 'orange' : 'blue'}>{t}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: ActivationCodeStatus) => <Tag color={STATUS_COLOR[s]}>{s}</Tag>,
    },
    {
      title: 'Assigned To',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (orgId: string | null) =>
        orgId ? <Text>{orgMap[orgId] ?? orgId}</Text> : <Tag color="gold">Unassigned (Pool)</Tag>,
    },

    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Code Pool</Title>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
        Codes assigned to your channel by the platform. Assign them to your customers via the Customers page.
      </Text>

      <Space style={{ marginBottom: 12 }}>
        <Select
          placeholder="Filter by type"
          allowClear
          style={{ width: 150 }}
          value={filterType}
          onChange={setFilterType}
          options={[
            { label: 'Regular', value: 'Regular' },
            { label: 'Trial', value: 'Trial' },
          ]}
        />
        <Select
          placeholder="Filter by status"
          allowClear
          style={{ width: 180 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: 'Unused', value: 'Unused' },
            { label: 'Bound', value: 'Bound' },
            { label: 'Expired', value: 'Expired' },
            { label: 'Revoked', value: 'Revoked' },
          ]}
        />
      </Space>

      <Table<ActivationCode>
        columns={columns}
        dataSource={channelCodes}
        rowKey="code_id"
        pagination={{ pageSize: 15 }}
        locale={{ emptyText: 'No codes assigned to your channel yet.' }}
      />
    </div>
  );
}
