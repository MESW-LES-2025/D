'use client';

import type { DateRange } from 'react-day-picker';
import { IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type PointHistoryFiltersProps = {
  defaultStartDate?: string;
  defaultEndDate?: string;
};

export function PointHistoryFilters({
  defaultStartDate,
  defaultEndDate,
}: PointHistoryFiltersProps) {
  const router = useRouter();

  const parseDateRange = (start?: string, end?: string): DateRange | undefined => {
    if (!start || !end) {
      return undefined;
    }
    const startParts = start.split('-').map(Number);
    const endParts = end.split('-').map(Number);
    if (
      startParts.length === 3
      && endParts.length === 3
      && startParts.every(p => !Number.isNaN(p))
      && endParts.every(p => !Number.isNaN(p))
    ) {
      const startYear = startParts[0];
      const startMonth = startParts[1];
      const startDay = startParts[2];
      const endYear = endParts[0];
      const endMonth = endParts[1];
      const endDay = endParts[2];
      if (
        startYear !== undefined
        && startMonth !== undefined
        && startDay !== undefined
        && endYear !== undefined
        && endMonth !== undefined
        && endDay !== undefined
      ) {
        return {
          from: new Date(startYear, startMonth - 1, startDay),
          to: new Date(endYear, endMonth - 1, endDay),
        };
      }
    }
    return undefined;
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    parseDateRange(defaultStartDate, defaultEndDate));

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const newDateRange = parseDateRange(defaultStartDate, defaultEndDate);
    setDateRange(newDateRange);
  }, [defaultStartDate, defaultEndDate]);

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from) {
      router.push('/settings/point-history');
      return;
    }

    if (!range.to) {
      return;
    }

    const params = new URLSearchParams();
    params.set('startDate', format(range.from, 'yyyy-MM-dd'));
    params.set('endDate', format(range.to, 'yyyy-MM-dd'));
    router.push(`/settings/point-history?${params.toString()}`);
  };

  const handleClear = () => {
    setDateRange(undefined);
    router.push('/settings/point-history');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground',
          )}
        >
          <IconCalendar className="mr-2 size-4" />
          {dateRange?.from
            ? (
                dateRange.to
                  ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')}
                        {' - '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    )
                  : (
                      format(dateRange.from, 'LLL dd, y')
                    )
              )
            : (
                <span>Pick a date range</span>
              )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleDateSelect}
          numberOfMonths={2}
        />
        {dateRange && (
          <div className="border-t p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleClear}
            >
              Clear filter
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
