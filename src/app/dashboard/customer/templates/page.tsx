'use client';

import React, { useMemo } from 'react';
import { Table, Button, Tag, Space, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgTemplates } from '@/lib/mock-data';
import type { TemplateSet, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

export default function CustomerTemplatesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const dataSource: TemplateSet[] = useMemo(() => {
    return getOrgTemplates(orgId);
  }, [orgId]);

  const columns: ColumnsType<TemplateSet> = [
    {
      title: '模板名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'template_id',
      dataIndex: 'template_id',
      key: 'template_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
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
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="customer:templates:publish" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`发布模板 ${record.name}（模拟）`)
              }
            >
              发布
            </Button>
          </PermGuard>
          <PermGuard permission="customer:templates:rollback" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`回滚模板 ${record.name}（模拟）`)
              }
            >
              回滚
            </Button>
          </PermGuard>
          <PermGuard permission="customer:templates:disable" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.info(`停用模板 ${record.name}（模拟）`)
              }
            >
              停用
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
          {orgName} - 模板库
        </Title>
        <PermGuard permission="customer:templates:create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('新建模板（模拟）')}
          >
            新建模板
          </Button>
        </PermGuard>
      </div>

      <Table<TemplateSet>
        columns={columns}
        dataSource={dataSource}
        rowKey="template_set_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
