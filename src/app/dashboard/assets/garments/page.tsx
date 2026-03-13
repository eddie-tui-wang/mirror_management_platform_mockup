'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Table, Tag, Typography, Select, Image, Space, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'next/navigation';
import { organizations, garments, getOrgById } from '@/lib/mock-data';
import { SearchOutlined } from '@ant-design/icons';
import type { GarmentCatalog, OrgType, Status } from '@/lib/types';

const { Title } = Typography;

interface GarmentRow extends GarmentCatalog {
  org_name: string;
  org_type: OrgType;
}

export default function GarmentsPage() {
  const searchParams = useSearchParams();
  const initialOrgId = searchParams.get('org') ?? undefined;

  const [filterOrgId, setFilterOrgId] = useState<string | undefined>(initialOrgId);
  const [filterStatus, setFilterStatus] = useState<Status | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const orgOptions = useMemo(() => {
    return organizations
      .filter((o) => o.org_type === 'CUSTOMER')
      .map((o) => ({ label: `${o.name} (${o.org_id})`, value: o.org_id }));
  }, []);

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
        if (filterOrgId && g.org_id !== filterOrgId) return false;
        if (filterStatus && g.status !== filterStatus) return false;
        if (searchText && !g.name.toLowerCase().includes(searchText.toLowerCase())) return false;
        return true;
      });
  }, [filterOrgId, filterStatus, searchText]);

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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Org',
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
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Garments (Aggregated)</Title>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Search by garment name"
          allowClear
          style={{ width: 220 }}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) setSearchText('');
          }}
          onPressEnter={() => setSearchText(searchInput)}
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
