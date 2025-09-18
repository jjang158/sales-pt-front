import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Calendar as CalendarComponent } from '../ui/calendar';

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarModal({ open, onOpenChange, calendarDate, onDateSelect }: CalendarModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>날짜 선택</DialogTitle>
          <DialogDescription>
            확인하고 싶은 날짜를 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <CalendarComponent
            mode="single"
            selected={calendarDate}
            onSelect={onDateSelect}
            className="rounded-xl border"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}