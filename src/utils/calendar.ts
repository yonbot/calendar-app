import type { CalendarDate, Event } from '../types';
import { isHoliday, getHolidayName, isSunday, isSaturday } from './holidays';

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
  const startDayOfWeek = firstDay.getDay(); // 0 = 日曜日, 1 = 月曜日, ..., 6 = 土曜日

  // カレンダーの開始日を計算（その月の1日から日曜日まで戻る）
  const startDate = new Date(year, month, 1 - startDayOfWeek);

  const dates: CalendarDate[] = [];
  const today = new Date();

  // 6週間分（42日）のカレンダーを生成
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateStr = formatDate(currentDate);
    const dateEvents = events.filter(event => event.date === dateStr);

    dates.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: isSameDay(currentDate, today),
      isSelected: selectedDate ? isSameDay(currentDate, selectedDate) : false,
      events: dateEvents,
      isHoliday: isHoliday(currentDate),
      holidayName: getHolidayName(currentDate),
      isSunday: isSunday(currentDate),
      isSaturday: isSaturday(currentDate),
    });
  }

  return dates;
}
