'use client';

import React, { useMemo, useState } from 'react';
import { Table, Tag, Typography, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { activationCodes, organizations } from '@/lib/mock-data';
import type { ActivationCode, ActivationCodeStatus, CodeType } from '@/lib/types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<ActivationCodeStatus, string> = {
  Unused: 'blue',
  Bound: 'green',
  Expired: 'default',
  Revoked: 'red',
};

export default function PlatformDevicesPage() {
  const [filterOrgId, setFilterOrgId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<ActivationCodeStatus | undefined>(undefined);

  const orgOptions = useMemo(() =>
    organizations
      .filter((o) => o.org_type === 'CUSTOMER')
      .map((o) => ({ label: o.name, value: o.org_id })),
    []
  );

  const orgNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    organizations.forEach((o) => { map[o.org_id] = o.name; });
    return map;
  }, []);

  const dataSource = useMemo(() =>
    activationCodes.filter((ac) => {
      if (filterOrgId && ac.org_id !== filterOrgId) return false;
      if (filterStatus && ac.status !== filterStatus) return false;
      return true;
    }),
    [filterOrgId, filterStatus]
  );

  const columns: ColumnsType<ActivationCode> = [
    {
      title: 'Activation Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Text code style={{ fontSize: 12 }}>{code}</Text>,
    },
    {
      title: 'Org',
      dataIndex: 'org_id',
      key: 'org',
      render: (orgId: string) => orgNameMap[orgId] ?? orgId,
    },
    {
      title: 'Type',
      dataIndex: 'code_type',
      key: 'code_type',
      render: (type: CodeType) => (
        <Tag color={type === 'Trial' ? 'orange' : 'blue'}>{type}</Tag>
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
        id ? <Text code style={{ fontSize: 12 }}>{id}</Text> : <Text type="secondary">—</Text>,
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
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Activation Codes (Global View)
        </Title>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Filter by Org"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 200 }}
          value={filterOrgId}
          onChange={setFilterOrgId}
          options={orgOptions}
        />
        <Select
          placeholder="Filter by Status"
          allowClear
          style={{ width: 160 }}
          value={filterStatus}
          onChange={(val) => setFilterStatus(val as ActivationCodeStatus | undefined)}
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
        dataSource={dataSource}
        rowKey="code_id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
