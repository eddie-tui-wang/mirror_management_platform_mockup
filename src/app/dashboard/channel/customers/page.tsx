'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Switch, InputNumber, Typography, Select, Tooltip, message } from 'antd';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { getChannelCustomers, getCustomerSummary } from '@/lib/mock-data';
import type { Organization, Status, TrialStatus } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface CustomerRow extends Organization {
  adminEmail: string;
  memberCount: number;
  onlineDeviceCount: number;
  isTrial: boolean;
  trialStatus: TrialStatus;
  remainingDays: number;
  trialEndDate: string;
  trialMaxSales: number;
  trialUsedSales: number;
  trialRemainingSales: number;
}

export default function ChannelCustomersPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [accountKindFilter, setAccountKindFilter] = useState<string>('all');
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
        isTrial: summary.isTrial,
        trialStatus: summary.trialStatus,
        remainingDays: summary.remainingDays,
        trialEndDate: summary.trialEndDate,
        trialMaxSales: summary.trialMaxSales,
        trialUsedSales: summary.trialUsedSales,
        trialRemainingSales: summary.trialRemainingSales,
      };
    });
  }, [currentUser]);

  const filteredData = useMemo(() => {
    if (accountKindFilter === 'all') return dataSource;
    if (accountKindFilter === 'Trial') return dataSource.filter((c) => c.isTrial);
    return dataSource.filter((c) => !c.isTrial);
  }, [dataSource, accountKindFilter]);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const trialLabel = isTrial ? `（试用 ${values.trialDays ?? 14} 天，试用次数 ${values.trialMaxSales ?? 50} 次）` : '';
      message.success(`客户 "${values.name}" 创建成功${trialLabel}（模拟）`);
      setCreateModalOpen(false);
      setIsTrial(false);
      form.resetFields();
    });
  };

  const renderAccountKind = (record: CustomerRow) => {
    if (!record.isTrial) {
      return <Tag color="blue">正式</Tag>;
    }
    const salesInfo = `已用 ${record.trialUsedSales}/${record.trialMaxSales} 次，剩余 ${record.trialRemainingSales} 次`;
    const daysInfo = `试用截止: ${record.trialEndDate}，剩余 ${record.remainingDays} 天`;
    const tip = `${daysInfo}\n${salesInfo}`;
    if (record.trialStatus === 'expired') {
      return (
        <Tooltip title={tip}>
          <Space size={4} direction="vertical">
            <Tag color="red" icon={<WarningOutlined />}>试用-已过期</Tag>
            <Typography.Text type="danger" style={{ fontSize: 12 }}>
              {record.trialRemainingSales <= 0 ? '次数已用完' : `剩余 ${record.trialRemainingSales} 次`}
            </Typography.Text>
          </Space>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={tip}>
        <Space size={4} direction="vertical">
          <Tag color="orange">试用中</Tag>
          <Typography.Text type="warning" style={{ fontSize: 12 }}>
            剩余 {record.trialRemainingSales}/{record.trialMaxSales} 次 · {record.remainingDays}天
          </Typography.Text>
        </Space>
      </Tooltip>
    );
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
      title: '账户类型',
      key: 'accountKind',
      render: (_, record) => renderAccountKind(record),
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
            onClick={() => router.push(`/dashboard/channel/users?org=${record.org_id}`)}
          >
            查看账号
          </Button>
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

      <Space style={{ marginBottom: 16 }} wrap>
        <span>账户类型：</span>
        <Select
          value={accountKindFilter}
          onChange={setAccountKindFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部' },
            { value: 'Regular', label: '正式' },
            { value: 'Trial', label: '试用' },
          ]}
        />
      </Space>

      <Table<CustomerRow>
        columns={columns}
        dataSource={filteredData}
        rowKey="org_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="新建客户（渠道客户）"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          setIsTrial(false);
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

          <Form.Item label="试用账户">
            <Space>
              <Switch
                checked={isTrial}
                onChange={setIsTrial}
              />
              <span>{isTrial ? '开启试用' : '正式账户'}</span>
            </Space>
          </Form.Item>

          {isTrial && (
            <>
              <Form.Item
                name="trialDays"
                label="试用天数"
                initialValue={14}
                rules={[{ required: true, message: '请输入试用天数' }]}
              >
                <InputNumber min={1} max={90} style={{ width: '100%' }} placeholder="试用期限（天）" />
              </Form.Item>
              <Form.Item
                name="trialMaxSales"
                label="试用次数（销售次数上限）"
                initialValue={50}
                rules={[{ required: true, message: '请输入试用次数' }]}
              >
                <InputNumber min={1} max={9999} style={{ width: '100%' }} placeholder="该客户可使用的试用销售次数" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
