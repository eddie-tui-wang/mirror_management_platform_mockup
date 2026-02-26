'use client';

import React, { useMemo, useState } from 'react';
import { Table, Tag, Typography, Modal, List } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getCustomerAssignedTemplates } from '@/lib/mock-data';

const { Title, Text } = Typography;

type AssignedTemplateRow = ReturnType<typeof getCustomerAssignedTemplates>[number];

export default function CustomerTemplatesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState<{ name: string; prompts: string[] } | null>(null);

  const dataSource: AssignedTemplateRow[] = useMemo(() => {
    return getCustomerAssignedTemplates(orgId);
  }, [orgId]);

  const openPrompts = (record: AssignedTemplateRow) => {
    setSelectedPrompts({ name: record.template_name, prompts: record.template_prompts });
    setPromptModalOpen(true);
  };

  const columns: ColumnsType<AssignedTemplateRow> = [
    {
      title: 'Name',
      dataIndex: 'template_name',
      key: 'template_name',
    },
    {
      title: 'Prompts',
      key: 'prompts',
      render: (_, record) => (
        record.template_prompts.length > 0 ? (
          <Tag
            style={{ cursor: 'pointer' }}
            color="blue"
            onClick={() => openPrompts(record)}
          >
            {record.template_prompts.length} prompt{record.template_prompts.length !== 1 ? 's' : ''}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        )
      ),
    },
    {
      title: 'Assigned At',
      dataIndex: 'assigned_at',
      key: 'assigned_at',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Title level={4} style={{ margin: 0 }}>
          {orgName} - Templates
        </Title>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
        {dataSource.length} template{dataSource.length !== 1 ? 's' : ''} assigned to this account
      </Text>

      <Table<AssignedTemplateRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="assignment_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={selectedPrompts?.name ? `Prompts — ${selectedPrompts.name}` : 'Prompts'}
        open={promptModalOpen}
        onCancel={() => { setPromptModalOpen(false); setSelectedPrompts(null); }}
        footer={null}
        width={560}
      >
        {selectedPrompts && selectedPrompts.prompts.length > 0 ? (
          <List
            size="small"
            dataSource={selectedPrompts.prompts}
            renderItem={(prompt, index) => (
              <List.Item style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12, minWidth: 20, paddingTop: 1 }}>
                    {index + 1}.
                  </Text>
                  <Text style={{ fontSize: 13, lineHeight: '1.6', flex: 1, whiteSpace: 'pre-wrap' }}>
                    {prompt}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">No prompts for this template.</Text>
        )}
      </Modal>
    </div>
  );
}
