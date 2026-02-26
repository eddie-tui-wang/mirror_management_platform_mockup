'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Tag, Typography, Select, Space, Badge, Tooltip,
} from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { devices, organizations, sessions } from '@/lib/mock-data';
import type { Device, DeviceStatus } from '@/lib/types';

const { Title, Text } = Typography;

// 从 devices 数组派生出所有涉及的 org 列表（用于筛选）
function buildOrgOptions() {
  const seen = new Set<string>();
  const opts: { label: string; value: string }[] = [];
  devices.forEach((d) => {
    if (d.current_org_id && !seen.has(d.current_org_id)) {
      seen.add(d.current_org_id);
      opts.push({ label: d.current_org_name ?? d.current_org_id, value: d.current_org_id });
    }
  });
  return opts.sort((a, b) => a.label.localeCompare(b.label));
}

export default function PlatformDevicesPage() {
  const [filterOrgId, setFilterOrgId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | undefined>(undefined);
  const [filterNew, setFilterNew] = useState<boolean | undefined>(undefined);

  const orgOptions = useMemo(() => buildOrgOptions(), []);

  // 为每台设备附加最近一次 session 信息
  const dataSource = useMemo(() => {
    return devices
      .filter((d) => {
        if (filterOrgId && d.current_org_id !== filterOrgId) return false;
        if (filterStatus && d.status !== filterStatus) return false;
        if (filterNew === true && !d.is_new) return false;
        if (filterNew === false && d.is_new) return false;
        return true;
      })
      .map((d) => {
        const lastSession = sessions
          .filter((s) => s.device_id === d.device_id)
          .sort((a, b) => b.login_at.localeCompare(a.login_at))[0];
        const orgType = organizations.find((o) => o.org_id === d.current_org_id)?.org_type ?? null;
        return { ...d, lastSession, orgType };
      });
  }, [filterOrgId, filterStatus, filterNew]);

  const newDeviceCount = useMemo(() => devices.filter((d) => d.is_new).length, []);

  const columns: ColumnsType<typeof dataSource[0]> = [
    {
      title: 'Device ID',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string, record) => (
        <Space size={6}>
          <Text code>{id}</Text>
          {record.is_new && (
            <Tag color="blue" style={{ fontSize: 11 }}>New</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Nickname',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (val: string | null) =>
        val ? <Text>{val}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
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
      title: 'Org',
      key: 'org',
      render: (_, record) => (
        <div>
          <Text>{record.current_org_name ?? '—'}</Text>
          {record.orgType && (
            <Tag
              style={{ marginLeft: 6, fontSize: 11 }}
              color={record.orgType === 'CUSTOMER' ? 'green' : 'blue'}
            >
              {record.orgType}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Current User',
      dataIndex: 'current_user_email',
      key: 'current_user_email',
      render: (val: string | null) =>
        val ? <Text>{val}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Session Start',
      dataIndex: 'session_start',
      key: 'session_start',
      render: (val: string | null) =>
        val ? <Text>{val}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'First / Last Seen',
      key: 'seen',
      render: (_, record) => (
        <div>
          {record.is_new && record.first_seen && (
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>First login: </Text>
              <Text style={{ fontSize: 12 }}>{record.first_seen}</Text>
            </div>
          )}
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Last seen: </Text>
            <Text style={{ fontSize: 12 }}>{record.last_seen}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Last Session Status',
      key: 'session_status',
      render: (_, record) => {
        const s = record.lastSession;
        if (!s) return <Text type="secondary">—</Text>;
        const colorMap: Record<string, string> = {
          ACTIVE: 'green',
          TERMINATED: 'red',
          EXPIRED: 'orange',
        };
        return (
          <Tooltip title={s.termination_reason ?? undefined}>
            <Tag color={colorMap[s.status] ?? 'default'}>{s.status}</Tag>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            <DesktopOutlined style={{ marginRight: 8 }} />
            Device Activity
          </Title>
          {newDeviceCount > 0 && (
            <Tag color="blue">{newDeviceCount} new</Tag>
          )}
        </Space>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          placeholder="Filter by Org"
          allowClear
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
          onChange={setFilterStatus}
          options={[
            { label: 'Online', value: 'Online' },
            { label: 'Offline', value: 'Offline' },
          ]}
        />
        <Select
          placeholder="Filter: New devices"
          allowClear
          style={{ width: 180 }}
          value={filterNew}
          onChange={setFilterNew}
          options={[
            { label: 'New (first login)', value: true },
            { label: 'Established', value: false },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="device_id"
        pagination={{ pageSize: 20 }}
        rowClassName={(record) => (record.is_new ? 'ant-table-row-highlight' : '')}
      />
    </div>
  );
}
