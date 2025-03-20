"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: DateRange; // Optional initial date range
  onValueChange?: (date: DateRange | undefined) => void; // Optional callback
}

export default function DateRangePicker({
  className,
  value,
  onValueChange,
}: Readonly<DateRangePickerProps>) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    value ?? {
      from: undefined,
      to: undefined,
    }
  );

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onValueChange?.(newDate); // Call the parent callback if provided
  };

  React.useEffect(() => {
    if (value && value !== date) {
      setDate(value);
    }
  }, [value, date]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {(() => {
              if (date?.from) {
                if (date.to) {
                  return (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  );
                } else {
                  return format(date.from, "LLL dd, y");
                }
              } else {
                return <span>Pick a date</span>;
              }
            })()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
