'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Select, Image, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'next/navigation';
import { organizations, garments, getOrgById } from '@/lib/mock-data';
import type { GarmentCatalog, OrgType, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface GarmentRow extends GarmentCatalog {
  org_name: string;
  org_type: OrgType;
}

export default function GarmentsPage() {
  const searchParams = useSearchParams();
  const initialOrgId = searchParams.get('org') ?? undefined;

  const [filterOrgType, setFilterOrgType] = useState<OrgType | undefined>(undefined);
  const [filterOrgId, setFilterOrgId] = useState<string | undefined>(initialOrgId);
  const [filterStatus, setFilterStatus] = useState<Status | undefined>(undefined);

  const orgOptions = useMemo(() => {
    let orgs = organizations;
    if (filterOrgType) {
      orgs = orgs.filter((o) => o.org_type === filterOrgType);
    }
    return orgs.map((o) => ({ label: `${o.name} (${o.org_id})`, value: o.org_id }));
  }, [filterOrgType]);

  const dataSource: GarmentRow[] = useMemo(() => {
    return garments
      .map((g) => {
        const org = getOrgById(g.org_id);
        return {
          ...g,
          org_name: org?.name ?? '-',
          org_type: org?.org_type ?? ('CUSTOMER' as OrgType),
        };
      })
      .filter((g) => {
        if (filterOrgType && g.org_type !== filterOrgType) return false;
        if (filterOrgId && g.org_id !== filterOrgId) return false;
        if (filterStatus && g.status !== filterStatus) return false;
        return true;
      });
  }, [filterOrgType, filterOrgId, filterStatus]);

  const confirmDelete = (record: GarmentRow) => {
    Modal.confirm({
      title: `Delete garment "${record.name}"?`,
      content: `This garment belongs to ${record.org_name}.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => message.success(`Garment "${record.name}" deleted (simulated)`),
    });
  };

  const columns: ColumnsType<GarmentRow> = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      width: 80,
      render: (url: string) => (
        <Image
          src={url}
          alt="garment"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTIiIHk9IjM1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjY2NjIj5OL0E8L3RleHQ+PC9zdmc+"
        />
      ),
    },
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
      title: 'Org Type',
      dataIndex: 'org_type',
      key: 'org_type',
      render: (type: OrgType) => (
        <Tag color={type === 'CHANNEL' ? 'blue' : 'orange'}>{type}</Tag>
      ),
    },
    {
      title: 'Org Name',
      dataIndex: 'org_name',
      key: 'org_name',
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
          <PermGuard permission="platform:garments:edit" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`View/Edit garment ${record.name} (${record.garment_id})`)
              }
            >
              View / Edit
            </Button>
          </PermGuard>
          <PermGuard permission="platform:garments:delete" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() => confirmDelete(record)}
            >
              Delete
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Garments (Aggregated)</Title>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Org Type"
          allowClear
          style={{ width: 160 }}
          value={filterOrgType}
          onChange={(val) => {
            setFilterOrgType(val);
            setFilterOrgId(undefined);
          }}
          options={[
            { label: 'CHANNEL', value: 'CHANNEL' },
            { label: 'CUSTOMER', value: 'CUSTOMER' },
          ]}
        />
        <Select
          placeholder="Organization"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 240 }}
          value={filterOrgId}
          onChange={setFilterOrgId}
          options={orgOptions}
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 120 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: 'Active', value: 'Active' },
            { label: 'Disabled', value: 'Disabled' },
          ]}
        />
      </Space>

      <Table<GarmentRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="catalog_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
