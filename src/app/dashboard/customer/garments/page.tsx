'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Button, Tag, Space, Typography, Image, Select, Modal,
  Input, Checkbox, message, Alert, Form, Switch, Upload, Tooltip, Divider,
} from 'antd';
import {
  UploadOutlined, DeleteOutlined, PlusOutlined,
  DesktopOutlined, AppstoreAddOutlined, EditOutlined, DownloadOutlined, InboxOutlined,
  PictureOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import { useAuthStore } from '@/lib/store';
import {
  getOrgGarments, getOrgGarmentCategories, getGarmentCategoryName,
  getGarmentAssignedDevices, getOrgDevices, getCustomerAssignedTemplates,
} from '@/lib/mock-data';
import { hasPermission } from '@/lib/permissions';
import type { GarmentCatalog, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

// ── 批量导入类型 ────────────────────────────────────────────
type ImportRow = {
  key: number;
  name: string;
  category: string;
  sex: string;
  errors: string[];
};

const MOCK_IMPORT_ROWS: ImportRow[] = [
  { key: 1, name: 'Black Slim Trousers',   category: 'Bottom',     sex: 'male',   errors: [] },
  { key: 2, name: 'Floral Maxi Dress',     category: 'Whole look', sex: 'female', errors: [] },
  { key: 3, name: 'Oversized Hoodie',      category: 'Top',        sex: 'unisex', errors: [] },
  { key: 4, name: '',                      category: 'Top',        sex: 'male',   errors: ['Name is required'] },
  { key: 5, name: 'Vintage Denim Jacket',  category: 'Outerwear',  sex: 'kids',   errors: ['category must be one of: Top, Bottom, Whole look', 'sex must be one of: male, female, unisex'] },
];

const { Title } = Typography;

// ── 图片库 mock 数据（当前客户已上传的图片） ─────────────────
const MOCK_IMAGE_LIBRARY = [
  { key: 'img_001', file_name: 'product-jacket.jpg',   image_url: 'https://picsum.photos/seed/jacket/400/400' },
  { key: 'img_002', file_name: 'summer-dress.png',     image_url: 'https://picsum.photos/seed/dress/400/400' },
  { key: 'img_003', file_name: 'casual-trousers.webp', image_url: 'https://picsum.photos/seed/trousers/400/400' },
  { key: 'img_004', file_name: 'floral-blouse.jpg',    image_url: 'https://picsum.photos/seed/blouse/400/400' },
  { key: 'img_005', file_name: 'wool-coat.jpg',        image_url: 'https://picsum.photos/seed/coat/400/400' },
  { key: 'img_006', file_name: 'striped-tee.png',      image_url: 'https://picsum.photos/seed/tee/400/400' },
];

export default function CustomerGarmentsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  // ── Edit 弹窗（含 Set Category + Set Templates） ──────────
  const [editOpen, setEditOpen] = useState(false);
  const [editGarment, setEditGarment] = useState<GarmentCatalog | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<Status>('Active');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editTemplateIds, setEditTemplateIds] = useState<string[]>([]);
  const [editImageUrl, setEditImageUrl] = useState('');

  // ── 图片库选择器弹窗 ──────────────────────────────────────
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerSelected, setImagePickerSelected] = useState<string>('');

  // ── 分类筛选 ──────────────────────────────────────────────
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);

  // ── 分配设备弹窗 ──────────────────────────────────────────
  const [assignDevOpen, setAssignDevOpen] = useState(false);
  const [assignDevGarment, setAssignDevGarment] = useState<GarmentCatalog | null>(null);
  const [assignDevSelected, setAssignDevSelected] = useState<string[]>([]);

  // ── 批量导入弹窗 ──────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);

  // ── 批量选择 ─────────────────────────────────────────────
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ── 批量设置分类弹窗 ──────────────────────────────────────
  const [bulkCatOpen, setBulkCatOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState<string | null>(null);

  const categories = useMemo(() => getOrgGarmentCategories(orgId), [orgId]);
  const allGarments = useMemo(() => getOrgGarments(orgId), [orgId]);

  // 当前客户已被分配的模板列表（用于 Edit 弹窗模板多选）
  const assignedTemplates = useMemo(() => getCustomerAssignedTemplates(orgId), [orgId]);

  const dataSource = useMemo(() => {
    if (!filterCategoryId) return allGarments;
    if (filterCategoryId === '__none__') return allGarments.filter((g) => !g.category_id);
    return allGarments.filter((g) => g.category_id === filterCategoryId);
  }, [allGarments, filterCategoryId]);

  const categoryFilterOptions = useMemo(() => {
    const opts = categories.map((c) => ({ label: c.name, value: c.category_id }));
    opts.push({ label: 'Uncategorized', value: '__none__' });
    return opts;
  }, [categories]);

  const orgDevices = useMemo(() => getOrgDevices(orgId), [orgId]);

  // ── 打开 Edit 弹窗 ────────────────────────────────────────
  const openEdit = (record: GarmentCatalog) => {
    setEditGarment(record);
    setEditName(record.name);
    setEditStatus(record.status);
    setEditCategoryId(record.category_id);
    setEditTemplateIds(record.template_ids ?? []);
    setEditImageUrl(record.image_url ?? '');
    setEditOpen(true);
  };

  const handleEditSave = () => {
    message.success(`Garment "${editName}" updated (simulated)`);
    setEditOpen(false);
    setEditGarment(null);
  };

  // ── 分配设备 ──────────────────────────────────────────────
  const openAssignDevices = (record: GarmentCatalog) => {
    const assigned = getGarmentAssignedDevices(record.catalog_id);
    setAssignDevGarment(record);
    setAssignDevSelected(assigned.map((a) => a.device_id));
    setAssignDevOpen(true);
  };

  const handleAssignDevices = () => {
    message.success(
      `Garment "${assignDevGarment?.name}" assigned to ${assignDevSelected.length} device(s) (simulated)`
    );
    setAssignDevOpen(false);
    setAssignDevGarment(null);
  };

  // ── 批量操作 ──────────────────────────────────────────────
  const selectedCount = selectedRowKeys.length;

  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Delete ${selectedCount} garment(s)?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        message.success(`${selectedCount} garment(s) deleted (simulated)`);
        setSelectedRowKeys([]);
      },
    });
  };

  const handleBulkSetCategory = () => {
    setBulkCategoryId(null);
    setBulkCatOpen(true);
  };

  const handleBulkCategoryConfirm = () => {
    const catName = bulkCategoryId
      ? categories.find((c) => c.category_id === bulkCategoryId)?.name ?? '-'
      : 'Uncategorized';
    message.success(
      `${selectedCount} garment(s) set to category "${catName}" (simulated)`
    );
    setBulkCatOpen(false);
    setSelectedRowKeys([]);
  };

  // ── 批量导入处理 ──────────────────────────────────────────
  const importHasErrors = importRows.some((r) => r.errors.length > 0);

  const handleDownloadTemplate = () => {
    const csvContent = 'name,category,sex,image_url\n# category allowed values: Top | Bottom | Whole look\n# sex allowed values: male | female | unisex\nExample Garment,Top,male,https://example.com/image.jpg\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'garment_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBeforeUpload = (file: File) => {
    setImportFileName(file.name);
    setImportRows(MOCK_IMPORT_ROWS);
    return false;
  };

  const handleImportConfirm = () => {
    const validCount = importRows.filter((r) => r.errors.length === 0).length;
    message.success(`Successfully imported ${validCount} garment(s) (simulated)`);
    setImportOpen(false);
    setImportFileName(null);
    setImportRows([]);
  };

  const handleImportForce = () => {
    Modal.confirm({
      title: 'Import with errors?',
      content: `${importRows.filter((r) => r.errors.length > 0).length} row(s) have errors and will be skipped. Only valid rows will be imported. Continue?`,
      okText: 'Import Anyway',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        const validCount = importRows.filter((r) => r.errors.length === 0).length;
        message.success(`Imported ${validCount} valid garment(s), skipped ${importRows.filter((r) => r.errors.length > 0).length} error row(s) (simulated)`);
        setImportOpen(false);
        setImportFileName(null);
        setImportRows([]);
      },
    });
  };

  const handleImportClose = () => {
    setImportOpen(false);
    setImportFileName(null);
    setImportRows([]);
  };

  const importPreviewColumns: ColumnsType<ImportRow> = [
    {
      title: 'Row',
      dataIndex: 'key',
      width: 56,
      render: (v: number) => <span style={{ color: '#aaa' }}>#{v}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (v: string, record: ImportRow) => {
        const err = record.errors.find((e) => e.includes('Name'));
        return err
          ? <Tooltip title={err}><span style={{ color: '#ff4d4f' }}>{v || '(empty)'}</span></Tooltip>
          : <span>{v}</span>;
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (v: string, record: ImportRow) => {
        const err = record.errors.find((e) => e.includes('category'));
        if (!v) return <Typography.Text type="secondary">-</Typography.Text>;
        return err
          ? <Tooltip title={err}><Tag color="red">{v}</Tag></Tooltip>
          : <Tag color="cyan">{v}</Tag>;
      },
    },
    {
      title: 'Sex',
      dataIndex: 'sex',
      render: (v: string, record: ImportRow) => {
        const err = record.errors.find((e) => e.includes('sex'));
        return err
          ? <Tooltip title={err}><Tag color="red">{v}</Tag></Tooltip>
          : <Tag color="blue">{v}</Tag>;
      },
    },
    {
      title: 'Status',
      width: 80,
      render: (_: unknown, record: ImportRow) =>
        record.errors.length > 0
          ? <Tag color="red">Error</Tag>
          : <Tag color="green">OK</Tag>,
    },
  ];

  // ── 行选择配置 ────────────────────────────────────────────
  const rowSelection: TableRowSelection<GarmentCatalog> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const columns: ColumnsType<GarmentCatalog> = [
    {
      title: 'Preview',
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
      title: 'Category',
      key: 'category',
      render: (_, record) => {
        const catName = getGarmentCategoryName(record.category_id);
        return catName ? <Tag color="cyan">{catName}</Tag> : <Typography.Text type="secondary">-</Typography.Text>;
      },
    },
    {
      title: 'Sex',
      dataIndex: 'sex',
      key: 'sex',
      render: (sex: string | undefined) => {
        if (!sex) return <Typography.Text type="secondary">-</Typography.Text>;
        const colorMap: Record<string, string> = { male: 'blue', female: 'pink', unisex: 'purple' };
        return <Tag color={colorMap[sex] ?? 'default'}>{sex}</Tag>;
      },
    },
    {
      title: 'Templates',
      key: 'templates',
      render: (_, record) => {
        const count = (record.template_ids ?? []).length;
        return count > 0
          ? <Tag color="purple">{count} template(s)</Tag>
          : <Typography.Text type="secondary">-</Typography.Text>;
      },
    },
    {
      title: 'Devices',
      key: 'devices',
      render: (_, record) => {
        const assigned = getGarmentAssignedDevices(record.catalog_id);
        return assigned.length > 0
          ? <Tag icon={<DesktopOutlined />}>{assigned.length} device(s)</Tag>
          : <Typography.Text type="secondary">-</Typography.Text>;
      },
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
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="customer:garments:edit" fallback="disable">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              Edit
            </Button>
          </PermGuard>
          <PermGuard permission="customer:garments:assign_device" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() => openAssignDevices(record)}
            >
              Assign Devices
            </Button>
          </PermGuard>
          <PermGuard permission="customer:garments:delete" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() => message.info(`Delete garment ${record.name} (simulated)`)}
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {orgName} - Garments
        </Title>
        <Space>
          <PermGuard permission="customer:garments:upload">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setImportOpen(true)}
            >
              Upload / Import
            </Button>
          </PermGuard>
        </Space>
      </div>

      {/* Filter bar */}
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          placeholder="Filter by Category"
          allowClear
          style={{ width: 200 }}
          value={filterCategoryId}
          onChange={setFilterCategoryId}
          options={categoryFilterOptions}
        />
      </Space>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <Alert
          style={{ marginBottom: 12, borderRadius: 8 }}
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                <strong>{selectedCount}</strong> garment{selectedCount > 1 ? 's' : ''} selected
              </span>
              <Space>
                <PermGuard permission="customer:garments:edit" fallback="disable">
                  <Button
                    size="small"
                    icon={<AppstoreAddOutlined />}
                    onClick={handleBulkSetCategory}
                  >
                    Set Category
                  </Button>
                </PermGuard>
                <PermGuard permission="customer:garments:delete" fallback="disable">
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDelete}
                  >
                    Delete
                  </Button>
                </PermGuard>
                <Button size="small" type="text" onClick={() => setSelectedRowKeys([])}>
                  Clear
                </Button>
              </Space>
            </div>
          }
          type="info"
          showIcon={false}
        />
      )}

      <Table<GarmentCatalog>
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        rowKey="catalog_id"
        pagination={{ pageSize: 10 }}
      />

      {/* ── Edit 弹窗（Set Category + Set Templates 合并） ── */}
      <Modal
        title={`Edit Garment — "${editGarment?.name}"`}
        open={editOpen}
        onOk={handleEditSave}
        onCancel={() => { setEditOpen(false); setEditGarment(null); }}
        okText="Save"
        cancelText="Cancel"
        width={520}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Image">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Image
                src={editImageUrl}
                alt="garment"
                width={64}
                height={64}
                style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0', flexShrink: 0 }}
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTQiIHk9IjM3IiBmb250LXNpemU9IjEyIiBmaWxsPSIjY2NjIj5OL0E8L3RleHQ+PC9zdmc+"
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Input
                  placeholder="Paste image URL..."
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                />
                <Button
                  size="small"
                  icon={<PictureOutlined />}
                  onClick={() => { setImagePickerSelected(editImageUrl); setImagePickerOpen(true); }}
                >
                  Choose from Library
                </Button>
              </div>
            </div>
          </Form.Item>

          <Form.Item label="Name">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Status">
            <Switch
              checked={editStatus === 'Active'}
              onChange={(checked) => setEditStatus(checked ? 'Active' : 'Disabled')}
              checkedChildren="Active"
              unCheckedChildren="Disabled"
            />
          </Form.Item>

          <Form.Item label="Category">
            <Select
              placeholder="Select a category"
              allowClear
              style={{ width: '100%' }}
              value={editCategoryId}
              onChange={setEditCategoryId}
              options={categories.map((c) => ({ label: c.name, value: c.category_id }))}
            />
          </Form.Item>

          <Form.Item
            label="Templates"
            extra="Select which templates apply to this garment. Only templates assigned to your account are shown."
          >
            {assignedTemplates.length === 0 ? (
              <Typography.Text type="secondary">
                No templates have been assigned to your account yet.
              </Typography.Text>
            ) : (
              <Select
                mode="multiple"
                placeholder="Select templates"
                style={{ width: '100%' }}
                value={editTemplateIds}
                onChange={setEditTemplateIds}
                optionLabelProp="label"
                options={assignedTemplates.map((t) => ({
                  label: t.template_name,
                  value: t.template_id,
                  disabled: !t.enabled,
                }))}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 图片库选择器弹窗 ── */}
      <Modal
        title="Choose from Image Library"
        open={imagePickerOpen}
        onCancel={() => setImagePickerOpen(false)}
        onOk={() => { setEditImageUrl(imagePickerSelected); setImagePickerOpen(false); }}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{ disabled: !imagePickerSelected }}
        width={600}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '8px 0' }}>
          {MOCK_IMAGE_LIBRARY.map((img) => {
            const selected = imagePickerSelected === img.image_url;
            return (
              <div
                key={img.key}
                onClick={() => setImagePickerSelected(img.image_url)}
                style={{
                  position: 'relative', cursor: 'pointer', borderRadius: 6,
                  border: selected ? '2px solid #1677ff' : '2px solid transparent',
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.file_name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                />
                {selected && (
                  <div style={{ position: 'absolute', top: 4, right: 4 }}>
                    <CheckCircleFilled style={{ color: '#1677ff', fontSize: 18, background: '#fff', borderRadius: '50%' }} />
                  </div>
                )}
                <div style={{ padding: '4px 6px', fontSize: 11, color: '#555', background: '#fafafa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.file_name}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* ── 批量设置分类弹窗 ── */}
      <Modal
        title={`Set Category for ${selectedCount} garment(s)`}
        open={bulkCatOpen}
        onOk={handleBulkCategoryConfirm}
        onCancel={() => setBulkCatOpen(false)}
        okText="Apply"
        cancelText="Cancel"
      >
        <Select
          placeholder="Select a category"
          allowClear
          style={{ width: '100%' }}
          value={bulkCategoryId}
          onChange={setBulkCategoryId}
          options={categories.map((c) => ({ label: c.name, value: c.category_id }))}
        />
        <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
          Clearing the selection will set the garments to "Uncategorized".
        </Typography.Text>
      </Modal>

      {/* ── 批量导入弹窗 ── */}
      <Modal
        title="Bulk Import Garments"
        open={importOpen}
        onCancel={handleImportClose}
        width={680}
        footer={[
          <Button key="cancel" onClick={handleImportClose}>Cancel</Button>,
          ...(importHasErrors && importRows.length > 0 ? [
            <Button
              key="force"
              danger
              onClick={handleImportForce}
            >
              忽略错误，强制导入
            </Button>,
          ] : []),
          <Button
            key="confirm"
            type="primary"
            disabled={importRows.length === 0 || importHasErrors}
            onClick={handleImportConfirm}
          >
            Confirm Import
          </Button>,
        ]}
      >
        {/* 下载模板 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Typography.Text type="secondary">
            Download the template, fill in garment info, then upload the file.
          </Typography.Text>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            Download Template
          </Button>
        </div>

        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 12, lineHeight: '20px' }}>
          <Typography.Text type="secondary">
            <strong>category</strong> — allowed values: <Tag style={{ fontSize: 11 }}>Top</Tag><Tag style={{ fontSize: 11 }}>Bottom</Tag><Tag style={{ fontSize: 11 }}>Whole look</Tag>
          </Typography.Text>
          <br />
          <Typography.Text type="secondary">
            <strong>sex</strong> — allowed values: <Tag style={{ fontSize: 11 }}>male</Tag><Tag style={{ fontSize: 11 }}>female</Tag><Tag style={{ fontSize: 11 }}>unisex</Tag>
          </Typography.Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 上传区域 */}
        {!importFileName ? (
          <Upload.Dragger
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleImportBeforeUpload}
            style={{ marginBottom: 0 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag a file here to upload</p>
            <p className="ant-upload-hint">Supports .xlsx, .xls, .csv</p>
          </Upload.Dragger>
        ) : (
          <div>
            {/* 文件信息 + 错误摘要 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Space>
                <Typography.Text strong>{importFileName}</Typography.Text>
                <Typography.Text type="secondary">
                  — {importRows.length} rows parsed
                </Typography.Text>
              </Space>
              <Space>
                {importHasErrors && (
                  <Tag color="red">
                    {importRows.filter((r) => r.errors.length > 0).length} error(s) found
                  </Tag>
                )}
                <Button
                  size="small"
                  type="text"
                  onClick={() => { setImportFileName(null); setImportRows([]); }}
                >
                  Re-upload
                </Button>
              </Space>
            </div>

            {importHasErrors && (
              <Alert
                type="warning"
                showIcon
                message="存在错误行。你可以修正后重新上传，或点击「忽略错误，强制导入」跳过错误行仅导入有效数据。"
                style={{ marginBottom: 8 }}
              />
            )}

            {/* 预览表格 */}
            <Table<ImportRow>
              columns={importPreviewColumns}
              dataSource={importRows}
              rowKey="key"
              size="small"
              pagination={false}
              onRow={(record) => ({
                style: record.errors.length > 0 ? { background: '#fff2f0' } : {},
              })}
              style={{ border: '1px solid #f0f0f0', borderRadius: 6 }}
            />
          </div>
        )}
      </Modal>

      {/* ── 分配设备弹窗 ── */}
      <Modal
        title={`Assign Devices — "${assignDevGarment?.name}"`}
        open={assignDevOpen}
        onOk={handleAssignDevices}
        onCancel={() => { setAssignDevOpen(false); setAssignDevGarment(null); }}
        okText="Save"
        cancelText="Cancel"
      >
        {orgDevices.length > 0 ? (
          <Checkbox.Group
            value={assignDevSelected}
            onChange={(vals) => setAssignDevSelected(vals as string[])}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {orgDevices.map((d) => (
              <Checkbox key={d.device_id} value={d.device_id}>
                <Space>
                  <Typography.Text code>{d.device_id}</Typography.Text>
                  <span>{d.nickname ?? ''}</span>
                  <Tag color={d.status === 'Online' ? 'green' : 'default'}>{d.status}</Tag>
                </Space>
              </Checkbox>
            ))}
          </Checkbox.Group>
        ) : (
          <Typography.Text type="secondary">No devices available for this organization.</Typography.Text>
        )}
      </Modal>
    </div>
  );
}
