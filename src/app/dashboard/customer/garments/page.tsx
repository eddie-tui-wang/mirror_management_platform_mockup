'use client';

import React, { useMemo } from 'react';
import { Table, Button, Tag, Space, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgGarments } from '@/lib/mock-data';
import type { GarmentCatalog, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

export default function CustomerGarmentsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const dataSource: GarmentCatalog[] = useMemo(() => {
    return getOrgGarments(orgId);
  }, [orgId]);

  const columns: ColumnsType<GarmentCatalog> = [
    {
      title: 'Garment Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'garment_id',
      dataIndex: 'garment_id',
      key: 'garment_id',
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
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="customer:garments:edit" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Edit garment ${record.name} (simulated)`)
              }
            >
              Edit
            </Button>
          </PermGuard>
          <PermGuard permission="customer:garments:delete" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.info(`Remove/Delete garment ${record.name} (simulated)`)
              }
            >
              Remove / Delete
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
          {orgName} - Garments
        </Title>
        <PermGuard permission="customer:garments:upload">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => message.info('Upload/Import garment (simulated)')}
          >
            Upload / Import
          </Button>
        </PermGuard>
      </div>

      <Table<GarmentCatalog>
        columns={columns}
        dataSource={dataSource}
        rowKey="catalog_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
