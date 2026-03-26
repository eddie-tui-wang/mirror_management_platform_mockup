'use client';

import React, { useMemo, useState, useRef } from 'react';
import {
  Table, Button, Tag, Space, Typography, Image, Select, Modal,
  Input, message, Alert, Form, Switch, Upload,
} from 'antd';
import {
  UploadOutlined, DeleteOutlined,
  DesktopOutlined, AppstoreAddOutlined, EditOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import { useAuthStore } from '@/lib/store';
import { useCodeStore } from '@/lib/code-store';
import {
  getOrgGarments, getOrgGarmentCategories, getGarmentCategoryName,
  getGarmentAssignedDevices, getCustomerAssignedTemplates,
} from '@/lib/mock-data';
import type { GarmentCatalog, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type UploadedFile = { uid: string; file: File; previewUrl: string; name: string };

export default function CustomerGarmentsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';
  const { codes } = useCodeStore();

  // ── 本地新增的 garments（Upload 后追加） ──────────────────
  const [localGarments, setLocalGarments] = useState<GarmentCatalog[]>([]);

  // ── Edit 弹窗 ──────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editGarment, setEditGarment] = useState<GarmentCatalog | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<Status>('Active');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editTemplateIds, setEditTemplateIds] = useState<string[]>([]);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSex, setEditSex] = useState<string | undefined>(undefined);

  // ── 图片上传（Edit 弹窗） ─────────────────────────────────
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Upload 弹窗 ───────────────────────────────────────────
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // ── 分类筛选 ──────────────────────────────────────────────
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);

  // ── 分配设备弹窗 ──────────────────────────────────────────
  const [assignDevOpen, setAssignDevOpen] = useState(false);
  const [assignDevGarment, setAssignDevGarment] = useState<GarmentCatalog | null>(null);
  const [assignDevSelected, setAssignDevSelected] = useState<string[]>([]);

  // ── 批量选择 ─────────────────────────────────────────────
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ── 批量设置分类弹窗 ──────────────────────────────────────
  const [bulkCatOpen, setBulkCatOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState<string | null>(null);

  const categories = useMemo(() => getOrgGarmentCategories(orgId), [orgId]);
  const mockGarments = useMemo(() => getOrgGarments(orgId), [orgId]);
  const allGarments = useMemo(() => [...localGarments, ...mockGarments], [localGarments, mockGarments]);
  const assignedTemplates = useMemo(() => getCustomerAssignedTemplates(orgId), [orgId]);

  // Activated devices = Bound activation codes belonging to this customer
  const boundDevices = useMemo(
    () => codes.filter((c) => c.org_id === orgId && c.status === 'Bound'),
    [codes, orgId]
  );

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

  // ── Edit 弹窗操作 ─────────────────────────────────────────
  const openEdit = (record: GarmentCatalog) => {
    setEditGarment(record);
    setEditName(record.name);
    setEditStatus(record.status);
    setEditCategoryId(record.category_id);
    setEditTemplateIds(record.template_ids ?? []);
    setEditImageUrl(record.image_url ?? '');
    setEditSex(record.sex);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    // 更新 localGarments 中的记录（mock garments 仅模拟提示）
    setLocalGarments((prev) =>
      prev.map((g) =>
        g.catalog_id === editGarment?.catalog_id
          ? { ...g, name: editName, status: editStatus, category_id: editCategoryId, template_ids: editTemplateIds, image_url: editImageUrl, sex: editSex as import('@/lib/types').GarmentSex | undefined }
          : g
      )
    );
    message.success(`Garment "${editName}" updated`);
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
        setLocalGarments((prev) => prev.filter((g) => !selectedRowKeys.includes(g.catalog_id)));
        message.success(`${selectedCount} garment(s) deleted`);
        setSelectedRowKeys([]);
      },
    });
  };

  const handleBulkCategoryConfirm = () => {
    const catName = bulkCategoryId
      ? categories.find((c) => c.category_id === bulkCategoryId)?.name ?? '-'
      : 'Uncategorized';
    message.success(`${selectedCount} garment(s) set to category "${catName}" (simulated)`);
    setBulkCatOpen(false);
    setSelectedRowKeys([]);
  };

  // ── Upload 逻辑 ───────────────────────────────────────────
  const handleUploadBeforeUpload = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      message.error(`${file.name}: only JPG, PNG, WebP are supported`);
      return Upload.LIST_IGNORE;
    }
    const previewUrl = URL.createObjectURL(file);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setUploadedFiles((prev) => [
      ...prev,
      { uid: `${Date.now()}-${Math.random()}`, file, previewUrl, name: nameWithoutExt },
    ]);
    return false;
  };

  const handleUploadConfirm = () => {
    if (uploadedFiles.length === 0) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newGarments: GarmentCatalog[] = uploadedFiles.map((uf) => ({
      catalog_id: `local_${uf.uid}`,
      org_id: orgId,
      name: uf.name,
      category_id: null,
      sex: undefined,
      image_url: uf.previewUrl,
      status: 'Active' as Status,
      template_ids: [],
      updated_at: now,
    }));
    setLocalGarments((prev) => [...newGarments, ...prev]);
    message.success(`${uploadedFiles.length} garment(s) added. Click Edit to fill in details.`);
    setUploadedFiles([]);
    setUploadOpen(false);
  };

  const handleUploadClose = () => {
    uploadedFiles.forEach((uf) => URL.revokeObjectURL(uf.previewUrl));
    setUploadedFiles([]);
    setUploadOpen(false);
  };

  const removeUploadedFile = (uid: string) => {
    setUploadedFiles((prev) => {
      const target = prev.find((f) => f.uid === uid);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.uid !== uid);
    });
  };

  // ── 行选择配置 ────────────────────────────────────────────
  const rowSelection: TableRowSelection<GarmentCatalog> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
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
        return catName
          ? <Tag color="cyan">{catName}</Tag>
          : <Typography.Text type="secondary">-</Typography.Text>;
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
              onClick={() => {
                setLocalGarments((prev) => prev.filter((g) => g.catalog_id !== record.catalog_id));
                message.success(`Garment "${record.name}" deleted`);
              }}
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
        <PermGuard permission="customer:garments:upload">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </Button>
        </PermGuard>
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
                    onClick={() => { setBulkCategoryId(null); setBulkCatOpen(true); }}
                  >
                    Set Category
                  </Button>
                </PermGuard>
                <PermGuard permission="customer:garments:delete" fallback="disable">
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
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

      {/* ── Upload 弹窗 ── */}
      <Modal
        title="Upload Garments"
        open={uploadOpen}
        onCancel={handleUploadClose}
        onOk={handleUploadConfirm}
        okText={uploadedFiles.length > 0 ? `Add ${uploadedFiles.length} garment(s)` : 'Add'}
        okButtonProps={{ disabled: uploadedFiles.length === 0 }}
        cancelText="Cancel"
        width={560}
      >
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
          Upload one or more garment images. After adding, click <strong>Edit</strong> on each row to fill in name, category, and other details.
        </Typography.Text>

        <Upload.Dragger
          accept="image/jpeg,image/png,image/webp"
          multiple
          showUploadList={false}
          beforeUpload={handleUploadBeforeUpload}
          style={{ marginBottom: uploadedFiles.length > 0 ? 16 : 0 }}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag images here</p>
          <p className="ant-upload-hint">JPG · PNG · WebP, up to multiple files at once</p>
        </Upload.Dragger>

        {uploadedFiles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {uploadedFiles.map((uf) => (
              <div key={uf.uid} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uf.previewUrl}
                  alt={uf.name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, display: 'block', border: '1px solid #f0f0f0' }}
                />
                <button
                  onClick={() => removeUploadedFile(uf.uid)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                    width: 20, height: 20, cursor: 'pointer', color: '#fff',
                    fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
                <div style={{ fontSize: 11, color: '#555', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {uf.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ── Edit 弹窗 ── */}
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
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Image
                src={editImageUrl}
                alt="garment"
                width={72}
                height={72}
                style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0', flexShrink: 0 }}
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTQiIHk9IjM3IiBmb250LXNpemU9IjEyIiBmaWxsPSIjY2NjIj5OL0E8L3RleHQ+PC9zdmc+"
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={imageInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setEditImageUrl(URL.createObjectURL(file));
                  e.target.value = '';
                }}
              />
              <Button
                size="small"
                icon={<UploadOutlined />}
                onClick={() => imageInputRef.current?.click()}
              >
                Upload New
              </Button>
            </div>
          </Form.Item>

          <Form.Item label="Name">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} showCount />
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

          <Form.Item label="Sex">
            <Select
              placeholder="Select sex"
              allowClear
              style={{ width: '100%' }}
              value={editSex}
              onChange={(val) => setEditSex(val)}
              options={[
                { label: 'male', value: 'male' },
                { label: 'female', value: 'female' },
                { label: 'unisex', value: 'unisex' },
              ]}
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

          <Form.Item
            label="Templates"
            extra="Only templates assigned to your account are shown."
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

      {/* ── 分配设备弹窗 ── */}
      <Modal
        title={`Assign Devices — "${assignDevGarment?.name}"`}
        open={assignDevOpen}
        onOk={handleAssignDevices}
        onCancel={() => { setAssignDevOpen(false); setAssignDevGarment(null); }}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        {boundDevices.length > 0 ? (
          <Table
            size="small"
            rowKey={(r) => r.bound_device_id ?? r.code_id}
            dataSource={boundDevices}
            pagination={false}
            rowSelection={{
              selectedRowKeys: assignDevSelected,
              onChange: (keys) => setAssignDevSelected(keys as string[]),
            }}
            columns={[
              {
                title: 'Device ID',
                dataIndex: 'bound_device_id',
                key: 'bound_device_id',
                render: (id: string) => <Typography.Text code style={{ fontSize: 12 }}>{id}</Typography.Text>,
              },
              {
                title: 'Nickname',
                dataIndex: 'nickname',
                key: 'nickname',
                render: (val: string | null) =>
                  val ? <Typography.Text>{val}</Typography.Text> : <Typography.Text type="secondary">—</Typography.Text>,
              },
              {
                title: 'Activation Code',
                dataIndex: 'code',
                key: 'code',
                render: (c: string) => <Typography.Text type="secondary" style={{ fontSize: 11 }}>{c}</Typography.Text>,
              },
              {
                title: 'Type',
                dataIndex: 'code_type',
                key: 'code_type',
                render: (t: string) => <Tag color={t === 'Regular' ? 'blue' : 'orange'}>{t}</Tag>,
              },
            ]}
          />
        ) : (
          <Typography.Text type="secondary">
            No activated devices. Please bind a device first on the Devices page.
          </Typography.Text>
        )}
      </Modal>
    </div>
  );
}
