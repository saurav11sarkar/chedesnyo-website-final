'use client';

import dynamic from 'next/dynamic';
import { isClient } from '@/lib/utils/client-utils';

interface NavigateActionProps {
  url: string;
  action: 'navigate' | 'newTab' | 'reload';
}

const NavigateActionBase = ({ url, action }: NavigateActionProps) => {
  if (!isClient) return null;

  if (action === 'navigate') {
    window.location.href = url;
  } else if (action === 'newTab') {
    window.open(url, '_blank');
  } else if (action === 'reload') {
    window.location.reload();
  }

  return null;
};

const NavigateAction = dynamic(() => Promise.resolve(NavigateActionBase), {
  ssr: false,
});

export default NavigateAction;