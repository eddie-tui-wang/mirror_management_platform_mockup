'use client';

import AppLayout from '@/components/AppLayout';
import RouteGuard from '@/components/RouteGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <AppLayout>
        {children}
      </AppLayout>
    </RouteGuard>
  );
}
