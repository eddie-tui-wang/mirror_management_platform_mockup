'use client';

import React, { useMemo } from 'react';
import {
  Table, Button, Tag, Space, Typography, Modal, Input, message, Alert,
} from 'antd';
import {
  PlusOutlined, EditOutlined, CheckOutlined, DesktopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgDevices, getDeviceAssignedGarments, getOrgNewDevices } from '@/lib/mock-data';
import type { Device } from '@/lib/types';
import PermGuard from '@/components/PermGuard';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function CustomerDevicesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const acknowledgedDeviceIds = useAuthStore((s) => s.acknowledgedDeviceIds);
  const acknowledgeDevices = useAuthStore((s) => s.acknowledgeDevices);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const [addOpen, setAddOpen] = useState(false);
  const [addNickname, setAddNickname] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editNickname, setEditNickname] = useState('');

  const dataSource = useMemo(() => getOrgDevices(orgId), [orgId]);

  // 未经确认的新设备（此 org 下）
  const unacknowledgedNew = useMemo(
    () => getOrgNewDevices(orgId).filter((d) => !acknowledgedDeviceIds.includes(d.device_id)),
    [orgId, acknowledgedDeviceIds]
  );

  const isNew = (deviceId: string) =>
    unacknowledgedNew.some((d) => d.device_id === deviceId);

  const handleAcknowledge = (device: Device) => {
    acknowledgeDevices([device.device_id]);
    message.success(`Device ${device.device_id} acknowledged. You can now set a nickname.`);
  };

  const handleAcknowledgeAll = () => {
    acknowledgeDevices(unacknowledgedNew.map((d) => d.device_id));
    message.success(`${unacknowledgedNew.length} new device(s) acknowledged.`);
  };

  const handleAddDevice = () => {
    const trimmed = addNickname.trim();
    message.success(
      trimmed ? `Device added with nickname "${trimmed}" (simulated)` : 'Device added (simulated)'
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
      render: (id: string) => (
        <Space size={6}>
          <Typography.Text code>{id}</Typography.Text>
          {isNew(id) && <Tag color="blue" style={{ fontSize: 11 }}>New</Tag>}
        </Space>
      ),
    },
    {
      title: 'Nickname',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (val: string | null) =>
        val ?? <Typography.Text type="secondary">—</Typography.Text>,
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
      title: 'Current User',
      dataIndex: 'current_user_email',
      key: 'current_user_email',
      render: (val: string | null) =>
        val ?? <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: 'Garments',
      key: 'garments',
      render: (_, record) => {
        const assigned = getDeviceAssignedGarments(record.device_id);
        return assigned.length > 0 ? (
          <Tag icon={<DesktopOutlined />}>{assigned.length} garment(s)</Tag>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {isNew(record.device_id) && (
            <PermGuard permission="customer:devices:manage" fallback="disable">
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleAcknowledge(record)}
              >
                Acknowledge
              </Button>
            </PermGuard>
          )}
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>{orgName} — Devices</Title>
        <PermGuard permission="customer:devices:manage">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
            Add Device
          </Button>
        </PermGuard>
      </div>

      {/* ── 新设备 Banner ── */}
      {unacknowledgedNew.length > 0 && (
        <Alert
          style={{ marginBottom: 16, borderRadius: 8 }}
          type="warning"
          showIcon
          message={
            <span>
              <strong>{unacknowledgedNew.length}</strong> new device{unacknowledgedNew.length > 1 ? 's have' : ' has'} logged in to your account for the first time.
            </span>
          }
          description={
            <div style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 13 }}>
                Review the devices below and click <strong>Acknowledge</strong> to confirm they belong to your account.
                Unrecognized devices should be reported to the platform.
              </Text>
              <div style={{ marginTop: 8 }}>
                {unacknowledgedNew.map((d) => (
                  <Tag
                    key={d.device_id}
                    icon={<DesktopOutlined />}
                    color="orange"
                    style={{ marginBottom: 4 }}
                  >
                    {d.device_id} · {d.first_seen}
                  </Tag>
                ))}
              </div>
              <Button
                size="small"
                style={{ marginTop: 8 }}
                icon={<CheckOutlined />}
                onClick={handleAcknowledgeAll}
              >
                Acknowledge all
              </Button>
            </div>
          }
        />
      )}

      <Table<Device>
        columns={columns}
        dataSource={dataSource}
        rowKey="device_id"
        pagination={{ pageSize: 10 }}
        rowClassName={(record) =>
          record.is_new && !acknowledgedDeviceIds.includes(record.device_id)
            ? 'ant-table-row-new-device'
            : ''
        }
      />

      {/* Add Device Modal */}
      <Modal
        title="Add Device"
        open={addOpen}
        onOk={handleAddDevice}
        onCancel={() => { setAddOpen(false); setAddNickname(''); }}
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
        onCancel={() => { setEditOpen(false); setEditDevice(null); }}
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
