'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Button, Tag, Space, Typography, Image, Select, Modal,
  Input, List, message,
} from 'antd';
import { UploadOutlined, AppstoreOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import {
  getOrgGarments, getOrgGarmentCategories, getGarmentCategoryName,
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

  // 分类管理弹窗状态
  const [catMgrOpen, setCatMgrOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 设置分类弹窗
  const [assignCatOpen, setAssignCatOpen] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState<GarmentCatalog | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // 分类筛选
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>(undefined);

  const categories = useMemo(() => getOrgGarmentCategories(orgId), [orgId]);
  const allGarments = useMemo(() => getOrgGarments(orgId), [orgId]);

  const dataSource = useMemo(() => {
    if (!filterCategoryId) return allGarments;
    if (filterCategoryId === '__none__') return allGarments.filter((g) => !g.category_id);
    return allGarments.filter((g) => g.category_id === filterCategoryId);
  }, [allGarments, filterCategoryId]);

  // 分类选项（含"未分类"）
  const categoryFilterOptions = useMemo(() => {
    const opts = categories.map((c) => ({ label: c.name, value: c.category_id }));
    opts.push({ label: 'Uncategorized', value: '__none__' });
    return opts;
  }, [categories]);

  // 打开设置分类弹窗
  const openSetCategory = (record: GarmentCatalog) => {
    setSelectedGarment(record);
    setSelectedCategoryId(record.category_id);
    setAssignCatOpen(true);
  };

  // 确认设置分类
  const handleSetCategory = () => {
    const catName = selectedCategoryId
      ? categories.find((c) => c.category_id === selectedCategoryId)?.name ?? '-'
      : 'Uncategorized';
    message.success(
      `Garment "${selectedGarment?.name}" set to category "${catName}" (simulated)`
    );
    setAssignCatOpen(false);
    setSelectedGarment(null);
  };

  // 添加分类
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

  // 删除分类确认
  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const affectedCount = allGarments.filter((g) => g.category_id === categoryId).length;
    Modal.confirm({
      title: `Delete category "${categoryName}"?`,
      content: affectedCount > 0
        ? `${affectedCount} garment(s) will become uncategorized.`
        : 'No garments are using this category.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => message.success(`Category "${categoryName}" deleted (simulated)`),
    });
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
              onClick={() => openSetCategory(record)}
            >
              Set Category
            </Button>
          </PermGuard>
          <PermGuard permission="customer:garments:edit" fallback="disable">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Edit garment ${record.name} (simulated)`)
              }
            >
              Edit
            </Button>
          </PermGuard>
          <PermGuard permission="customer:garments:delete" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                message.info(`Remove/Delete garment ${record.name} (simulated)`)
              }
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {orgName} - Garments
        </Title>
        <Space>
          {canManageCategories && (
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => setCatMgrOpen(true)}
            >
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

      {/* 分类筛选 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Filter by Category"
          allowClear
          style={{ width: 200 }}
          value={filterCategoryId}
          onChange={setFilterCategoryId}
          options={categoryFilterOptions}
        />
      </Space>

      <Table<GarmentCatalog>
        columns={columns}
        dataSource={dataSource}
        rowKey="catalog_id"
        pagination={{ pageSize: 10 }}
      />

      {/* 管理分类弹窗 */}
      <Modal
        title="Manage Categories"
        open={catMgrOpen}
        onCancel={() => {
          setCatMgrOpen(false);
          setNewCategoryName('');
        }}
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

      {/* 设置分类弹窗 */}
      <Modal
        title={`Set Category for "${selectedGarment?.name}"`}
        open={assignCatOpen}
        onOk={handleSetCategory}
        onCancel={() => {
          setAssignCatOpen(false);
          setSelectedGarment(null);
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <Select
          placeholder="Select a category"
          allowClear
          style={{ width: '100%' }}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          options={categories.map((c) => ({ label: c.name, value: c.category_id }))}
        />
      </Modal>
    </div>
  );
}
