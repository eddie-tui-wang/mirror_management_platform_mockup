'use client';

import React, { useMemo, useState } from 'react';
import { Table, Typography, Image, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { emailRecords, organizations } from '@/lib/mock-data';
import type { EmailRecord } from '@/lib/types';

const { Title } = Typography;

export default function EmailRecordsPage() {
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  const customers = useMemo(
    () => organizations.filter((o) => o.org_type === 'CUSTOMER'),
    []
  );

  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customers.forEach((c) => { map[c.org_id] = c.name; });
    return map;
  }, [customers]);

  const dataSource = useMemo(() => {
    if (customerFilter === 'all') return emailRecords;
    return emailRecords.filter((r) => r.customer_org_id === customerFilter);
  }, [customerFilter]);

  const columns: ColumnsType<EmailRecord> = [
    {
      title: 'Customer',
      dataIndex: 'customer_org_id',
      key: 'customer_org_id',
      render: (orgId: string) => customerMap[orgId] ?? orgId,
    },
    {
      title: 'Customer Email',
      dataIndex: 'customer_email',
      key: 'customer_email',
    },
    {
      title: 'Sent Time',
      dataIndex: 'sent_time',
      key: 'sent_time',
    },
    {
      title: 'Generation Result',
      dataIndex: 'generation_result_url',
      key: 'generation_result_url',
      render: (url: string) => (
        <Image
          src={url}
          alt="generation result"
          width={64}
          height={64}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTAiIHk9IjM3IiBmb250LXNpemU9IjEyIiBmaWxsPSIjY2NjIj5OL0E8L3RleHQ+PC9zdmc+"
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>Email Records</Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <span>Customer:</span>
        <Select
          value={customerFilter}
          onChange={setCustomerFilter}
          style={{ width: 200 }}
          options={[
            { value: 'all', label: 'All Customers' },
            ...customers.map((c) => ({ value: c.org_id, label: c.name })),
          ]}
        />
      </Space>
      <Table<EmailRecord>
        columns={columns}
        dataSource={dataSource}
        rowKey="record_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
