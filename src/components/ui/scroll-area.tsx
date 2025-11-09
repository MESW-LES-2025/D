import * as React from 'react';
import { cn } from '@/lib/utils';

type ScrollAreaProps = {} & React.HTMLAttributes<HTMLDivElement>;

const ScrollArea = ({ ref, className, children, ...props }: ScrollAreaProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={ref}
    className={cn('relative overflow-auto', className)}
    {...props}
  >
    <div className="h-full w-full">{children}</div>
  </div>
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
