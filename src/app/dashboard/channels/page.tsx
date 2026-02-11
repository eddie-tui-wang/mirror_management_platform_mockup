'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Typography, message, Select } from 'antd';
import { PlusOutlined, ExportOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
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
      message.success(`渠道 "${values.name}" 创建成功（模拟）`);
      setCreateModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<ChannelRow> = [
    {
      title: '渠道名称',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '渠道Admin',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: '名下客户数',
      dataIndex: 'customerCount',
      key: 'customerCount',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
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
              message.info(`跳转到用户管理，筛选org=${record.org_id}`)
            }
          >
            查看成员
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() =>
              message.info(`查看渠道 ${record.name} 的客户列表`)
            }
          >
            查看客户
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() =>
              message.info(`查看渠道 ${record.name} 的资产`)
            }
          >
            查看资产
          </Button>
          <PermGuard permission="platform:channels:disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.warning(
                  `${record.status === 'Active' ? '禁用' : '启用'}渠道 ${record.name}（模拟）`
                )
              }
            >
              {record.status === 'Active' ? '禁用' : '启用'}
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>渠道管理</Title>
        <Space>
          <PermGuard permission="platform:channels:export">
            <Button icon={<ExportOutlined />}>导出</Button>
          </PermGuard>
          <PermGuard permission="platform:channels:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              新建渠道
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
        title="新建渠道"
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
            label="渠道名称"
            rules={[{ required: true, message: '请输入渠道名称' }]}
          >
            <Input placeholder="请输入渠道名称" />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="渠道Admin邮箱"
            rules={[
              { required: true, message: '请输入Admin邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入渠道Admin邮箱" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="备注信息（选填）" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
