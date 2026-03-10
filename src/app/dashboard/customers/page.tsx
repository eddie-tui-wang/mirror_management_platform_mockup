'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Table, Button, Tag, Space, Typography, message, Select, Modal, Form,
  Input,
} from 'antd';
import { PlusOutlined, KeyOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter, useSearchParams } from 'next/navigation';
import { organizations, users, getCustomerSummary, getOrgActivationCodes } from '@/lib/mock-data';
import type { CustomerType, Status, ActivationCode, ActivationCodeStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title, Text } = Typography;

const CODE_STATUS_COLOR: Record<ActivationCodeStatus, string> = {
  Unused: 'blue',
  Bound: 'green',
  Expired: 'default',
  Revoked: 'red',
};

interface CustomerRow {
  org_id: string;
  name: string;
  status: Status;
  created_at: string;
  customerType: CustomerType;
  channelName: string;
  adminEmail: string;
  onlineDeviceCount: number;
  parent_org_id: string | null;
}

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>(searchParams.get('channel') ?? 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);
  const [form] = Form.useForm();

  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [codesOrg, setCodesOrg] = useState<CustomerRow | null>(null);
  const [createCodeModalOpen, setCreateCodeModalOpen] = useState(false);
  const [createCodeForm] = Form.useForm();

  const orgCodes = useMemo(
    () => (codesOrg ? getOrgActivationCodes(codesOrg.org_id) : []),
    [codesOrg]
  );
  const unusedRegularCount = useMemo(
    () => orgCodes.filter((c) => c.status === 'Unused' && c.code_type === 'Regular').length,
    [orgCodes]
  );

  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});

  const channels = useMemo(
    () => organizations.filter((o) => o.org_type === 'CHANNEL'),
    []
  );

  const baseCustomers: CustomerRow[] = useMemo(() => {
    return organizations
      .filter((org) => org.org_type === 'CUSTOMER')
      .map((org) => {
        const summary = getCustomerSummary(org.org_id);
        return {
          org_id: org.org_id,
          name: org.name,
          status: org.status as Status,
          created_at: org.created_at,
          parent_org_id: org.parent_org_id ?? null,
          customerType: summary.customerType,
          channelName: summary.channelName,
          adminEmail: summary.adminEmail,
          onlineDeviceCount: summary.onlineDeviceCount,
        };
      });
  }, []);

  const allCustomers: CustomerRow[] = useMemo(() => {
    return baseCustomers.map((row) => ({
      ...row,
      status: statusOverrides[row.org_id] ?? row.status,
    }));
  }, [baseCustomers, statusOverrides]);

  const dataSource = useMemo(() => {
    let filtered = allCustomers;
    if (typeFilter !== 'all') filtered = filtered.filter((c) => c.customerType === typeFilter);
    if (channelFilter !== 'all') filtered = filtered.filter((c) => c.parent_org_id === channelFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((c) => c.status === statusFilter);
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(lower));
    }
    return filtered;
  }, [allCustomers, typeFilter, channelFilter, statusFilter, searchText]);

  const toggleStatus = (record: CustomerRow) => {
    const current = statusOverrides[record.org_id] ?? record.status;
    const next: Status = current === 'Active' ? 'Disabled' : 'Active';
    const action = next === 'Disabled' ? 'disabled' : 'enabled';
    Modal.confirm({
      title: `${next === 'Disabled' ? 'Disable' : 'Enable'} customer "${record.name}"?`,
      content: next === 'Disabled'
        ? 'All users under this customer will lose access until re-enabled.'
        : 'The customer account will be restored to active status.',
      okText: next === 'Disabled' ? 'Disable' : 'Enable',
      okType: next === 'Disabled' ? 'danger' : 'primary',
      onOk: () => {
        setStatusOverrides((prev) => ({ ...prev, [record.org_id]: next }));
        message.success(`Customer "${record.name}" has been ${action}.`);
        if (next === 'Disabled') {
          message.warning(`All active sessions for "${record.name}" have been terminated (simulated).`);
        }
      },
    });
  };

  const handleCreateCode = () => {
    createCodeForm.validateFields().then(() => {
      message.success(`Regular activation code created for ${codesOrg?.name} (simulated)`);
      setCreateCodeModalOpen(false);
      createCodeForm.resetFields();
    });
  };

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const nameTaken = organizations.some(
        (o) => o.org_type === 'CUSTOMER' && o.name.toLowerCase() === values.name.trim().toLowerCase()
      );
      if (nameTaken) {
        form.setFields([{ name: 'name', errors: ['Customer name already exists'] }]);
        return;
      }
      const emailTaken = users.some(
        (u) => u.email.toLowerCase() === values.adminEmail.trim().toLowerCase()
      );
      if (emailTaken) {
        form.setFields([{ name: 'adminEmail', errors: ['Email is already registered'] }]);
        return;
      }
      message.success(`Customer "${values.name}" created successfully (simulated)`);
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<CustomerRow> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'customer_id',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'Type',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type: CustomerType) => (
        <Tag color={type === 'Direct' ? 'blue' : 'purple'}>
          {type === 'Direct' ? 'Direct' : 'Reseller'}
        </Tag>
      ),
    },
    {
      title: 'Channel',
      dataIndex: 'channelName',
      key: 'channelName',
      render: (name: string) => (name === '-' ? '-' : name),
    },
    { title: 'Email', dataIndex: 'adminEmail', key: 'adminEmail' },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const current = statusOverrides[record.org_id] ?? record.status;
        return <Tag color={current === 'Active' ? 'green' : 'red'}>{current}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const current = statusOverrides[record.org_id] ?? record.status;
        return (
          <Space size="small">
            <PermGuard permission="platform:customers:create_code">
              <Button
                type="link"
                size="small"
                icon={<KeyOutlined />}
                onClick={() => { setCodesOrg(record); setCodesModalOpen(true); }}
              >
                Manage Codes
              </Button>
            </PermGuard>
            <Button
              type="link"
              size="small"
              onClick={() => router.push(`/dashboard/assets/garments?org=${record.org_id}`)}
            >
              View Assets
            </Button>
            <Button
              type="link"
              size="small"
              danger={current === 'Active'}
              onClick={() => toggleStatus(record)}
            >
              {current === 'Active' ? 'Disable' : 'Enable'}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Customer Management</Title>
        <Space>
          <PermGuard permission="platform:customers:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create Customer (Direct)
            </Button>
          </PermGuard>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Search by customer name"
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

      <Space style={{ marginBottom: 16 }} wrap>
        <span>Customer Type:</span>
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 160 }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Direct', label: 'Direct' },
            { value: 'Reseller', label: 'Reseller' },
          ]}
        />
        <span>Channel:</span>
        <Select
          value={channelFilter}
          onChange={setChannelFilter}
          style={{ width: 200 }}
          options={[
            { value: 'all', label: 'All' },
            ...channels.map((ch) => ({ value: ch.org_id, label: ch.name })),
          ]}
        />
        <span>Status:</span>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Active', label: 'Active' },
            { value: 'Disabled', label: 'Disabled' },
          ]}
        />
      </Space>

      <Table<CustomerRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Manage Codes Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Activation Codes — {codesOrg?.name}</span>
          </Space>
        }
        open={codesModalOpen}
        onCancel={() => { setCodesModalOpen(false); setCodesOrg(null); }}
        footer={null}
        width={760}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text type="secondary">
            Regular codes (Unused): <Text strong>{unusedRegularCount}</Text>
            {codesOrg?.status === 'Disabled' && (
              <Text type="danger" style={{ marginLeft: 8 }}>— Account is disabled</Text>
            )}
          </Text>
          <PermGuard permission="platform:customers:create_code">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              disabled={codesOrg?.status === 'Disabled'}
              onClick={() => setCreateCodeModalOpen(true)}
            >
              Create Regular Code
            </Button>
          </PermGuard>
        </div>
        <Table<ActivationCode>
          size="small"
          dataSource={orgCodes}
          rowKey="code_id"
          pagination={false}
          columns={[
            {
              title: 'Code',
              dataIndex: 'code',
              key: 'code',
              render: (c: string) => <Text code style={{ fontSize: 12 }}>{c}</Text>,
            },
            {
              title: 'Type',
              dataIndex: 'code_type',
              key: 'code_type',
              render: (t: string) => (
                <Tag color={t === 'Regular' ? 'blue' : 'orange'}>{t}</Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (s: ActivationCodeStatus) => <Tag color={CODE_STATUS_COLOR[s]}>{s}</Tag>,
            },
            {
              title: 'Device ID',
              dataIndex: 'bound_device_id',
              key: 'bound_device_id',
              render: (id: string | null) =>
                id ? <Text code style={{ fontSize: 12 }}>{id}</Text> : <Text type="secondary">—</Text>,
            },
            {
              title: 'Nickname',
              dataIndex: 'nickname',
              key: 'nickname',
              render: (v: string | null) => v ?? <Text type="secondary">—</Text>,
            },
            {
              title: 'Created By',
              dataIndex: 'created_by_portal',
              key: 'created_by_portal',
              render: (p: 'platform' | 'channel') => (
                <Tag color={p === 'platform' ? 'purple' : 'cyan'}>
                  {p === 'platform' ? 'Platform' : 'Channel'}
                </Tag>
              ),
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
              render: (_: unknown, rec: ActivationCode) =>
                rec.status === 'Unused' ? (
                  <Button
                    type="link"
                    size="small"
                    danger
                    onClick={() =>
                      Modal.confirm({
                        title: `Revoke code ${rec.code}?`,
                        content: 'This code will be permanently revoked and cannot be used to bind a device.',
                        okText: 'Revoke',
                        okType: 'danger',
                        onOk: () => message.success('Code revoked (simulated)'),
                      })
                    }
                  >
                    Revoke
                  </Button>
                ) : null,
            },
          ]}
        />
      </Modal>

      {/* Create Regular Code Modal */}
      <Modal
        title={`Create Regular Activation Code — ${codesOrg?.name ?? ''}`}
        open={createCodeModalOpen}
        onOk={handleCreateCode}
        onCancel={() => { setCreateCodeModalOpen(false); createCodeForm.resetFields(); }}
        okText="Create"
        cancelText="Cancel"
      >
        <Text type="secondary" style={{ fontSize: 13 }}>
          Regular codes grant permanent device access with no session limit. Only platform admins can create Regular codes.
        </Text>
      </Modal>

      {/* Create Customer Modal */}
      <Modal
        title="Create Customer (Direct)"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="Please enter customer name" />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="Admin Email"
            rules={[
              { required: true, message: 'Please enter admin email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Please enter admin email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
