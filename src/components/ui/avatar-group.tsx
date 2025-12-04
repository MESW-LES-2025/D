/* eslint-disable react/no-array-index-key */
'use client';

import type { Transition } from 'framer-motion';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import * as React from 'react';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type TooltipContentProps = React.ComponentProps<typeof TooltipContent>;
type AvatarMotionProps = {
  children: React.ReactNode;
  zIndex: number;
  transition: Transition;
  tooltipContent?: React.ReactNode;
  tooltipProps?: Partial<TooltipContentProps>;
};
function AvatarMotionContainer({
  children,
  zIndex,
  transition,
  tooltipContent,
  tooltipProps,
}: AvatarMotionProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <TooltipPrimitive.Root>
      <TooltipTrigger>
        <motion.div
          data-slot="avatar-container"
          className="relative"
          style={{ zIndex: isHovered ? 50 : zIndex }}
          transition={transition}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {children}
        </motion.div>
      </TooltipTrigger>
      {tooltipContent && (
        <AvatarGroupTooltip {...tooltipProps}>
          {tooltipContent}
        </AvatarGroupTooltip>
      )}
    </TooltipPrimitive.Root>
  );
}

type AvatarCSSProps = {
  children: React.ReactNode;
  zIndex: number;
  tooltipContent?: React.ReactNode;
  tooltipProps?: Partial<TooltipContentProps>;
};
function AvatarCSSContainer({
  children,
  zIndex,
  tooltipContent,
  tooltipProps,
}: AvatarCSSProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <TooltipPrimitive.Root>
      <TooltipTrigger>
        <div
          data-slot="avatar-container"
          className="relative transition-transform duration-300 ease-out hover:-translate-y-2"
          style={{ zIndex: isHovered ? 50 : zIndex }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {children}
        </div>
      </TooltipTrigger>
      {tooltipContent && (
        <AvatarGroupTooltip {...tooltipProps}>
          {tooltipContent}
        </AvatarGroupTooltip>
      )}
    </TooltipPrimitive.Root>
  );
}

type AvatarStackItemProps = {
  children: React.ReactNode;
  index: number;
  size: number;
  className?: string;
};
function AvatarStackItem({ children, index, size, className }: AvatarStackItemProps) {
  return (
    <div
      className={cn(
        'size-full shrink-0 overflow-hidden rounded-full',
        '**:data-[slot="avatar"]:size-full',
        className,
      )}
      style={{
        width: size,
        height: size,
        maskImage: index
          ? `radial-gradient(circle ${size / 2}px at -${size / 4 + size / 10}px 50%, transparent 99%, white 100%)`
          : '',
      }}
    >
      {children}
    </div>
  );
}
type AvatarGroupTooltipProps = TooltipContentProps;
function AvatarGroupTooltip(props: AvatarGroupTooltipProps) {
  return <TooltipContent {...props} />;
}
type AvatarGroupVariant = 'motion' | 'css' | 'stack';

const defaultTransition = { type: 'spring', stiffness: 300, damping: 17 } as const;
const defaultTooltipProps = { side: 'top', sideOffset: 24 } as const;

type AvatarGroupProps = Omit<React.ComponentProps<'div'>, 'translate'> & {
  children: React.ReactElement[];
  variant?: AvatarGroupVariant;
  transition?: Transition;
  invertOverlap?: boolean;
  tooltipProps?: Partial<TooltipContentProps>;
  animate?: boolean;
  size?: number;
};
function AvatarGroup({
  ref,
  children,
  className,
  variant = 'motion',
  transition = defaultTransition,
  invertOverlap = false,
  tooltipProps = defaultTooltipProps,
  animate = false,
  size = 40,
  ...props
}: AvatarGroupProps) {
  if (variant === 'stack') {
    return (
      <div
        ref={ref}
        className={cn(
          '-space-x-1 flex items-center',
          animate && 'hover:space-x-0 *:transition-all',
          className,
        )}
        {...props}
      >
        {children.map((child, index) => {
          if (!child) {
            return null;
          }
          return (
            <AvatarStackItem
              key={`avatar-${index}`}
              index={index}
              size={size}
              className={className}
            >
              {child}
            </AvatarStackItem>
          );
        })}
      </div>
    );
  }
  return (
    <TooltipProvider delayDuration={0}>
      <div
        ref={ref}
        data-slot="avatar-group"
        className={cn(
          'flex items-center',
          variant === 'css' && '-space-x-3',
          variant === 'motion' && 'flex-row -space-x-2 h-8',
          className,
        )}
        {...props}
      >
        {children?.map((child, index) => {
          const zIndex = invertOverlap ? children.length - index : index;

          if (variant === 'motion') {
            return (
              <AvatarMotionContainer
                key={`avatar-${index}`}
                zIndex={zIndex}
                transition={transition}
                tooltipProps={tooltipProps}
              >
                {child}
              </AvatarMotionContainer>
            );
          }

          return (
            <AvatarCSSContainer
              key={`avatar-${index}`}
              zIndex={zIndex}
              tooltipProps={tooltipProps}
            >
              {child}
            </AvatarCSSContainer>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
export {
  AvatarGroup,
  type AvatarGroupProps,
  AvatarGroupTooltip,
  type AvatarGroupTooltipProps,
  type AvatarGroupVariant,
};
