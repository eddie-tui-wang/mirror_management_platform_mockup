'use client';

import React, { useMemo } from 'react';
import { Table, Tag, Typography, Switch, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getCustomerAssignedTemplates } from '@/lib/mock-data';
import { hasPermission } from '@/lib/permissions';

const { Title } = Typography;

// 从 getCustomerAssignedTemplates 返回值推断行类型
type AssignedTemplateRow = ReturnType<typeof getCustomerAssignedTemplates>[number];

export default function CustomerTemplatesPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  const orgId = currentUser?.org_id ?? '';
  const orgName = currentUser?.org_name ?? '';
  const canToggle = currentUser
    ? hasPermission(currentUser.role, 'customer:templates:toggle')
    : false;

  const dataSource: AssignedTemplateRow[] = useMemo(() => {
    return getCustomerAssignedTemplates(orgId);
  }, [orgId]);

  const columns: ColumnsType<AssignedTemplateRow> = [
    {
      title: 'Template Name',
      dataIndex: 'template_name',
      key: 'template_name',
    },
    {
      title: 'template_id',
      dataIndex: 'template_id',
      key: 'template_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'Prompts',
      key: 'prompts',
      render: (_, record) => (
        <Tooltip
          title={
            record.template_prompts.length > 0
              ? record.template_prompts.map((p, i) => <div key={i}>{`${i + 1}. ${p}`}</div>)
              : 'No prompts'
          }
        >
          <Tag style={{ cursor: 'pointer' }}>{record.template_prompts.length} prompt(s)</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Assigned At',
      dataIndex: 'assigned_at',
      key: 'assigned_at',
    },
    {
      title: 'Enabled',
      key: 'enabled',
      render: (_, record) => {
        const masterDisabled = record.template_status === 'Disabled';
        return (
          <Tooltip
            title={
              masterDisabled
                ? 'Template disabled by platform'
                : !canToggle
                  ? 'No permission'
                  : undefined
            }
          >
            <Switch
              checked={record.enabled && !masterDisabled}
              disabled={masterDisabled || !canToggle}
              onChange={(checked) => {
                message.success(
                  `Template "${record.template_name}" ${checked ? 'enabled' : 'disabled'} (simulated)`
                );
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        {orgName} - Templates
      </Title>

      <Table<AssignedTemplateRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="assignment_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
