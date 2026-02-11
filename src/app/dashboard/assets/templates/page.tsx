'use client';

import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Space, Typography, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { organizations, templates, getOrgById } from '@/lib/mock-data';
import type { TemplateSet, OrgType, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

interface TemplateRow extends TemplateSet {
  org_name: string;
  org_type: OrgType;
}

export default function TemplatesPage() {
  const [filterOrgType, setFilterOrgType] = useState<OrgType | undefined>(undefined);
  const [filterOrgId, setFilterOrgId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<Status | undefined>(undefined);

  const orgOptions = useMemo(() => {
    let orgs = organizations;
    if (filterOrgType) {
      orgs = orgs.filter((o) => o.org_type === filterOrgType);
    }
    return orgs.map((o) => ({ label: `${o.name} (${o.org_id})`, value: o.org_id }));
  }, [filterOrgType]);

  const dataSource: TemplateRow[] = useMemo(() => {
    return templates
      .map((t) => {
        const org = getOrgById(t.org_id);
        return {
          ...t,
          org_name: org?.name ?? '-',
          org_type: org?.org_type ?? ('CUSTOMER' as OrgType),
        };
      })
      .filter((t) => {
        if (filterOrgType && t.org_type !== filterOrgType) return false;
        if (filterOrgId && t.org_id !== filterOrgId) return false;
        if (filterStatus && t.status !== filterStatus) return false;
        return true;
      });
  }, [filterOrgType, filterOrgId, filterStatus]);

  const columns: ColumnsType<TemplateRow> = [
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
      title: 'Organization',
      key: 'org',
      render: (_, record) => (
        <span>
          {record.org_name}{' '}
          <Typography.Text code>{record.org_id}</Typography.Text>
        </span>
      ),
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
          <Button
            type="link"
            size="small"
            onClick={() =>
              message.info(`View template ${record.name} (${record.template_id})`)
            }
          >
            View
          </Button>
          <PermGuard permission="platform:templates:edit">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Rollback template ${record.name} to previous version (simulated)`)
              }
            >
              Rollback
            </Button>
          </PermGuard>
          <PermGuard permission="platform:templates:edit">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.warning(`Disable template ${record.name} (simulated)`)
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
      <Title level={4} style={{ marginBottom: 16 }}>Templates (Aggregated)</Title>

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
          style={{ width: 260 }}
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

      <Table<TemplateRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="template_set_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
