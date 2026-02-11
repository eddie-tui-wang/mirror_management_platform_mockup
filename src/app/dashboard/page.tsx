'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/lib/store';
import { PortalType } from '@/lib/types';

const DEFAULT_ROUTES: Record<PortalType, string> = {
  platform: '/dashboard/channels',
  channel: '/dashboard/channel/customers',
  customer: '/dashboard/customer/users',
};

export default function DashboardIndex() {
  const router = useRouter();
  const currentUser = useAuthStore(s => s.currentUser);

  useEffect(() => {
    if (currentUser) {
      router.replace(DEFAULT_ROUTES[currentUser.portal]);
    } else {
      router.replace('/');
    }
  }, [currentUser, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spin size="large" tip="Redirecting..." />
    </div>
  );
}
