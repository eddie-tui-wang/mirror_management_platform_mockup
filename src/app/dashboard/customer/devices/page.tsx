'use client';

import React, { useMemo } from 'react';
import { Table, Button, Badge, Space, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgDevices } from '@/lib/mock-data';
import type { Device, DeviceStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

export default function CustomerDevicesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const dataSource: Device[] = useMemo(() => {
    return getOrgDevices(orgId);
  }, [orgId]);

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
      title: '当前用户',
      dataIndex: 'current_user_email',
      key: 'current_user_email',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '会话开始时间',
      dataIndex: 'session_start',
      key: 'session_start',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) =>
        record.status === 'Online' ? (
          <PermGuard permission="customer:devices:force_logout" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.info(`强制登出设备 ${record.device_id}（模拟）`)
              }
            >
              强制登出
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
        {orgName} - 设备管理
      </Title>

      <Table<Device>
        columns={columns}
        dataSource={dataSource}
        rowKey="device_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
