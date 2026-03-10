'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Button, Space, Typography, Image, Modal, Tag, Select, Input, Tooltip, message,
} from 'antd';
import { EyeOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table/interface';

const { Title } = Typography;

interface GlobalImageRecord {
  key: string;
  file_name: string;
  image_url: string;
  org_id: string;
  org_name: string;
  upload_time: string;
}

const MOCK_GLOBAL_IMAGES: GlobalImageRecord[] = [
  { key: 'gi_001', file_name: 'product-jacket.jpg',       image_url: 'https://picsum.photos/seed/jacket/400/400',   org_id: 'org_cu_1001', org_name: 'Customer X', upload_time: '2026-02-10 10:23:45' },
  { key: 'gi_002', file_name: 'summer-dress.png',         image_url: 'https://picsum.photos/seed/dress/400/400',    org_id: 'org_cu_1001', org_name: 'Customer X', upload_time: '2026-02-10 11:05:12' },
  { key: 'gi_003', file_name: 'casual-trousers.webp',     image_url: 'https://picsum.photos/seed/trousers/400/400', org_id: 'org_cu_1001', org_name: 'Customer X', upload_time: '2026-02-11 09:48:30' },
  { key: 'gi_004', file_name: 'floral-blouse.jpg',        image_url: 'https://picsum.photos/seed/blouse/400/400',   org_id: 'org_cu_1002', org_name: 'Customer Y', upload_time: '2026-02-08 14:30:00' },
  { key: 'gi_005', file_name: 'denim-skirt.png',          image_url: 'https://picsum.photos/seed/skirt/400/400',    org_id: 'org_cu_1002', org_name: 'Customer Y', upload_time: '2026-02-08 14:32:11' },
  { key: 'gi_006', file_name: 'oversized-hoodie.jpg',     image_url: 'https://picsum.photos/seed/hoodie/400/400',   org_id: 'org_cu_1002', org_name: 'Customer Y', upload_time: '2026-02-09 16:00:55' },
  { key: 'gi_007', file_name: 'slim-chinos.webp',         image_url: 'https://picsum.photos/seed/chinos/400/400',   org_id: 'org_cu_1003', org_name: 'Customer Z', upload_time: '2026-02-07 08:15:22' },
  { key: 'gi_008', file_name: 'wool-coat.jpg',            image_url: 'https://picsum.photos/seed/coat/400/400',     org_id: 'org_cu_1003', org_name: 'Customer Z', upload_time: '2026-02-07 08:20:44' },
  { key: 'gi_009', file_name: 'striped-tee.png',          image_url: 'https://picsum.photos/seed/tee/400/400',      org_id: 'org_cu_1004', org_name: 'Customer W', upload_time: '2026-02-06 13:44:09' },
  { key: 'gi_010', file_name: 'leather-boots.jpg',        image_url: 'https://picsum.photos/seed/boots/400/400',    org_id: 'org_cu_1004', org_name: 'Customer W', upload_time: '2026-02-06 13:50:17' },
  { key: 'gi_011', file_name: 'knit-cardigan.webp',       image_url: 'https://picsum.photos/seed/cardigan/400/400', org_id: 'org_cu_1005', org_name: 'Customer V', upload_time: '2026-02-05 10:10:00' },
  { key: 'gi_012', file_name: 'wide-leg-pants.jpg',       image_url: 'https://picsum.photos/seed/widepants/400/400',org_id: 'org_cu_1005', org_name: 'Customer V', upload_time: '2026-02-05 10:12:30' },
];

const CUSTOMER_OPTIONS = [
  { label: 'Customer X', value: 'org_cu_1001' },
  { label: 'Customer Y', value: 'org_cu_1002' },
  { label: 'Customer Z', value: 'org_cu_1003' },
  { label: 'Customer W', value: 'org_cu_1004' },
  { label: 'Customer V', value: 'org_cu_1005' },
];

export default function AssetsImagesPage() {
  const [filterOrg, setFilterOrg] = useState<string | undefined>(undefined);
  const [searchName, setSearchName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const dataSource = useMemo(() => {
    let rows = MOCK_GLOBAL_IMAGES;
    if (filterOrg) rows = rows.filter((r) => r.org_id === filterOrg);
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase();
      rows = rows.filter((r) => r.file_name.toLowerCase().includes(q));
    }
    return rows;
  }, [filterOrg, searchName]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      message.success('Image URL copied to clipboard');
    }).catch(() => {
      message.error('Copy failed. Please copy manually.');
    });
  };

  const columns: ColumnsType<GlobalImageRecord> = [
    {
      title: 'Preview',
      dataIndex: 'image_url',
      width: 80,
      render: (url: string) => (
        <Image
          src={url}
          alt="preview"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTIiIHk9IjM1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjY2NjIj5OL0E8L3RleHQ+PC9zdmc+"
          preview={false}
          onClick={() => setPreviewUrl(url)}
        />
      ),
    },
    {
      title: 'file_name',
      dataIndex: 'file_name',
      render: (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase() ?? '';
        const colorMap: Record<string, string> = { jpg: 'blue', jpeg: 'blue', png: 'green', webp: 'purple' };
        return (
          <Space>
            <Tag color={colorMap[ext] ?? 'default'}>{ext.toUpperCase()}</Tag>
            <Typography.Text>{name}</Typography.Text>
          </Space>
        );
      },
    },
    {
      title: 'image_url',
      dataIndex: 'image_url',
      ellipsis: true,
      render: (url: string) => (
        <Tooltip title={url}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {url.length > 50 ? url.slice(0, 50) + '…' : url}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'org_name',
      width: 140,
      render: (name: string) => <Tag color="geekblue">{name}</Tag>,
    },
    {
      title: 'upload_time',
      dataIndex: 'upload_time',
      width: 180,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Preview">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setPreviewUrl(record.image_url)}
            />
          </Tooltip>
          <Tooltip title="Copy URL">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record.image_url)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Image Assets</Title>
      </div>

      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          placeholder="Filter by Customer"
          allowClear
          style={{ width: 200 }}
          value={filterOrg}
          onChange={setFilterOrg}
          options={CUSTOMER_OPTIONS}
        />
        <Input.Search
          placeholder="Search file name..."
          allowClear
          style={{ width: 240 }}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </Space>

      <Table<GlobalImageRecord>
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={{ pageSize: 20 }}
      />

      <Modal
        open={!!previewUrl}
        footer={null}
        onCancel={() => setPreviewUrl(null)}
        centered
        width={600}
        styles={{ body: { padding: 0, textAlign: 'center' } }}
      >
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        )}
      </Modal>
    </div>
  );
}
