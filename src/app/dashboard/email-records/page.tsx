'use client';

import React from 'react';
import { Table, Typography, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { emailRecords } from '@/lib/mock-data';
import type { EmailRecord } from '@/lib/types';

const { Title } = Typography;

const columns: ColumnsType<EmailRecord> = [
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

export default function EmailRecordsPage() {
  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>Email Records</Title>
      <Table<EmailRecord>
        columns={columns}
        dataSource={emailRecords}
        rowKey="record_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
