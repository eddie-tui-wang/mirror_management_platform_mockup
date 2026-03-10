'use client';

import React, { useState } from 'react';
import {
  Table, Button, Space, Typography, Image, Modal, Tag, Upload, message, Tooltip,
} from 'antd';
import {
  UploadOutlined, DeleteOutlined, EyeOutlined, CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table/interface';
import { useAuthStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

interface ImageRecord {
  key: string;
  file_name: string;
  image_url: string;
  upload_time: string;
}

// 生成 mock 图片列表
const INITIAL_IMAGES: ImageRecord[] = [
  {
    key: 'img_001',
    file_name: 'product-jacket.jpg',
    image_url: 'https://picsum.photos/seed/jacket/400/400',
    upload_time: '2025-03-01 10:23:45',
  },
  {
    key: 'img_002',
    file_name: 'summer-dress.png',
    image_url: 'https://picsum.photos/seed/dress/400/400',
    upload_time: '2025-03-03 14:05:12',
  },
  {
    key: 'img_003',
    file_name: 'casual-trousers.webp',
    image_url: 'https://picsum.photos/seed/trousers/400/400',
    upload_time: '2025-03-05 09:48:30',
  },
];

export default function CustomerImagesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const orgName = currentUser?.org_name ?? '';
  const portal = currentUser?.portal ?? 'customer';

  const canUpload = hasPermission(portal, 'customer:images:upload');
  const canDelete = hasPermission(portal, 'customer:images:delete');

  const [images, setImages] = useState<ImageRecord[]>(INITIAL_IMAGES);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleBeforeUpload = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error(`Unsupported format: ${file.name}. Only jpg, jpeg, png, webp are allowed.`);
      return Upload.LIST_IGNORE;
    }
    if (!file.name.trim()) {
      message.error('File name cannot be empty.');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(`${file.name} exceeds the ${MAX_SIZE_MB}MB size limit.`);
      return Upload.LIST_IGNORE;
    }

    const duplicate = images.find((img) => img.file_name === file.name);
    if (duplicate) {
      Modal.confirm({
        title: 'File already exists',
        content: `"${file.name}" already exists. Choose "Overwrite" to replace it, or "Rename" to save with a timestamp suffix.`,
        okText: 'Overwrite',
        cancelText: 'Rename',
        onOk: () => doUpload(file, file.name),
        onCancel: () => {
          const ext = file.name.lastIndexOf('.');
          const base = ext > 0 ? file.name.slice(0, ext) : file.name;
          const suffix = ext > 0 ? file.name.slice(ext) : '';
          const newName = `${base}_${Date.now()}${suffix}`;
          doUpload(file, newName);
        },
      });
      return Upload.LIST_IGNORE;
    }

    doUpload(file, file.name);
    return Upload.LIST_IGNORE;
  };

  const doUpload = (file: File, fileName: string) => {
    setUploading(true);
    // 模拟上传延迟，生成本地 ObjectURL 作为预览地址
    setTimeout(() => {
      const objectUrl = URL.createObjectURL(file);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const uploadTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const newRecord: ImageRecord = {
        key: `img_${Date.now()}`,
        file_name: fileName,
        image_url: objectUrl,
        upload_time: uploadTime,
      };
      setImages((prev) => {
        // 如果是覆盖，替换旧记录
        const idx = prev.findIndex((img) => img.file_name === fileName);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newRecord;
          return updated;
        }
        return [newRecord, ...prev];
      });
      message.success(`"${fileName}" uploaded successfully`);
      setUploading(false);
    }, 600);
  };

  const handleDelete = (record: ImageRecord) => {
    Modal.confirm({
      title: `Delete "${record.file_name}"?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setImages((prev) => prev.filter((img) => img.key !== record.key));
        message.success(`"${record.file_name}" deleted`);
      },
    });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      message.success('Image URL copied to clipboard');
    }).catch(() => {
      message.error('Copy failed. Please copy manually.');
    });
  };

  const columns: ColumnsType<ImageRecord> = [
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
      title: 'upload_time',
      dataIndex: 'upload_time',
      width: 180,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
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
          <PermGuard permission="customer:images:delete" fallback="disable">
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {orgName} - Image Library
        </Title>
        <PermGuard permission="customer:images:upload">
          <Upload
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              Bulk Upload Images
            </Button>
          </Upload>
        </PermGuard>
      </div>

      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        Supports jpg, jpeg, png, webp. Max {MAX_SIZE_MB}MB per image. Copy image URLs for use in garment imports.
      </Typography.Text>

      <Table<ImageRecord>
        columns={columns}
        dataSource={images}
        rowKey="key"
        pagination={{ pageSize: 20 }}
      />

      {/* 图片预览弹窗 */}
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
