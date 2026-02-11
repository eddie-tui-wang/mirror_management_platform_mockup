'use client';

import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function ForbiddenPage() {
  const router = useRouter();
  const currentUser = useAuthStore(s => s.currentUser);

  return (
    <Result
      status="403"
      title="403 - Access Denied"
      subTitle={
        <>
          Role <strong>{currentUser?.role ?? 'Unknown'}</strong> does not have permission to access this page.
          <br />
          Please contact an administrator or switch accounts.
        </>
      }
      extra={[
        <Button type="primary" key="back" onClick={() => router.back()}>
          Go Back
        </Button>,
        <Button key="home" onClick={() => router.push('/dashboard')}>
          Home
        </Button>,
      ]}
    />
  );
}
