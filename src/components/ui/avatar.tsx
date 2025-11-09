import * as React from 'react';
import { cn } from '@/lib/utils';

const Avatar = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
);
Avatar.displayName = 'Avatar';

const AvatarImage = ({ ref, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { ref?: React.RefObject<HTMLImageElement | null> }) => (
  // eslint-disable-next-line next/no-img-element, jsx-a11y/alt-text
  <img
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback, AvatarImage };
