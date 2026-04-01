'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography, Card, Upload, Button, Input, Table, Tag, Empty,
  Divider, message, Space,
} from 'antd';
import {
  UploadOutlined, PictureOutlined, SaveOutlined,
  ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, PlusOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getOrgGarments } from '@/lib/mock-data';
import type { GarmentCatalog } from '@/lib/types';

const { Title, Text } = Typography;
const { Search } = Input;

interface SavedState {
  bgFileList: UploadFile[];
  logoFileList: UploadFile[];
  queue: string[]; // catalog_id[]
}

const EMPTY_STATE: SavedState = { bgFileList: [], logoFileList: [], queue: [] };

function statesEqual(a: SavedState, b: SavedState) {
  return (
    JSON.stringify(a.bgFileList.map((f) => f.uid)) ===
      JSON.stringify(b.bgFileList.map((f) => f.uid)) &&
    JSON.stringify(a.logoFileList.map((f) => f.uid)) ===
      JSON.stringify(b.logoFileList.map((f) => f.uid)) &&
    JSON.stringify(a.queue) === JSON.stringify(b.queue)
  );
}

export default function CustomerScreensaverPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const [search, setSearch] = useState('');
  const [bgFileList, setBgFileList] = useState<UploadFile[]>([]);
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [queue, setQueue] = useState<string[]>([]); // ordered catalog_ids

  const [savedState, setSavedState] = useState<SavedState>(EMPTY_STATE);

  const garments = useMemo(
    () => (currentUser ? getOrgGarments(currentUser.org_id).filter((g) => g.status === 'Active') : []),
    [currentUser]
  );

  const filteredGarments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return garments;
    return garments.filter((g) => g.name.toLowerCase().includes(q));
  }, [garments, search]);

  const queuedSet = useMemo(() => new Set(queue), [queue]);

  const isDirty = useMemo(
    () => !statesEqual({ bgFileList, logoFileList, queue }, savedState),
    [bgFileList, logoFileList, queue, savedState]
  );

  const handleAdd = (catalogId: string) => {
    if (!queuedSet.has(catalogId)) setQueue((prev) => [...prev, catalogId]);
  };

  const handleRemove = (catalogId: string) => {
    setQueue((prev) => prev.filter((id) => id !== catalogId));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    setQueue((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (idx: number) => {
    setQueue((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleSave = () => {
    setSavedState({ bgFileList, logoFileList, queue });
    message.success('Screensaver settings saved (simulated)');
  };

  const garmentMap = useMemo(() => {
    const m: Record<string, GarmentCatalog> = {};
    garments.forEach((g) => { m[g.catalog_id] = g; });
    return m;
  }, [garments]);

  const leftColumns: ColumnsType<GarmentCatalog> = [
    {
      title: 'Garment',
      key: 'garment',
      render: (_, g) => (
        <Space>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={g.image_url} alt={g.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{g.name}</div>
            {g.sex && <Tag style={{ fontSize: 11, lineHeight: '16px' }}>{g.sex}</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      align: 'right',
      render: (_, g) =>
        queuedSet.has(g.catalog_id) ? (
          <Tag color="green" style={{ fontSize: 11 }}>Added</Tag>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(g.catalog_id)}
          >
            Add
          </Button>
        ),
    },
  ];

  if (!currentUser) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <PictureOutlined style={{ marginRight: 8 }} />
          Screensaver Settings
        </Title>
        {isDirty && (
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Save Settings
          </Button>
        )}
      </div>

      {/* Background Image */}
      <Card title={<><PictureOutlined style={{ marginRight: 8 }} />Background Image</>} style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Recommended size: 1920 × 1080 px.
        </Text>
        <Upload
          listType="picture-card"
          fileList={bgFileList}
          maxCount={1}
          beforeUpload={() => false}
          onChange={({ fileList }) => setBgFileList(fileList)}
          accept="image/*"
        >
          {bgFileList.length === 0 && (
            <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
          )}
        </Upload>
      </Card>

      {/* Logo */}
      <Card title={<><PictureOutlined style={{ marginRight: 8 }} />Logo</>} style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Recommended: 400 × 200 px, PNG with transparent background.
        </Text>
        <Upload
          listType="picture-card"
          fileList={logoFileList}
          maxCount={1}
          beforeUpload={() => false}
          onChange={({ fileList }) => setLogoFileList(fileList)}
          accept="image/*"
        >
          {logoFileList.length === 0 && (
            <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
          )}
        </Upload>
      </Card>

      {/* Loop Garments — dual-pane */}
      <Card title="Loop Garments">
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Add garments to the loop queue on the right. Use the arrows to adjust playback order.
        </Text>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Left pane: searchable garment list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Search
              placeholder="Search garments..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <Table<GarmentCatalog>
              size="small"
              columns={leftColumns}
              dataSource={filteredGarments}
              rowKey="catalog_id"
              pagination={{ pageSize: 8, size: 'small', showSizeChanger: false }}
              locale={{ emptyText: 'No garments found' }}
              showHeader={false}
            />
          </div>

          <Divider type="vertical" style={{ height: 'auto', alignSelf: 'stretch' }} />

          {/* Right pane: ordered queue */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Loop Queue{' '}
              <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                ({queue.length} garment{queue.length !== 1 ? 's' : ''})
              </Text>
            </Text>
            {queue.length === 0 ? (
              <Empty description="No garments added yet" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '24px 0' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {queue.map((id, idx) => {
                  const g = garmentMap[id];
                  if (!g) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 8px',
                        border: '1px solid #f0f0f0',
                        borderRadius: 6,
                        background: '#fafafa',
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12, minWidth: 18 }}>{idx + 1}.</Text>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.image_url} alt={g.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                      <Text style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</Text>
                      <Space size={2}>
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowUpOutlined />}
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowDownOutlined />}
                          disabled={idx === queue.length - 1}
                          onClick={() => handleMoveDown(idx)}
                        />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemove(id)}
                        />
                      </Space>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
