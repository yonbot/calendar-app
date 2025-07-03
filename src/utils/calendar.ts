import type { CalendarDate, Event } from '../types';
import { isHoliday, getHolidayName, isSunday, isSaturday } from './holidays';

export const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

// 元号の定義
interface Era {
  name: string;
  startDate: Date;
  endDate: Date | null; // null means current era
}

const ERAS: Era[] = [
  {
    name: '明治',
    startDate: new Date(1868, 8, 8), // 1868年9月8日
    endDate: new Date(1912, 6, 30), // 1912年7月30日
  },
  {
    name: '大正',
    startDate: new Date(1912, 6, 30), // 1912年7月30日
    endDate: new Date(1926, 11, 25), // 1926年12月25日
  },
  {
    name: '昭和',
    startDate: new Date(1926, 11, 25), // 1926年12月25日
    endDate: new Date(1989, 0, 7), // 1989年1月7日
  },
  {
    name: '平成',
    startDate: new Date(1989, 0, 8), // 1989年1月8日
    endDate: new Date(2019, 3, 30), // 2019年4月30日
  },
  {
    name: '令和',
    startDate: new Date(2019, 4, 1), // 2019年5月1日
    endDate: null, // 現在の元号
  },
];

// 最小年を動的に計算（システム日付の年から100年前）
function getMinYear(): number {
  const currentYear = new Date().getFullYear();
  return currentYear - 100;
}

// 日本のタイムゾーン（JST）で現在の日付を取得
export function getJSTDate(): Date {
  const now = new Date();
  // 日本時間に変換（UTC+9）
  const jstOffset = 9 * 60; // 9時間をミリ秒に変換
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const jst = new Date(utc + jstOffset * 60000);
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

// 西暦での年月表示
export function getMonthName(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    timeZone: 'Asia/Tokyo',
  });
}

// 和暦での年月表示
export function getJapaneseMonthName(date: Date): string {
  const japaneseDate = convertToJapaneseEra(date);
  if (!japaneseDate) {
    // 最小年以前の場合は西暦を表示
    return getMonthName(date);
  }

  const month = date.getMonth() + 1;
  return `${japaneseDate.eraName}${japaneseDate.year}年${month}月`;
}

// 西暦を和暦に変換
export function convertToJapaneseEra(
  date: Date
): { eraName: string; year: number } | null {
  const year = date.getFullYear();
  const minYear = getMinYear();

  // 最小年以前は対応しない
  if (year < minYear) {
    return null;
  }

  // 該当する元号を検索
  for (const era of ERAS) {
    const startYear = era.startDate.getFullYear();
    const endYear = era.endDate
      ? era.endDate.getFullYear()
      : new Date().getFullYear() + 100; // 現在の元号の場合

    if (year >= startYear && year <= endYear) {
      // より詳細な日付チェック
      const targetDate = new Date(year, date.getMonth(), date.getDate());
      const isAfterStart = targetDate >= era.startDate;
      const isBeforeEnd = era.endDate ? targetDate <= era.endDate : true;

      if (isAfterStart && isBeforeEnd) {
        const eraYear = year - era.startDate.getFullYear() + 1;
        return {
          eraName: era.name,
          year: eraYear,
        };
      }
    }
  }

  return null;
}

// 年が最小年以上かどうかをチェック
export function isValidYear(year: number): boolean {
  return year >= getMinYear();
}

// 前の月に移動可能かどうかをチェック
export function canNavigateToPreviousMonth(currentDate: Date): boolean {
  const prevMonth = new Date(currentDate);
  prevMonth.setMonth(currentDate.getMonth() - 1);

  // 最小年の1月1日以前には移動できない
  const minYear = getMinYear();
  const minDate = new Date(minYear, 0, 1); // 1月1日

  return prevMonth >= minDate;
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
