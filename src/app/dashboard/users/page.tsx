'use client';

import React, { useMemo, useState } from 'react';
import {
  Table, Button, Tag, Space, Typography, message, Select, Input, Tabs,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'next/navigation';
import { users, memberships, organizations } from '@/lib/mock-data';
import {
  ROLE_PERMISSIONS, PERMISSIONS, type PermissionKey,
} from '@/lib/permissions';
import type { Organization, OrgMembership, User, RoleKey, Status } from '@/lib/types';
import PermGuard from '@/components/PermGuard';

const { Title } = Typography;

// ---------- 用户行类型（用户 + 成员关系 + 组织信息的联合视图） ----------

interface UserRow {
  key: string;
  user_id: string;
  email: string;
  name: string;
  status: Status;
  last_login: string | null;
  current_device: string | null;
  org_id: string;
  org_name: string;
  org_type: string;
  role_key: RoleKey;
}

// ---------- 角色行类型 ----------

interface RoleRow {
  role_key: RoleKey;
  permissionCount: number;
  permissions: PermissionKey[];
}

// ===================== Users Tab =====================

function UsersTab() {
  const searchParams = useSearchParams();

  const [searchText, setSearchText] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>(searchParams.get('org') ?? 'all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 构建用户联合列表：每条成员关系生成一行
  const allUserRows: UserRow[] = useMemo(() => {
    return memberships.map((m: OrgMembership) => {
      const user = users.find((u: User) => u.user_id === m.user_id);
      const org = organizations.find((o: Organization) => o.org_id === m.org_id);
      return {
        key: `${m.user_id}_${m.org_id}`,
        user_id: m.user_id,
        email: user?.email ?? '-',
        name: user?.name ?? '-',
        status: user?.status ?? 'Disabled',
        last_login: user?.last_login ?? null,
        current_device: user?.current_device ?? null,
        org_id: m.org_id,
        org_name: org?.name ?? '-',
        org_type: org?.org_type ?? '-',
        role_key: m.role_key,
      };
    });
  }, []);

  // 唯一组织选项
  const orgOptions = useMemo(() => {
    const orgsMap = new Map<string, string>();
    allUserRows.forEach((r) => {
      if (!orgsMap.has(r.org_id)) {
        orgsMap.set(r.org_id, r.org_name);
      }
    });
    return Array.from(orgsMap.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [allUserRows]);

  // 唯一角色选项
  const roleOptions = useMemo(() => {
    const rolesSet = new Set<string>();
    allUserRows.forEach((r) => rolesSet.add(r.role_key));
    return Array.from(rolesSet).map((r) => ({ value: r, label: r }));
  }, [allUserRows]);

  // 过滤后的数据
  const dataSource = useMemo(() => {
    let filtered = allUserRows;

    if (searchText.trim()) {
      const lower = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.email.toLowerCase().includes(lower) ||
          r.name.toLowerCase().includes(lower) ||
          r.user_id.toLowerCase().includes(lower)
      );
    }

    if (orgFilter !== 'all') {
      filtered = filtered.filter((r) => r.org_id === orgFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((r) => r.role_key === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    return filtered;
  }, [allUserRows, searchText, orgFilter, roleFilter, statusFilter]);

  const columns: ColumnsType<UserRow> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'user_id',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
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
      title: 'Org Type',
      dataIndex: 'org_type',
      key: 'org_type',
      render: (type: string) => (
        <Tag color={type === 'CHANNEL' ? 'geekblue' : 'volcano'}>{type}</Tag>
      ),
    },
    {
      title: 'Org Name',
      dataIndex: 'org_name',
      key: 'org_name',
    },
    {
      title: 'org_id',
      dataIndex: 'org_id',
      key: 'org_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role_key',
      key: 'role_key',
      render: (role: RoleKey) => <Tag>{role}</Tag>,
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <PermGuard permission="platform:users:disable">
            <Button
              type="link"
              size="small"
              danger={record.status === 'Active'}
              onClick={() =>
                message.info(
                  `${record.status === 'Active' ? 'Disable' : 'Enable'} user ${record.email} (simulated)`
                )
              }
            >
              {record.status === 'Active' ? 'Disable' : 'Enable'}
            </Button>
          </PermGuard>
          <PermGuard permission="platform:users:reset_password">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Reset password for ${record.email} (simulated)`)
              }
            >
              Reset Password
            </Button>
          </PermGuard>
          <PermGuard permission="platform:users:change_role">
            <Button
              type="link"
              size="small"
              onClick={() =>
                message.info(`Change role for ${record.email} (simulated)`)
              }
            >
              Change Role
            </Button>
          </PermGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search by email/name/user_id"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 240 }}
        />
        <span>Organization:</span>
        <Select
          value={orgFilter}
          onChange={setOrgFilter}
          style={{ width: 200 }}
          options={[{ value: 'all', label: 'All' }, ...orgOptions]}
        />
        <span>Role:</span>
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          style={{ width: 160 }}
          options={[{ value: 'all', label: 'All' }, ...roleOptions]}
        />
        <span>Status:</span>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Active', label: 'Active' },
            { value: 'Disabled', label: 'Disabled' },
          ]}
        />
      </Space>

      <Table<UserRow>
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

// ===================== Roles Tab =====================

function RolesTab() {
  const roleData: RoleRow[] = useMemo(() => {
    return (Object.keys(ROLE_PERMISSIONS) as RoleKey[]).map((role_key) => ({
      role_key,
      permissionCount: ROLE_PERMISSIONS[role_key].length,
      permissions: ROLE_PERMISSIONS[role_key],
    }));
  }, []);

  const columns: ColumnsType<RoleRow> = [
    {
      title: 'Role Name',
      dataIndex: 'role_key',
      key: 'role_key',
      render: (role: RoleKey) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Permission Count',
      dataIndex: 'permissionCount',
      key: 'permissionCount',
    },
  ];

  return (
    <Table<RoleRow>
      columns={columns}
      dataSource={roleData}
      rowKey="role_key"
      pagination={false}
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ padding: '8px 0' }}>
            <Space wrap size={[4, 8]}>
              {record.permissions.map((perm) => (
                <Tag key={perm} style={{ marginBottom: 4 }}>
                  {perm}
                  <Typography.Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                    ({PERMISSIONS[perm]})
                  </Typography.Text>
                </Tag>
              ))}
            </Space>
          </div>
        ),
      }}
    />
  );
}

// ===================== Main Page =====================

export default function UsersPage() {
  const tabItems = [
    {
      key: 'users',
      label: 'User Management',
      children: <UsersTab />,
    },
    {
      key: 'roles',
      label: 'Role Permissions',
      children: <RolesTab />,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Users & Roles</Title>
      </div>
      <Tabs items={tabItems} defaultActiveKey="users" />
    </div>
  );
}
