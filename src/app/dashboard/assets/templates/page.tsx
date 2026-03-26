'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Table, Button, Tag, Space, Typography, Select, Input, Modal,
  Form, List, message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  masterTemplates, getTemplateAssignedOrgs, getTemplateUnassignedOrgs,
} from '@/lib/mock-data';
import type { MasterTemplate } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

export default function TemplatesPage() {
  // 筛选状态
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 弹窗状态
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MasterTemplate | null>(null);
  const [newAssignments, setNewAssignments] = useState<string[]>([]);

  // 提示词管理状态（Create/Edit 弹窗内）
  const [formName, setFormName] = useState('');
  const [formPrompts, setFormPrompts] = useState<string[]>([]);
  const [promptInput, setPromptInput] = useState('');

  // 筛选数据
  const dataSource = useMemo(() => {
    return masterTemplates.filter((t) => {
      if (searchText) {
        const lower = searchText.toLowerCase();
        const matchName = t.name.toLowerCase().includes(lower);
        const matchPrompt = t.prompts.some((p) => p.toLowerCase().includes(lower));
        if (!matchName && !matchPrompt) return false;
      }
      return true;
    });
  }, [searchText]);

  // 添加提示词
  const addPrompt = () => {
    const trimmed = promptInput.trim();
    if (!trimmed) return;
    if (formPrompts.includes(trimmed)) {
      message.warning('This prompt already exists');
      return;
    }
    setFormPrompts([...formPrompts, trimmed]);
    setPromptInput('');
  };

  // 删除提示词
  const removePrompt = (index: number) => {
    setFormPrompts(formPrompts.filter((_, i) => i !== index));
  };

  // 打开创建弹窗
  const openCreateModal = () => {
    setFormName('');
    setFormPrompts([]);
    setPromptInput('');
    setCreateModalOpen(true);
  };

  // 打开编辑弹窗
  const openEditModal = (record: MasterTemplate) => {
    setSelectedTemplate(record);
    setFormName(record.name);
    setFormPrompts([...record.prompts]);
    setPromptInput('');
    setEditModalOpen(true);
  };

  // 打开分配弹窗
  const openAssignModal = (record: MasterTemplate) => {
    setSelectedTemplate(record);
    setNewAssignments([]);
    setAssignModalOpen(true);
  };

  // 确认删除模板
  const confirmDelete = (record: MasterTemplate) => {
    const assignedCount = getTemplateAssignedOrgs(record.template_id).length;
    Modal.confirm({
      title: `Delete template "${record.name}"?`,
      content: assignedCount > 0
        ? `This will also remove ${assignedCount} customer assignment(s).`
        : 'This template has no customer assignments.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => message.success(`Template "${record.name}" deleted (simulated)`),
    });
  };

  // 创建模板
  const handleCreate = () => {
    if (!formName.trim()) {
      message.error('Please enter a template name');
      return;
    }
    message.success(`Template "${formName}" created with ${formPrompts.length} prompt(s) (simulated)`);
    setCreateModalOpen(false);
  };

  // 编辑模板
  const handleEdit = () => {
    if (!formName.trim()) {
      message.error('Please enter a template name');
      return;
    }
    message.success(`Template "${formName}" updated (simulated)`);
    setEditModalOpen(false);
    setSelectedTemplate(null);
  };

  // 分配模板
  const handleAssign = () => {
    if (newAssignments.length > 0) {
      message.success(
        `Assigned "${selectedTemplate?.name}" to ${newAssignments.length} customer(s) (simulated)`
      );
    }
    setAssignModalOpen(false);
    setNewAssignments([]);
    setSelectedTemplate(null);
  };

  // 提示词编辑区域（Create 和 Edit 共用）
  const promptEditor = (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Typography.Text strong>Template Name</Typography.Text>
      </div>
      <Input
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        placeholder="e.g. Daily Life Scene"
        maxLength={100}
        showCount
        style={{ marginBottom: 16 }}
      />
      <div style={{ marginBottom: 8 }}>
        <Typography.Text strong>Prompts</Typography.Text>
      </div>
      <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
        <Input
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Enter a prompt and click Add"
          onPressEnter={addPrompt}
          maxLength={200}
          showCount
        />
        <Button type="primary" onClick={addPrompt}>
          Add
        </Button>
      </Space.Compact>
      {formPrompts.length > 0 ? (
        <List
          size="small"
          bordered
          dataSource={formPrompts}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button
                  key="del"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removePrompt(index)}
                />,
              ]}
            >
              <Typography.Text>{item}</Typography.Text>
            </List.Item>
          )}
        />
      ) : (
        <Typography.Text type="secondary">No prompts added yet.</Typography.Text>
      )}
    </div>
  );

  // 表格列定义
  const columns: ColumnsType<MasterTemplate> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Prompts',
      key: 'prompts',
      render: (_, record) => <Tag>{record.prompts.length} prompt(s)</Tag>,
    },
    {
      title: 'Assignments',
      key: 'assignments',
      render: (_, record) => {
        const count = getTemplateAssignedOrgs(record.template_id).length;
        return <Tag>{count} customer(s)</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="platform:templates:edit" fallback="disable">
            <Button type="link" size="small" onClick={() => openEditModal(record)}>
              Edit
            </Button>
          </PermGuard>
          <PermGuard permission="platform:templates:assign" fallback="disable">
            <Button type="link" size="small" onClick={() => openAssignModal(record)}>
              Assign
            </Button>
          </PermGuard>
          <PermGuard permission="platform:templates:delete" fallback="disable">
            <Button
              type="link"
              size="small"
              danger
              onClick={() => confirmDelete(record)}
            >
              Delete
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  // 分配弹窗数据
  const assignedOrgs = selectedTemplate
    ? getTemplateAssignedOrgs(selectedTemplate.template_id)
    : [];
  const unassignedOrgs = selectedTemplate
    ? getTemplateUnassignedOrgs(selectedTemplate.template_id)
    : [];

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
          Templates
        </Title>
        <PermGuard permission="platform:templates:create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create Template
          </Button>
        </PermGuard>
      </div>

      {/* 筛选栏 */}
      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="Search name or prompt"
          allowClear
          style={{ width: 240 }}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) setSearchText('');
          }}
          onPressEnter={() => setSearchText(searchInput)}
        />
      </div>

      <Table<MasterTemplate>
        columns={columns}
        dataSource={dataSource}
        rowKey="template_id"
        pagination={{ pageSize: 10 }}
      />

      {/* 创建模板弹窗 */}
      <Modal
        title="Create Template"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => setCreateModalOpen(false)}
        okText="Create"
        cancelText="Cancel"
        width={520}
      >
        {promptEditor}
      </Modal>

      {/* 编辑模板弹窗 */}
      <Modal
        title="Edit Template"
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedTemplate(null);
        }}
        okText="Save"
        cancelText="Cancel"
        width={520}
      >
        {promptEditor}
      </Modal>

      {/* 分配模板弹窗 */}
      <Modal
        title={`Assign "${selectedTemplate?.name}" to Customers`}
        open={assignModalOpen}
        onOk={handleAssign}
        onCancel={() => {
          setAssignModalOpen(false);
          setNewAssignments([]);
          setSelectedTemplate(null);
        }}
        okText="Confirm"
        cancelText="Cancel"
        width={560}
      >
        <Typography.Text strong>Currently Assigned:</Typography.Text>
        {assignedOrgs.length > 0 ? (
          <List
            size="small"
            dataSource={assignedOrgs}
            style={{ marginTop: 8, marginBottom: 16 }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    size="small"
                    danger
                    onClick={() =>
                      message.success(
                        `Removed assignment for ${item.org_name} (simulated)`
                      )
                    }
                  >
                    Remove
                  </Button>,
                ]}
              >
                {item.org_name}
                <Tag
                  color={item.enabled ? 'green' : 'default'}
                  style={{ marginLeft: 8 }}
                >
                  {item.enabled ? 'Enabled' : 'Disabled'}
                </Tag>
              </List.Item>
            )}
          />
        ) : (
          <Typography.Text type="secondary" style={{ display: 'block', margin: '8px 0 16px' }}>
            No customers assigned yet.
          </Typography.Text>
        )}

        <Typography.Text strong>Add Customers:</Typography.Text>
        <Select
          mode="multiple"
          placeholder="Select customers to assign"
          options={unassignedOrgs.map((o) => ({
            label: o.name,
            value: o.org_id,
          }))}
          style={{ width: '100%', marginTop: 8 }}
          value={newAssignments}
          onChange={setNewAssignments}
        />
      </Modal>
    </div>
  );
}
