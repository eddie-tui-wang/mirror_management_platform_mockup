'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/lib/store';
import { hasRouteAccess } from '@/lib/permissions';
import ForbiddenPage from './ForbiddenPage';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAuthStore(s => s.currentUser);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // 等待 zustand hydrate
  if (!hydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 未登录 → 跳转登录页
  if (!isAuthenticated || !currentUser) {
    router.push('/');
    return null;
  }

  // 检查路由权限
  if (!hasRouteAccess(currentUser.portal, pathname)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}
