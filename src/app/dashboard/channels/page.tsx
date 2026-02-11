'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Typography, message } from 'antd';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { organizations, getChannelSummary } from '@/lib/mock-data';
import type { Organization } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface ChannelRow extends Organization {
  adminEmail: string;
  memberCount: number;
  customerCount: number;
}

export default function ChannelsPage() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const dataSource: ChannelRow[] = useMemo(() => {
    return organizations
      .filter((org) => org.org_type === 'CHANNEL')
      .map((org) => {
        const summary = getChannelSummary(org.org_id);
        return {
          ...org,
          adminEmail: summary.adminEmail,
          memberCount: summary.memberCount,
          customerCount: summary.customerCount,
        };
      });
  }, []);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      message.success(`Channel "${values.name}" created successfully (simulated)`);
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<ChannelRow> = [
    {
      title: 'Channel Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'channel_id',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Channel Admin',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: 'Customers',
      dataIndex: 'customerCount',
      key: 'customerCount',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/users?org=${record.org_id}`)}
          >
            View Members
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/customers?channel=${record.org_id}`)}
          >
            View Customers
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/assets/garments?org=${record.org_id}`)}
          >
            View Assets
          </Button>
          <PermGuard permission="platform:channels:disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.warning(
                  `${record.status === 'Active' ? 'Disable' : 'Enable'} channel ${record.name} (simulated)`
                )
              }
            >
              {record.status === 'Active' ? 'Disable' : 'Enable'}
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Channel Management</Title>
        <Space>
          <PermGuard permission="platform:channels:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Channel
            </Button>
          </PermGuard>
        </Space>
      </div>

      <Table<ChannelRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Create Channel"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Channel Name"
            rules={[{ required: true, message: 'Please enter channel name' }]}
          >
            <Input placeholder="Please enter channel name" />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="Channel Admin Email"
            rules={[
              { required: true, message: 'Please enter admin email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Please enter channel admin email" />
          </Form.Item>
          <Form.Item name="remark" label="Remarks">
            <Input.TextArea placeholder="Optional remarks" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
