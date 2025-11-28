'use client';

import { motion } from 'framer-motion';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ViewToggleOption = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

type ViewToggleProps = {
  'value': string;
  'onValueChange': (value: string) => void;
  'options'?: ViewToggleOption[];
  'className'?: string;
  'aria-label'?: string;
};

const defaultOptions: ViewToggleOption[] = [
  { value: 'table', label: 'Table' },
  { value: 'board', label: 'Board' },
];

/**
 * Compact segmented control for switching between two views (e.g., Table/Board).
 */
function ViewToggle({
  value,
  onValueChange,
  options = defaultOptions,
  className,
  'aria-label': ariaLabel = 'View toggle',
}: ViewToggleProps) {
  return (
    <div
      data-slot="view-toggle"
      className={cn(
        'bg-muted text-muted-foreground relative inline-flex w-fit items-center justify-center rounded-lg p-[3px] h-10',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
      data-orientation="horizontal"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            className={cn('p-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4')}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-md bg-background shadow-sm dark:border-input dark:bg-input/30"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex items-center gap-1.5',
              )}
            >
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { ViewToggle };
