'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Badge, Space, Typography, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { organizations, devices } from '@/lib/mock-data';
import type { Device, DeviceStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

export default function DevicesPage() {
  const [filterOrgId, setFilterOrgId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | undefined>(undefined);

  const orgOptions = useMemo(() => {
    return organizations.map((o) => ({ label: `${o.name} (${o.org_id})`, value: o.org_id }));
  }, []);

  const dataSource: Device[] = useMemo(() => {
    return devices.filter((d) => {
      if (filterOrgId && d.current_org_id !== filterOrgId) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      return true;
    });
  }, [filterOrgId, filterStatus]);

  const columns: ColumnsType<Device> = [
    {
      title: 'device_id',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: DeviceStatus) => (
        <Badge
          status={status === 'Online' ? 'success' : 'default'}
          text={status}
        />
      ),
    },
    {
      title: 'last_seen',
      dataIndex: 'last_seen',
      key: 'last_seen',
    },
    {
      title: '当前组织名称',
      dataIndex: 'current_org_name',
      key: 'current_org_name',
      render: (name: string | null) => name ?? '-',
    },
    {
      title: 'org_id',
      dataIndex: 'current_org_id',
      key: 'current_org_id',
      render: (id: string | null) =>
        id ? <Typography.Text code>{id}</Typography.Text> : '-',
    },
    {
      title: '当前登录用户',
      dataIndex: 'current_user_email',
      key: 'current_user_email',
      render: (email: string | null) => email ?? '-',
    },
    {
      title: 'user_id',
      dataIndex: 'current_user_id',
      key: 'current_user_id',
      render: (id: string | null) =>
        id ? <Typography.Text code>{id}</Typography.Text> : '-',
    },
    {
      title: '会话开始时间',
      dataIndex: 'session_start',
      key: 'session_start',
      render: (time: string | null) => time ?? '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="platform:devices:force_logout">
            <Button
              type="link"
              size="small"
              disabled={record.status !== 'Online'}
              onClick={() =>
                message.warning(`强制登出设备 ${record.device_id}（模拟）`)
              }
            >
              强制登出
            </Button>
          </PermGuard>
          <PermGuard permission="platform:devices:disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.warning(`禁用设备 ${record.device_id}（模拟）`)
              }
            >
              禁用设备
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>设备管理</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="组织"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 260 }}
          value={filterOrgId}
          onChange={setFilterOrgId}
          options={orgOptions}
        />
        <Select
          placeholder="状态"
          allowClear
          style={{ width: 120 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: 'Online', value: 'Online' },
            { label: 'Offline', value: 'Offline' },
          ]}
        />
      </Space>

      <Table<Device>
        columns={columns}
        dataSource={dataSource}
        rowKey="device_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
