'use client';

import React, { useMemo } from 'react';
import { Table, Typography, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { emailRecords } from '@/lib/mock-data';
import type { EmailRecord } from '@/lib/types';

const { Title } = Typography;

export default function CustomerEmailRecordsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const data = useMemo(() => {
    if (!currentUser) return [];
    return emailRecords.filter((r) => r.customer_org_id === currentUser.org_id);
  }, [currentUser]);

  const columns: ColumnsType<EmailRecord> = [
    {
      title: 'Customer Email',
      dataIndex: 'customer_email',
      key: 'customer_email',
    },
    {
      title: 'Send Time',
      dataIndex: 'sent_time',
      key: 'sent_time',
    },
    {
      title: 'Generation Result',
      dataIndex: 'generation_result_url',
      key: 'generation_result_url',
      render: (url: string) => (
        <Image src={url} alt="result" width={60} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
  ];

  if (!currentUser) return null;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Email Records</Title>
      <Table<EmailRecord>
        columns={columns}
        dataSource={data}
        rowKey="record_id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No email records found.' }}
      />
    </div>
  );
}
