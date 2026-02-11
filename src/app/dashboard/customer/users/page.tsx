'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { users, memberships, getMembershipInfo } from '@/lib/mock-data';
import type { User, RoleKey, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface MemberRow extends User {
  role_key: RoleKey;
}

export default function CustomerUsersPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form] = Form.useForm();

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const dataSource: MemberRow[] = useMemo(() => {
    const orgMemberships = memberships.filter((m) => m.org_id === orgId);
    return orgMemberships
      .map((m) => {
        const user = users.find((u) => u.user_id === m.user_id);
        if (!user) return null;
        return {
          ...user,
          role_key: m.role_key,
        };
      })
      .filter(Boolean) as MemberRow[];
  }, [orgId]);

  const handleInvite = () => {
    form.validateFields().then((values) => {
      message.success(`Invited ${values.email} as ${values.role} (simulated)`);
      setInviteOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<MemberRow> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role_key',
      key: 'role_key',
      render: (role: RoleKey) => (
        <Tag color={role === 'HQOwner' ? 'blue' : 'green'}>{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: 'Active Device',
      dataIndex: 'current_device',
      key: 'current_device',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="customer:users:disable" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(
                  `${record.status === 'Active' ? 'Disable' : 'Enable'} user ${record.name} (simulated)`
                )
              }
            >
              {record.status === 'Active' ? 'Disable' : 'Enable'}
            </Button>
          </PermGuard>
          <PermGuard permission="customer:users:reset_password" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Reset password for ${record.name} (simulated)`)
              }
            >
              Reset Password
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
          {orgName} - Members
        </Title>
        <PermGuard permission="customer:users:invite">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setInviteOpen(true)}
          >
            Invite Member
          </Button>
        </PermGuard>
      </div>

      <Table<MemberRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="user_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Invite Member"
        open={inviteOpen}
        onOk={handleInvite}
        onCancel={() => {
          setInviteOpen(false);
          form.resetFields();
        }}
        okText="Invite"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Please enter invitee's email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Please select a role"
              options={[
                { label: 'HQOwner', value: 'HQOwner' },
                { label: 'HQOps', value: 'HQOps' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
