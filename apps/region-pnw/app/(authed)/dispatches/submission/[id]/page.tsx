'use client';

import { useParams } from 'next/navigation';
import DispatchSubmissionDataLayer from '@/components/dataLayer/dispatches/DispatchSubmissionDataLayer';

export default function DispatchSubmissionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div suppressHydrationWarning>
      <DispatchSubmissionDataLayer id={id} />
    </div>
  );
}
