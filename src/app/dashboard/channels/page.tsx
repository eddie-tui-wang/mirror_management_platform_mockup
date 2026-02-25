'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { organizations, getChannelSummary } from '@/lib/mock-data';
import type { Organization, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface ChannelRow {
  org_id: string;
  name: string;
  status: Status;
  created_at: string;
  adminEmail: string;
  customerCount: number;
}

export default function ChannelsPage() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Local mutable state for channel statuses
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});

  const baseData: ChannelRow[] = useMemo(() => {
    return organizations
      .filter((org) => org.org_type === 'CHANNEL')
      .map((org) => {
        const summary = getChannelSummary(org.org_id);
        return {
          org_id: org.org_id,
          name: org.name,
          status: org.status as Status,
          created_at: org.created_at,
          adminEmail: summary.adminEmail,
          customerCount: summary.customerCount,
        };
      });
  }, []);

  const dataSource: ChannelRow[] = useMemo(() => {
    return baseData.map((row) => ({
      ...row,
      status: statusOverrides[row.org_id] ?? row.status,
    }));
  }, [baseData, statusOverrides]);

  const toggleStatus = (record: ChannelRow) => {
    const current = statusOverrides[record.org_id] ?? record.status;
    const next: Status = current === 'Active' ? 'Disabled' : 'Active';
    const action = next === 'Disabled' ? 'disabled' : 'enabled';
    Modal.confirm({
      title: `${next === 'Disabled' ? 'Disable' : 'Enable'} channel "${record.name}"?`,
      content: next === 'Disabled'
        ? 'Channel users will lose access until re-enabled.'
        : 'The channel will be restored to active status.',
      okText: next === 'Disabled' ? 'Disable' : 'Enable',
      okType: next === 'Disabled' ? 'danger' : 'primary',
      onOk: () => {
        setStatusOverrides((prev) => ({ ...prev, [record.org_id]: next }));
        message.success(`Channel "${record.name}" has been ${action}.`);
      },
    });
  };

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
      render: (status: Status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Channel Admin',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
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
      render: (_, record) => {
        const currentStatus = statusOverrides[record.org_id] ?? record.status;
        return (
          <Space size="small">
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
                danger={currentStatus === 'Active'}
                onClick={() => toggleStatus(record)}
              >
                {currentStatus === 'Active' ? 'Disable' : 'Enable'}
              </Button>
            </PermGuard>
          </Space>
        );
      },
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
