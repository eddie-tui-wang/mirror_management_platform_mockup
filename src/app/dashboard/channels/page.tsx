'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Typography, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { organizations, users, getChannelSummary } from '@/lib/mock-data';
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

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
    const lower = searchText.toLowerCase();
    return baseData
      .map((row) => ({ ...row, status: statusOverrides[row.org_id] ?? row.status }))
      .filter((row) => !lower || row.name.toLowerCase().includes(lower));
  }, [baseData, statusOverrides, searchText]);

  const toggleStatus = (record: ChannelRow) => {
    const current = statusOverrides[record.org_id] ?? record.status;
    const next: Status = current === 'Active' ? 'Disabled' : 'Active';
    const action = next === 'Disabled' ? 'disabled' : 'enabled';
    Modal.confirm({
      title: `${next === 'Disabled' ? 'Disable' : 'Enable'} channel "${record.name}"?`,
      content: next === 'Disabled'
        ? 'All users under this channel will be immediately logged out and lose access until re-enabled.'
        : 'The channel will be restored to active status.',
      okText: next === 'Disabled' ? 'Disable' : 'Enable',
      okType: next === 'Disabled' ? 'danger' : 'primary',
      onOk: () => {
        setStatusOverrides((prev) => ({ ...prev, [record.org_id]: next }));
        message.success(`Channel "${record.name}" has been ${action}.`);
        if (next === 'Disabled') {
          message.warning(`All active sessions for "${record.name}" have been terminated (simulated).`);
        }
      },
    });
  };

  const handleCreate = () => {
    form.validateFields().then((values) => {
      // Uniqueness: Name
      const nameTaken = organizations.some(
        (o) => o.org_type === 'CHANNEL' && o.name.toLowerCase() === values.name.trim().toLowerCase()
      );
      if (nameTaken) {
        form.setFields([{ name: 'name', errors: ['Channel name already exists'] }]);
        return;
      }
      // Uniqueness: Email
      const emailTaken = users.some(
        (u) => u.email.toLowerCase() === values.adminEmail.trim().toLowerCase()
      );
      if (emailTaken) {
        form.setFields([{ name: 'adminEmail', errors: ['Email is already registered'] }]);
        return;
      }
      message.success(`Channel "${values.name}" created successfully (simulated)`);
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<ChannelRow> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
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
    { title: 'Email', dataIndex: 'adminEmail', key: 'adminEmail' },
    { title: 'Customers', dataIndex: 'customerCount', key: 'customerCount' },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Create Channel
            </Button>
          </PermGuard>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Search by channel name"
          allowClear
          style={{ width: 260 }}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) setSearchText('');
          }}
          onPressEnter={() => setSearchText(searchInput)}
        />
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
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
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
        </Form>
      </Modal>
    </div>
  );
}
