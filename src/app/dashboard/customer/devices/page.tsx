'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Button, Tag, Space, Typography, Modal, Input, message,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgDevices, getDeviceAssignedGarments } from '@/lib/mock-data';
import type { Device } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

export default function CustomerDevicesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const [addOpen, setAddOpen] = useState(false);
  const [addNickname, setAddNickname] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editNickname, setEditNickname] = useState('');

  const dataSource = useMemo(() => getOrgDevices(orgId), [orgId]);

  const handleAddDevice = () => {
    const trimmed = addNickname.trim();
    message.success(
      trimmed
        ? `Device added with nickname "${trimmed}" (simulated)`
        : 'Device added (simulated)'
    );
    setAddOpen(false);
    setAddNickname('');
  };

  const openEditNickname = (device: Device) => {
    setEditDevice(device);
    setEditNickname(device.nickname ?? '');
    setEditOpen(true);
  };

  const handleEditNickname = () => {
    const trimmed = editNickname.trim();
    message.success(
      `Device ${editDevice?.device_id} nickname updated to "${trimmed || '(none)'}" (simulated)`
    );
    setEditOpen(false);
    setEditDevice(null);
  };

  const columns: ColumnsType<Device> = [
    {
      title: 'Device ID',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'Nickname',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (val: string | null) => val ?? <Typography.Text type="secondary">-</Typography.Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Online' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_seen',
      key: 'last_seen',
    },
    {
      title: 'Current User',
      dataIndex: 'current_user_email',
      key: 'current_user_email',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: 'Garments',
      key: 'garments',
      render: (_, record) => {
        const assigned = getDeviceAssignedGarments(record.device_id);
        return assigned.length > 0
          ? <Tag>{assigned.length} garment(s)</Tag>
          : <Typography.Text type="secondary">-</Typography.Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="customer:devices:manage" fallback="disable">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditNickname(record)}
            >
              Edit Nickname
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {orgName} - Devices
        </Title>
        <PermGuard permission="customer:devices:manage">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddOpen(true)}
          >
            Add Device
          </Button>
        </PermGuard>
      </div>

      <Table<Device>
        columns={columns}
        dataSource={dataSource}
        rowKey="device_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Add Device Modal */}
      <Modal
        title="Add Device"
        open={addOpen}
        onOk={handleAddDevice}
        onCancel={() => {
          setAddOpen(false);
          setAddNickname('');
        }}
        okText="Add"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 8 }}>
          <Typography.Text>Nickname (optional)</Typography.Text>
        </div>
        <Input
          value={addNickname}
          onChange={(e) => setAddNickname(e.target.value)}
          placeholder="e.g. Front Door Mirror"
          onPressEnter={handleAddDevice}
        />
      </Modal>

      {/* Edit Nickname Modal */}
      <Modal
        title={`Edit Nickname — ${editDevice?.device_id}`}
        open={editOpen}
        onOk={handleEditNickname}
        onCancel={() => {
          setEditOpen(false);
          setEditDevice(null);
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          value={editNickname}
          onChange={(e) => setEditNickname(e.target.value)}
          placeholder="Enter device nickname"
          onPressEnter={handleEditNickname}
        />
      </Modal>
    </div>
  );
}
