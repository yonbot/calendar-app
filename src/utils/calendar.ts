import type { CalendarDate, Event } from '../types';
import { isHoliday, getHolidayName, isSunday, isSaturday } from './holidays';

export const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

// 日本のタイムゾーン（JST）で現在の日付を取得
export function getJSTDate(): Date {
  const now = new Date();
  // 日本時間に変換（UTC+9）
  const jstOffset = 9 * 60; // 9時間をミリ秒に変換
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jst = new Date(utc + (jstOffset * 60000));
  return jst;
}

// 日本のタイムゾーンで日付を作成
export function createJSTDate(year: number, month: number, day: number): Date {
  // 月は0ベースなので調整
  const date = new Date(year, month, day);
  return date;
}

export function formatDate(date: Date): string {
  // ローカルタイムゾーンを使用して日付をフォーマット（UTCの影響を避ける）
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    timeZone: 'Asia/Tokyo',
  });
}

// 日本時間での今日の日付を取得
export function getTodayJST(): Date {
  return getJSTDate();
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
  const today = getTodayJST(); // 日本時間での今日を取得

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
