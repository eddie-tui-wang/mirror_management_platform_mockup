'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Button, Tag, Space, Typography, Image, Select, Modal,
  Input, List, Checkbox, message, Alert, Form, Switch,
} from 'antd';
import {
  UploadOutlined, AppstoreOutlined, DeleteOutlined, PlusOutlined,
  DesktopOutlined, AppstoreAddOutlined, EditOutlined,
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

const { Title } = Typography;

export default function CustomerGarmentsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';
  const canManageCategories = currentUser
    ? hasPermission(currentUser.role, 'customer:garments:manage_categories')
    : false;

  // ── 分类管理弹窗 ──────────────────────────────────────────
  const [catMgrOpen, setCatMgrOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // ── Edit 弹窗（含 Set Category + Set Templates） ──────────
  const [editOpen, setEditOpen] = useState(false);
  const [editGarment, setEditGarment] = useState<GarmentCatalog | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<Status>('Active');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editTemplateIds, setEditTemplateIds] = useState<string[]>([]);

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

  // ── 分类管理 ──────────────────────────────────────────────
  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name === trimmed)) {
      message.warning('Category already exists');
      return;
    }
    message.success(`Category "${trimmed}" created (simulated)`);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const affectedCount = allGarments.filter((g) => g.category_id === categoryId).length;
    if (affectedCount > 0) {
      Modal.error({
        title: `Cannot delete "${categoryName}"`,
        content: `${affectedCount} garment(s) are using this category. Reassign or remove them first.`,
        okText: 'OK',
      });
      return;
    }
    Modal.confirm({
      title: `Delete category "${categoryName}"?`,
      content: 'No garments are using this category. This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => message.success(`Category "${categoryName}" deleted (simulated)`),
    });
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
      title: 'Image',
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
      title: 'Garment Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'garment_id',
      dataIndex: 'garment_id',
      key: 'garment_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'Category',
      key: 'category',
      render: (_, record) => {
        const catName = getGarmentCategoryName(record.category_id);
        return catName ? <Tag color="blue">{catName}</Tag> : <Typography.Text type="secondary">-</Typography.Text>;
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
      title: 'Updated At',
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
              onClick={() => message.info(`Remove/Delete garment ${record.name} (simulated)`)}
            >
              Remove
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
          {canManageCategories && (
            <Button icon={<AppstoreOutlined />} onClick={() => setCatMgrOpen(true)}>
              Manage Categories
            </Button>
          )}
          <PermGuard permission="customer:garments:upload">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => message.info('Upload/Import garment (simulated)')}
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

      {/* ── 管理分类弹窗 ── */}
      <Modal
        title="Manage Categories"
        open={catMgrOpen}
        onCancel={() => { setCatMgrOpen(false); setNewCategoryName(''); }}
        footer={null}
        width={480}
      >
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            onPressEnter={handleAddCategory}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            Add
          </Button>
        </Space.Compact>

        {categories.length > 0 ? (
          <List
            size="small"
            bordered
            dataSource={categories}
            renderItem={(cat) => {
              const count = allGarments.filter((g) => g.category_id === cat.category_id).length;
              return (
                <List.Item
                  actions={[
                    <Button
                      key="del"
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteCategory(cat.category_id, cat.name)}
                    />,
                  ]}
                >
                  <span>
                    {cat.name}
                    <Tag style={{ marginLeft: 8 }}>{count} garment(s)</Tag>
                  </span>
                </List.Item>
              );
            }}
          />
        ) : (
          <Typography.Text type="secondary">No categories yet.</Typography.Text>
        )}
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
