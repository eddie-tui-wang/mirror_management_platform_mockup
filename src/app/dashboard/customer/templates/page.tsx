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
      title: 'Template Name',
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
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
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
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="customer:templates:publish" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Publish template ${record.name} (simulated)`)
              }
            >
              Publish
            </Button>
          </PermGuard>
          <PermGuard permission="customer:templates:rollback" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Rollback template ${record.name} (simulated)`)
              }
            >
              Rollback
            </Button>
          </PermGuard>
          <PermGuard permission="customer:templates:disable" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.info(`Disable template ${record.name} (simulated)`)
              }
            >
              Disable
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
          {orgName} - Templates
        </Title>
        <PermGuard permission="customer:templates:create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('Create template (simulated)')}
          >
            Create Template
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
