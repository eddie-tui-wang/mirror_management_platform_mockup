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
      title="403 - 无访问权限"
      subTitle={
        <>
          当前角色 <strong>{currentUser?.role ?? '未知'}</strong> 没有访问此页面的权限。
          <br />
          请联系管理员或切换账号。
        </>
      }
      extra={[
        <Button type="primary" key="back" onClick={() => router.back()}>
          返回上一页
        </Button>,
        <Button key="home" onClick={() => router.push('/dashboard')}>
          回到首页
        </Button>,
      ]}
    />
  );
}
