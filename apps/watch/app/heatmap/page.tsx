import HeatmapClient from '@/components/map/HeatmapClient';
import { Suspense } from 'react';

export default function HeatmapPage() {
  return (
    <Suspense fallback={<div>Loading heatmap...</div>}>
      <HeatmapClient />
    </Suspense>
  );
}
