'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getChannelCustomers, getCustomerSummary } from '@/lib/mock-data';
import type { Organization, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface CustomerRow extends Organization {
  adminEmail: string;
  memberCount: number;
  onlineDeviceCount: number;
}

export default function ChannelCustomersPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const dataSource: CustomerRow[] = useMemo(() => {
    if (!currentUser) return [];
    const customers = getChannelCustomers(currentUser.org_id);
    return customers.map((org) => {
      const summary = getCustomerSummary(org.org_id);
      return {
        ...org,
        adminEmail: summary.adminEmail,
        memberCount: summary.memberCount,
        onlineDeviceCount: summary.onlineDeviceCount,
      };
    });
  }, [currentUser]);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      message.success(`客户 "${values.name}" 创建成功（模拟）`);
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<CustomerRow> = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'customer_id',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'HQ Admin',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: '在线设备数',
      dataIndex: 'onlineDeviceCount',
      key: 'onlineDeviceCount',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
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
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() =>
              message.info(`跳转到客户账号页，筛选该客户 org=${record.org_id}`)
            }
          >
            查看账号
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() =>
              message.info(`查看客户 ${record.name} 的资产`)
            }
          >
            查看资产
          </Button>
          <PermGuard permission="channel:sessions:view" fallback="hide">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`查看客户 ${record.name} 的设备/会话`)
              }
            >
              查看设备/会话
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  if (!currentUser) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {currentUser.org_name} - 客户管理
        </Title>
        <Space>
          <PermGuard permission="channel:customers:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              新建客户（渠道客户）
            </Button>
          </PermGuard>
        </Space>
      </div>

      <Table<CustomerRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="新建客户（渠道客户）"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        okText="确认创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="HQ Admin邮箱"
            rules={[
              { required: true, message: '请输入HQ Admin邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入HQ Admin邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
