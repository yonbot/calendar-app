// 日本の祝日を管理するユーティリティ

interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD format
}

// 固定祝日の定義
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': '元日',
  '02-11': '建国記念の日',
  '04-29': '昭和の日',
  '05-03': '憲法記念日',
  '05-04': 'みどりの日',
  '05-05': 'こどもの日',
  '08-11': '山の日',
  '11-03': '文化の日',
  '11-23': '勤労感謝の日',
  '12-23': '天皇誕生日',
};

// 日付をYYYY-MM-DD形式にフォーマット
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 指定年の全祝日を取得
export function getHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // 固定祝日を追加
  Object.entries(FIXED_HOLIDAYS).forEach(([monthDay, name]) => {
    holidays.push({
      name,
      date: `${year}-${monthDay}`,
    });
  });

  return holidays;
}

// 指定日が祝日かどうかを判定
export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getHolidays(year);
  const dateStr = formatDate(date);
  return holidays.some(holiday => holiday.date === dateStr);
}

// 指定日の祝日名を取得
export function getHolidayName(date: Date): string | null {
  const year = date.getFullYear();
  const holidays = getHolidays(year);
  const dateStr = formatDate(date);
  const holiday = holidays.find(holiday => holiday.date === dateStr);
  return holiday ? holiday.name : null;
}

// 日曜日かどうかを判定
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

// 土曜日かどうかを判定
export function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}
