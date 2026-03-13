'use client';

import React, { useMemo, useState } from 'react';
import { Table, Tag, Typography, Space, Button, Modal, Input, Progress } from 'antd';
import { DesktopOutlined, EditOutlined } from '@ant-design/icons';
import { message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { useCodeStore } from '@/lib/code-store';
import type { ActivationCode, ActivationCodeStatus, CodeType } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

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

  const { codes, bindCode, setNickname } = useCodeStore();

  const customerCodes = useMemo(
    () => codes.filter((c) => c.org_id === orgId),
    [codes, orgId]
  );

  // Bind Device modal
  const [bindOpen, setBindOpen] = useState(false);
  const [bindTarget, setBindTarget] = useState<ActivationCode | null>(null);
  const [bindDeviceId, setBindDeviceId] = useState('');

  // Set Nickname modal
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [nicknameTarget, setNicknameTarget] = useState<ActivationCode | null>(null);
  const [nicknameValue, setNicknameValue] = useState('');

  const handleBind = () => {
    if (!bindTarget || !bindDeviceId.trim()) return;
    bindCode(bindTarget.code_id, bindDeviceId.trim());
    message.success(`Device "${bindDeviceId.trim()}" bound successfully`);
    setBindOpen(false);
    setBindTarget(null);
    setBindDeviceId('');
  };

  const handleSetNickname = () => {
    if (!nicknameTarget) return;
    setNickname(nicknameTarget.code_id, nicknameValue.trim());
    message.success('Nickname updated');
    setNicknameOpen(false);
    setNicknameTarget(null);
    setNicknameValue('');
  };

  const columns: ColumnsType<ActivationCode> = [
    {
      title: 'Activation Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Text code copyable style={{ fontSize: 13 }}>{code}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'code_type',
      key: 'code_type',
      render: (type: CodeType) => <Tag color={type === 'Trial' ? 'orange' : 'blue'}>{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ActivationCodeStatus) => <Tag color={STATUS_COLOR[status]}>{status}</Tag>,
    },
    {
      title: 'Sessions',
      key: 'sessions',
      render: (_: unknown, r: ActivationCode) => {
        if (r.code_type !== 'Trial') return <Text type="secondary">—</Text>;
        const max = r.trial_max_sessions ?? 0;
        const used = r.trial_used_sessions ?? 0;
        return (
          <Space direction="vertical" size={2} style={{ width: 120 }}>
            <Text style={{ fontSize: 12 }}>{used} / {max} used</Text>
            <Progress percent={Math.round((used / max) * 100)} size="small" showInfo={false} status={used >= max ? 'exception' : 'normal'} />
          </Space>
        );
      },
    },
    {
      title: 'Bound Device',
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
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, rec: ActivationCode) => {
        if (rec.status === 'Unused') {
          return (
            <PermGuard permission="customer:devices:manage">
              <Button
                type="link" size="small" icon={<DesktopOutlined />}
                onClick={() => { setBindTarget(rec); setBindDeviceId(''); setBindOpen(true); }}
              >
                Bind Device
              </Button>
            </PermGuard>
          );
        }
        if (rec.status === 'Bound') {
          return (
            <PermGuard permission="customer:devices:manage">
              <Button
                type="link" size="small" icon={<EditOutlined />}
                onClick={() => { setNicknameTarget(rec); setNicknameValue(rec.nickname ?? ''); setNicknameOpen(true); }}
              >
                {rec.nickname ? 'Edit Nickname' : 'Set Nickname'}
              </Button>
            </PermGuard>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <Title level={4} style={{ margin: 0 }}>{orgName} — Devices</Title>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
        Each activation code is single-use. Enter it on a device to bind it to your account. Contact your account manager to obtain new codes.
      </Text>

      <Table<ActivationCode>
        columns={columns}
        dataSource={customerCodes}
        rowKey="code_id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No activation codes yet. Contact your account manager.' }}
      />

      {/* Bind Device Modal */}
      <Modal
        title={`Bind Device — ${bindTarget?.code}`}
        open={bindOpen}
        onOk={handleBind}
        onCancel={() => { setBindOpen(false); setBindTarget(null); setBindDeviceId(''); }}
        okText="Bind"
        okButtonProps={{ disabled: !bindDeviceId.trim() }}
        cancelText="Cancel"
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
          Enter the Device ID of the smart mirror you want to bind this activation code to.
        </Text>
        <Input
          prefix={<DesktopOutlined style={{ color: '#bbb' }} />}
          placeholder="e.g. dev_42"
          value={bindDeviceId}
          onChange={(e) => setBindDeviceId(e.target.value)}
          onPressEnter={handleBind}
          autoFocus
        />
      </Modal>

      {/* Set Nickname Modal */}
      <Modal
        title={`Set Nickname — ${nicknameTarget?.bound_device_id}`}
        open={nicknameOpen}
        onOk={handleSetNickname}
        onCancel={() => { setNicknameOpen(false); setNicknameTarget(null); setNicknameValue(''); }}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="e.g. Fitting Room A"
          value={nicknameValue}
          onChange={(e) => setNicknameValue(e.target.value)}
          onPressEnter={handleSetNickname}
          autoFocus
        />
      </Modal>
    </div>
  );
}
