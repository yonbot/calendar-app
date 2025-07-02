import { useState, useEffect } from 'react';
import type { Event } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  event?: Event;
  selectedDate: string;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
}: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    memo: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        memo: event.memo,
      });
    } else {
      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        location: '',
        memo: '',
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    const eventData: Event = {
      id: event?.id || crypto.randomUUID(),
      ...formData,
      date: selectedDate,
    };

    onSave(eventData);
    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete) {
      if (confirm('この予定を削除しますか？')) {
        onDelete(event.id);
        onClose();
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 日付をYYYY年MM月DD日形式に変換（タイムゾーンの影響を避ける）
  const formatDateToJapanese = (dateStr: string): string => {
    if (!dateStr) return '';
    // YYYY-MM-DD形式の文字列を直接分割してタイムゾーンの影響を避ける
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${year}年${month}月${day}日`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">
              {event ? '予定を編集' : '予定を追加'}
            </h2>
            <span className="text-sm text-gray-600 font-medium">
              {formatDateToJapanese(selectedDate)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              タイトル *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                開始時間
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                終了時間
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              場所
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="memo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              メモ
            </label>
            <textarea
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-between pt-4">
            {event && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
              >
                削除
              </button>
            )}
            <div className="flex space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md"
              >
                {event ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
