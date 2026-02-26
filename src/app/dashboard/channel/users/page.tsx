'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This route has been merged into Customer Management.
// Redirect to /dashboard/channel/customers to preserve any bookmarked links.
export default function ChannelUsersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/channel/customers');
  }, [router]);
  return null;
}
