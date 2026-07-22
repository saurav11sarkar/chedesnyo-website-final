'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { scrollToTop } from '@/lib/utils/client-utils';

const ScrollToTopComponent = () => {
  useEffect(() => {
    scrollToTop();
  }, []);

  return null;
};

const ScrollToTop = dynamic(() => Promise.resolve(ScrollToTopComponent), {
  ssr: false,
});

export default ScrollToTop;