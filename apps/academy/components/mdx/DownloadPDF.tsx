// components/mdx/DownloadFile.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadFileProps {
  file: string; // path to the file (PDF, ZIP, etc.) in /public or a URL
  label?: string; // optional button text
}

export function DownloadFile({ file, label }: DownloadFileProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file;

    // Use the file name from the path or fallback
    const defaultName = file.split('/').pop() || 'download';
    link.download = defaultName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-xl shadow-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
      <Download className="w-4 h-4" />
      {label || `Download ${file.toUpperCase().includes('.ZIP') ? 'ZIP' : 'File'}`}
    </Button>
  );
}
