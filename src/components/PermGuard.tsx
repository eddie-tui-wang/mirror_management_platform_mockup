'use client';

import React from 'react';
import { Tooltip, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/lib/store';
import { hasPermission, PermissionKey, PERMISSIONS } from '@/lib/permissions';

interface PermGuardProps {
  permission: PermissionKey;
  children: React.ReactNode;
  /** 无权限时的行为: hide=隐藏, disable=置灰+tooltip */
  fallback?: 'hide' | 'disable';
  /** 自定义无权限提示 */
  tooltip?: string;
}

export default function PermGuard({
  permission,
  children,
  fallback = 'disable',
  tooltip,
}: PermGuardProps) {
  const currentUser = useAuthStore(s => s.currentUser);

  if (!currentUser) return null;

  const allowed = hasPermission(currentUser.role, permission);

  if (allowed) return <>{children}</>;

  if (fallback === 'hide') return null;

  // disable 模式：置灰 + tooltip
  const tip = tooltip || `No permission: ${PERMISSIONS[permission]}`;

  // 如果 children 是 Button，包裹 tooltip
  return (
    <Tooltip title={tip} placement="top">
      <span style={{ cursor: 'not-allowed', display: 'inline-block' }}>
        <Button
          disabled
          icon={<LockOutlined />}
          style={{ pointerEvents: 'none' }}
          size="small"
          type="link"
        >
          {React.isValidElement(children) && 'children' in (children.props as Record<string, unknown>)
            ? ((children.props as Record<string, unknown>).children as React.ReactNode)
            : typeof children === 'string'
              ? children
              : 'No Permission'}
        </Button>
      </span>
    </Tooltip>
  );
}
