'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Table, Typography, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { websiteInquiries } from '@/lib/mock-data';
import type { WebsiteInquiry } from '@/lib/types';

const { Title } = Typography;

const columns: ColumnsType<WebsiteInquiry> = [
  { title: 'Time',    dataIndex: 'time',    key: 'time' },
  { title: 'Name',    dataIndex: 'name',    key: 'name' },
  { title: 'Company', dataIndex: 'company', key: 'company' },
  { title: 'Email',   dataIndex: 'email',   key: 'email' },
  { title: 'Role',    dataIndex: 'role',    key: 'role' },
  { title: 'Venue',   dataIndex: 'venue',   key: 'venue' },
];

export default function WebsiteInquiriesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const dataSource = useMemo(() => {
    if (!searchText) return websiteInquiries;
    const lower = searchText.toLowerCase();
    return websiteInquiries.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.company.toLowerCase().includes(lower) ||
        r.email.toLowerCase().includes(lower)
    );
  }, [searchText]);

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>Website Inquiries</Title>
      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Search by name, company or email"
          allowClear
          style={{ width: 280 }}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) setSearchText('');
          }}
          onPressEnter={() => setSearchText(searchInput)}
        />
      </div>
      <Table<WebsiteInquiry>
        columns={columns}
        dataSource={dataSource}
        rowKey="inquiry_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
