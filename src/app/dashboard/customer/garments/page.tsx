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
      title: '服装名称',
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
          <PermGuard permission="customer:garments:edit" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`编辑服装 ${record.name}（模拟）`)
              }
            >
              编辑
            </Button>
          </PermGuard>
          <PermGuard permission="customer:garments:delete" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.info(`下架/删除服装 ${record.name}（模拟）`)
              }
            >
              下架/删除
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
          {orgName} - 服装库
        </Title>
        <PermGuard permission="customer:garments:upload">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => message.info('上传/导入服装（模拟）')}
          >
            上传/导入
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
