// components/ui/textarea.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded border border-gray-300 bg-background text-foreground shadow-sm focus:outline-none focus:ring focus:ring-blue-500',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
