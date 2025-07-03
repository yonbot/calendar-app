import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Event } from '../types';
import {
  formatDate,
  getMonthName,
  getJapaneseMonthName,
  DAYS_OF_WEEK,
  getCalendarDates,
  getTodayJST,
  canNavigateToPreviousMonth,
  isValidYear,
} from '../utils/calendar';
import { isRedDate, isBlueDate, getHolidayName } from '../utils/holidays';
import { EventModal } from './EventModal';

type ViewMode = 'calendar' | 'month' | 'year';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(getTodayJST());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useLocalStorage<Event[]>('calendar-events', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [isJapaneseEra, setIsJapaneseEra] = useState(false); // 西暦がデフォルト
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDates = getCalendarDates(year, month, events, selectedDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    
    // 1900年以前への移動を制限
    if (direction === 'prev' && !canNavigateToPreviousMonth(currentDate)) {
      return; // 移動しない
    }
    
    setCurrentDate(newDate);
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

  const handleTodayClick = () => {
    setCurrentDate(getTodayJST());
    setViewMode('calendar');
  };

  const handleHeaderClick = () => {
    setViewMode('month');
  };

  const handleMonthSelect = (selectedMonth: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(selectedMonth);
    setCurrentDate(newDate);
    setViewMode('calendar');
  };

  const handleYearClick = () => {
    setViewMode('year');
  };

  const handleYearSelect = (selectedYear: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(selectedYear);
    setCurrentDate(newDate);
    setViewMode('month');
  };

  const displayMonthName = isJapaneseEra 
    ? getJapaneseMonthName(currentDate) 
    : getMonthName(currentDate);

  // 前の月への移動が可能かどうか
  const canGoToPrev = canNavigateToPreviousMonth(currentDate);

  // 年選択用の年リストを生成（現在年から過去100年まで）
  const generateYearList = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 100; i++) {
      const year = currentYear - i;
      years.push(year);
    }
    return years;
  };

  // 月選択ビュー
  const renderMonthView = () => {
    const months = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* 年の表示：タイル幅いっぱいの背景色ラベル、水平中央揃え */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleYearClick}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>{year}年</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {months.map((monthName, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleMonthSelect(index)}
              className={`
                p-4 text-center rounded-lg border-2 transition-colors
                ${month === index 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}
            >
              {monthName}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 年選択ビュー
  const renderYearView = () => {
    const years = generateYearList();

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">年を選択</h2>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {years.map(yearOption => (
            <button
              key={yearOption}
              type="button"
              onClick={() => handleYearSelect(yearOption)}
              className={`
                p-3 text-center rounded-lg border-2 transition-colors
                ${year === yearOption 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}
            >
              {yearOption}年
            </button>
          ))}
        </div>
      </div>
    );
  };

  // カレンダービュー
  const renderCalendarView = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={`
              p-3 text-center text-sm font-medium bg-gray-50
              ${index === 0 ? 'text-red-600' : 
                index === 6 ? 'text-blue-600' : 'text-gray-500'}
            `}
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
          const holidayName = getHolidayName(date);
          const isRed = isRedDate(date);
          const isBlue = isBlueDate(date);

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
                <div className="flex items-center space-x-1">
                  <span
                    className={`
                      text-sm font-medium
                      ${isToday ? 'text-blue-600' : ''}
                      ${!isCurrentMonth ? 'text-gray-400' : 
                        isRed && isCurrentMonth ? 'text-red-600' : 
                        isBlue && isCurrentMonth ? 'text-blue-600' : 'text-gray-900'}
                    `}
                  >
                    {date.getDate()}
                  </span>
                  {holidayName && isCurrentMonth && (
                    <span className="text-xs text-red-600 font-medium">
                      {holidayName}
                    </span>
                  )}
                </div>
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
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleHeaderClick}
            className="flex items-center space-x-2 text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            disabled={viewMode !== 'calendar'}
          >
            <span>{displayMonthName}</span>
            {viewMode === 'calendar' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          
          {/* 西暦・和暦切り替えトグルボタン */}
          {viewMode === 'calendar' && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsJapaneseEra(false)}
                className={`
                  px-3 py-1 text-sm font-medium rounded-md transition-colors
                  ${!isJapaneseEra 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'}
                `}
              >
                西暦
              </button>
              <button
                type="button"
                onClick={() => setIsJapaneseEra(true)}
                className={`
                  px-3 py-1 text-sm font-medium rounded-md transition-colors
                  ${isJapaneseEra 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'}
                `}
              >
                和暦
              </button>
            </div>
          )}
        </div>
        
        {viewMode === 'calendar' && (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              disabled={!canGoToPrev}
              className={`
                px-3 py-2 rounded-md border transition-colors flex items-center justify-center
                ${canGoToPrev 
                  ? 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700' 
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              <svg
                className="w-4 h-4"
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
              onClick={handleTodayClick}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
            >
              今日
            </button>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-4 h-4"
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
        )}
      </div>

      {/* ビューの切り替え */}
      {viewMode === 'calendar' && renderCalendarView()}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'year' && renderYearView()}

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
