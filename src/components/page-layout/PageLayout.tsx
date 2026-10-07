'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { scrollToTop } from '@/lib/utils/client-utils';

const PageLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();

  useEffect(() => {
    scrollToTop();
  }, [pathname]); // Scroll to top on route change

  return <>{children}</>;
};

export default PageLayout;
