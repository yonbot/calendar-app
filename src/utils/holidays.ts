// 日本の祝日を管理するユーティリティ

interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD format
}

// 固定祝日の定義
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': '元日',
  '02-11': '建国記念の日',
  '02-23': '天皇誕生日',
  '04-29': '昭和の日',
  '05-03': '憲法記念日',
  '05-04': 'みどりの日',
  '05-05': 'こどもの日',
  '08-11': '山の日',
  '11-03': '文化の日',
  '11-23': '勤労感謝の日',
};

// 日付をYYYY-MM-DD形式にフォーマット（ローカルタイムゾーン使用）
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// n番目の月曜日を取得
function getNthMonday(year: number, month: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstMonday = new Date(firstDay);
  
  // 最初の月曜日を見つける
  const daysUntilMonday = (8 - firstDay.getDay()) % 7;
  firstMonday.setDate(1 + daysUntilMonday);
  
  // n番目の月曜日
  firstMonday.setDate(firstMonday.getDate() + (n - 1) * 7);
  
  return firstMonday;
}

// 春分の日を計算（簡易計算式）
function getVernalEquinox(year: number): Date {
  // 2000年から2099年の簡易計算
  let day: number;
  if (year >= 2000 && year <= 2099) {
    day = Math.floor(20.8431 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4));
  } else {
    // デフォルト値
    day = 20;
  }
  return new Date(year, 2, day); // 3月
}

// 秋分の日を計算（簡易計算式）
function getAutumnalEquinox(year: number): Date {
  // 2000年から2099年の簡易計算
  let day: number;
  if (year >= 2000 && year <= 2099) {
    day = Math.floor(23.2488 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4));
  } else {
    // デフォルト値
    day = 23;
  }
  return new Date(year, 8, day); // 9月
}

// 振替休日を計算
function getSubstituteHolidays(holidays: Holiday[]): Holiday[] {
  const substituteHolidays: Holiday[] = [];
  
  holidays.forEach(holiday => {
    const date = new Date(holiday.date);
    // 日曜日の祝日は翌日が振替休日
    if (date.getDay() === 0) {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      substituteHolidays.push({
        name: '振替休日',
        date: formatDate(nextDay),
      });
    }
  });
  
  return substituteHolidays;
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

  // 移動祝日を追加
  // 成人の日（1月第2月曜日）
  const comingOfAgeDay = getNthMonday(year, 0, 2);
  holidays.push({
    name: '成人の日',
    date: formatDate(comingOfAgeDay),
  });

  // 春分の日
  const vernalEquinox = getVernalEquinox(year);
  holidays.push({
    name: '春分の日',
    date: formatDate(vernalEquinox),
  });

  // 海の日（7月第3月曜日）
  const marineDay = getNthMonday(year, 6, 3);
  holidays.push({
    name: '海の日',
    date: formatDate(marineDay),
  });

  // 敬老の日（9月第3月曜日）
  const respectForTheAgedDay = getNthMonday(year, 8, 3);
  holidays.push({
    name: '敬老の日',
    date: formatDate(respectForTheAgedDay),
  });

  // 秋分の日
  const autumnalEquinox = getAutumnalEquinox(year);
  holidays.push({
    name: '秋分の日',
    date: formatDate(autumnalEquinox),
  });

  // スポーツの日（10月第2月曜日）
  const sportsDay = getNthMonday(year, 9, 2);
  holidays.push({
    name: 'スポーツの日',
    date: formatDate(sportsDay),
  });

  // 振替休日を追加
  const substituteHolidays = getSubstituteHolidays(holidays);
  holidays.push(...substituteHolidays);

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

// 赤色で表示すべき日かどうかを判定（日曜日、祝日）
export function isRedDate(date: Date): boolean {
  return isSunday(date) || isHoliday(date);
}

// 青色で表示すべき日かどうかを判定（土曜日）
export function isBlueDate(date: Date): boolean {
  return isSaturday(date);
}
