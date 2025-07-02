import { useState } from 'react';
import type { Event } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  getCalendarDates,
  getMonthName,
  formatDate,
  DAYS_OF_WEEK,
} from '../utils/calendar';
import { EventModal } from './EventModal';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useLocalStorage<Event[]>('calendar-events', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDates = getCalendarDates(year, month, events, selectedDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(new Date(event.date));
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (event: Event) => {
    setEvents(prev => {
      const existingIndex = prev.findIndex(e => e.id === event.id);
      if (existingIndex >= 0) {
        // 既存の予定を更新
        const updated = [...prev];
        updated[existingIndex] = event;
        return updated;
      } else {
        // 新しい予定を追加
        return [...prev, event];
      }
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {getMonthName(currentDate)}
        </h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            今日
          </button>
          <button
            type="button"
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7">
          {calendarDates.map(calendarDate => {
            const {
              date,
              isCurrentMonth,
              isToday,
              events: dateEvents,
            } = calendarDate;
            const dateStr = formatDate(date);

            return (
              <div
                key={dateStr}
                className={`
                  min-h-[100px] p-2 border-b border-r border-gray-200 cursor-pointer
                  hover:bg-blue-50 transition-colors
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  ${isToday ? 'bg-blue-100' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`
                      text-sm font-medium
                      ${isToday ? 'text-blue-600' : ''}
                      ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                    `}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* 予定の表示 */}
                <div className="space-y-1">
                  {dateEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={e => handleEventClick(event, e)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded truncate hover:bg-blue-600 transition-colors"
                      title={`${event.title} ${event.startTime ? `(${event.startTime}${event.endTime ? `-${event.endTime}` : ''})` : ''}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dateEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dateEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 予定モーダル */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={editingEvent}
        selectedDate={selectedDate ? formatDate(selectedDate) : ''}
      />
    </div>
  );
}
