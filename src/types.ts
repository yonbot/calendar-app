export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  memo: string;
  date: string; // YYYY-MM-DD format
}

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: Event[];
}
