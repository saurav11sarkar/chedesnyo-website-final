'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { scrollToTop } from '@/lib/utils/client-utils';

const PageLayoutBase = ({
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

const PageLayout = dynamic(() => Promise.resolve(PageLayoutBase), {
  ssr: false,
});

export default PageLayout;