'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Table, Button, Tag, Space, Typography, Select, Input, Modal, List, message,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  masterTemplates, getTemplateAssignedOrgs, getTemplateUnassignedOrgs,
} from '@/lib/mock-data';
import type { MasterTemplate } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

export default function ChannelTemplatesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MasterTemplate | null>(null);
  const [newAssignments, setNewAssignments] = useState<string[]>([]);
  const [promptsModalOpen, setPromptsModalOpen] = useState(false);
  const [promptsTemplate, setPromptsTemplate] = useState<MasterTemplate | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  const openAssignModal = (record: MasterTemplate) => {
    setSelectedTemplate(record);
    setNewAssignments([]);
    setAssignModalOpen(true);
  };

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

  const columns: ColumnsType<MasterTemplate> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Prompts',
      key: 'prompts',
      width: 100,
      render: (_, record) => (
        <Tag>{record.prompts.length} prompt{record.prompts.length !== 1 ? 's' : ''}</Tag>
      ),
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
          <Button
            type="link"
            size="small"
            onClick={() => { setPromptsTemplate(record); setPromptsModalOpen(true); }}
          >
            View Prompts
          </Button>
          <PermGuard permission="channel:templates:assign" fallback="disable">
            <Button type="link" size="small" onClick={() => openAssignModal(record)}>
              Assign
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  const assignedOrgs = selectedTemplate
    ? getTemplateAssignedOrgs(selectedTemplate.template_id)
    : [];
  const unassignedOrgs = selectedTemplate
    ? getTemplateUnassignedOrgs(selectedTemplate.template_id)
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Templates</Title>
      </div>

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

      {/* View Prompts Modal */}
      <Modal
        title={
          <Space>
            <span>{promptsTemplate?.name}</span>
            <Tag>{promptsTemplate?.prompts.length} prompt{(promptsTemplate?.prompts.length ?? 0) !== 1 ? 's' : ''}</Tag>
          </Space>
        }
        open={promptsModalOpen}
        onCancel={() => { setPromptsModalOpen(false); setPromptsTemplate(null); }}
        footer={<Button onClick={() => { setPromptsModalOpen(false); setPromptsTemplate(null); }}>Close</Button>}
        width={540}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {(promptsTemplate?.prompts ?? []).map((prompt, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: '#f9f9f9',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <div style={{
                flexShrink: 0,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#1677ff',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}>
                {i + 1}
              </div>
              <Typography.Text style={{ lineHeight: 1.6 }}>{prompt}</Typography.Text>
            </div>
          ))}
        </div>
      </Modal>

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
                      message.success(`Removed assignment for ${item.org_name} (simulated)`)
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
