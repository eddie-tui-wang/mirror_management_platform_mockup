'use client';

import React, { useMemo, useState } from 'react';
import { Table, Tag, Typography, Button, Modal, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
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

  const { codes, setNickname } = useCodeStore();

  const customerCodes = useMemo(
    () => codes.filter((c) => c.org_id === orgId),
    [codes, orgId]
  );

  // Set Nickname modal
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [nicknameTarget, setNicknameTarget] = useState<ActivationCode | null>(null);
  const [nicknameValue, setNicknameValue] = useState('');

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
          maxLength={50}
          showCount
          autoFocus
        />
      </Modal>
    </div>
  );
}
