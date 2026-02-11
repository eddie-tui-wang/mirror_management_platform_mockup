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
      message.success(`已邀请 ${values.email} 作为 ${values.role}（模拟）`);
      setInviteOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<MemberRow> = [
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role_key',
      key: 'role_key',
      render: (role: RoleKey) => (
        <Tag color={role === 'HQOwner' ? 'blue' : 'green'}>{role}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '当前活跃设备',
      dataIndex: 'current_device',
      key: 'current_device',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="customer:users:disable" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(
                  `${record.status === 'Active' ? '禁用' : '启用'} 用户 ${record.name}（模拟）`
                )
              }
            >
              {record.status === 'Active' ? '禁用' : '启用'}
            </Button>
          </PermGuard>
          <PermGuard permission="customer:users:reset_password" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`重置 ${record.name} 的密码（模拟）`)
              }
            >
              重置密码
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
          {orgName} - 组织成员
        </Title>
        <PermGuard permission="customer:users:invite">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setInviteOpen(true)}
          >
            邀请成员
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
        title="邀请成员"
        open={inviteOpen}
        onOk={handleInvite}
        onCancel={() => {
          setInviteOpen(false);
          form.resetFields();
        }}
        okText="邀请"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效邮箱' },
            ]}
          >
            <Input placeholder="请输入被邀请人邮箱" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              placeholder="请选择角色"
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
