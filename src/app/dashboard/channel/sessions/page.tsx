'use client';

import React, { useMemo, useState } from 'react';
import { Table, Tabs, Tag, Badge, Space, Typography, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore } from '@/lib/store';
import { getChannelCustomers, devices, sessions, users } from '@/lib/mock-data';
import type { Device, Session, DeviceStatus, SessionStatus } from '@/lib/types';

const { Title } = Typography;

export default function ChannelSessionsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  // ---- Filters ----
  const [deviceOrgFilter, setDeviceOrgFilter] = useState<string>('all');
  const [sessionOrgFilter, setSessionOrgFilter] = useState<string>('all');
  const [sessionUserFilter, setSessionUserFilter] = useState<string>('all');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>('all');

  // ---- Channel customers ----
  const channelCustomers = useMemo(() => {
    if (!currentUser) return [];
    return getChannelCustomers(currentUser.org_id);
  }, [currentUser]);

  const customerOrgIds = useMemo(
    () => channelCustomers.map((c) => c.org_id),
    [channelCustomers]
  );

  // ---- Devices ----
  const allDevices = useMemo(
    () => devices.filter((d) => d.current_org_id && customerOrgIds.includes(d.current_org_id)),
    [customerOrgIds]
  );

  const filteredDevices = useMemo(() => {
    if (deviceOrgFilter === 'all') return allDevices;
    return allDevices.filter((d) => d.current_org_id === deviceOrgFilter);
  }, [allDevices, deviceOrgFilter]);

  // ---- Sessions ----
  const allSessions = useMemo(
    () => sessions.filter((s) => customerOrgIds.includes(s.org_id)),
    [customerOrgIds]
  );

  const sessionUsers = useMemo(() => {
    const userIds = [...new Set(allSessions.map((s) => s.user_id))];
    return users.filter((u) => userIds.includes(u.user_id));
  }, [allSessions]);

  const filteredSessions = useMemo(() => {
    let filtered = allSessions;
    if (sessionOrgFilter !== 'all') {
      filtered = filtered.filter((s) => s.org_id === sessionOrgFilter);
    }
    if (sessionUserFilter !== 'all') {
      filtered = filtered.filter((s) => s.user_id === sessionUserFilter);
    }
    if (sessionStatusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === sessionStatusFilter);
    }
    return filtered;
  }, [allSessions, sessionOrgFilter, sessionUserFilter, sessionStatusFilter]);

  // ---- Device columns ----
  const deviceColumns: ColumnsType<Device> = [
    {
      title: 'device_id',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: DeviceStatus) => (
        <Badge
          status={status === 'Online' ? 'success' : 'default'}
          text={status}
        />
      ),
    },
    {
      title: '最后在线',
      dataIndex: 'last_seen',
      key: 'last_seen',
    },
    {
      title: '所属客户',
      dataIndex: 'current_org_name',
      key: 'current_org_name',
      render: (name: string | null) => name ?? '-',
    },
    {
      title: '当前用户',
      dataIndex: 'current_user_email',
      key: 'current_user_email',
      render: (email: string | null) => email ?? '-',
    },
    {
      title: '会话开始',
      dataIndex: 'session_start',
      key: 'session_start',
      render: (val: string | null) => val ?? '-',
    },
  ];

  // ---- Session columns ----
  const sessionColumns: ColumnsType<Session> = [
    {
      title: 'session_id',
      dataIndex: 'session_id',
      key: 'session_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: SessionStatus) => {
        const colorMap: Record<SessionStatus, string> = {
          ACTIVE: 'green',
          TERMINATED: 'red',
          EXPIRED: 'orange',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: '用户邮箱',
      dataIndex: 'user_email',
      key: 'user_email',
    },
    {
      title: 'device_id',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => <Typography.Text code>{id}</Typography.Text>,
    },
    {
      title: '所属客户',
      dataIndex: 'org_name',
      key: 'org_name',
    },
    {
      title: '登录时间',
      dataIndex: 'login_at',
      key: 'login_at',
    },
    {
      title: '登出时间',
      dataIndex: 'logout_at',
      key: 'logout_at',
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '终止原因',
      dataIndex: 'termination_reason',
      key: 'termination_reason',
      render: (val: string | null) => val ?? '-',
    },
  ];

  if (!currentUser) return null;

  const tabItems = [
    {
      key: 'devices',
      label: '设备',
      children: (
        <>
          <Space style={{ marginBottom: 16 }} wrap>
            <span>客户：</span>
            <Select
              value={deviceOrgFilter}
              onChange={setDeviceOrgFilter}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部客户' },
                ...channelCustomers.map((c) => ({
                  value: c.org_id,
                  label: c.name,
                })),
              ]}
            />
          </Space>
          <Table<Device>
            columns={deviceColumns}
            dataSource={filteredDevices}
            rowKey="device_id"
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
    {
      key: 'sessions',
      label: '会话',
      children: (
        <>
          <Space style={{ marginBottom: 16 }} wrap>
            <span>客户：</span>
            <Select
              value={sessionOrgFilter}
              onChange={setSessionOrgFilter}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部客户' },
                ...channelCustomers.map((c) => ({
                  value: c.org_id,
                  label: c.name,
                })),
              ]}
            />
            <span>用户：</span>
            <Select
              value={sessionUserFilter}
              onChange={setSessionUserFilter}
              style={{ width: 200 }}
              options={[
                { value: 'all', label: '全部用户' },
                ...sessionUsers.map((u) => ({
                  value: u.user_id,
                  label: u.email,
                })),
              ]}
            />
            <span>状态：</span>
            <Select
              value={sessionStatusFilter}
              onChange={setSessionStatusFilter}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部' },
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'TERMINATED', label: 'TERMINATED' },
                { value: 'EXPIRED', label: 'EXPIRED' },
              ]}
            />
          </Space>
          <Table<Session>
            columns={sessionColumns}
            dataSource={filteredSessions}
            rowKey="session_id"
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {currentUser.org_name} - 设备与会话
        </Title>
      </div>

      <Tabs items={tabItems} defaultActiveKey="devices" />
    </div>
  );
}
