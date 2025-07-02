import type { CalendarDate, Event } from '../types';

export const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  });
}

export function getCalendarDates(
  year: number,
  month: number,
  events: Event[],
  selectedDate: Date | null
): CalendarDate[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);

  // 月の最初の日の曜日を取得
  const startDayOfWeek = firstDay.getDay();
  // 月の最後の日の曜日を取得
  const endDayOfWeek = lastDay.getDay();

  // 前月の日付を追加
  for (let i = startDayOfWeek; i > 0; i--) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() - i);
    startDate.setTime(date.getTime());
  }

  // 次月の日付を追加
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    const date = new Date(lastDay);
    date.setDate(date.getDate() + i);
    endDate.setTime(date.getTime());
  }

  const dates: CalendarDate[] = [];
  const currentDate = new Date(startDate);
  const today = new Date();

  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    const dateEvents = events.filter(event => event.date === dateStr);

    dates.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: isSameDay(currentDate, today),
      isSelected: selectedDate ? isSameDay(currentDate, selectedDate) : false,
      events: dateEvents,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
