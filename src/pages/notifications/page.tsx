import { useState } from 'react';
import { StatusBar } from '../../components/feature/StatusBar';
import { BottomNav } from '../../components/feature/BottomNav';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'route' | 'system';
  user?: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  actionImage?: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'like',
    user: {
      name: 'Sarah Kim',
      avatar: '',
    },
    content: 'liked your route "Seoul Night Tour"',
    timestamp: '5m ago',
    isRead: false,
    actionImage: '',
  },
  {
    id: 2,
    type: 'comment',
    user: {
      name: 'Mike Chen',
      avatar: '',
    },
    content: 'commented: "This looks amazing! Can\'t wait to try it"',
    timestamp: '1h ago',
    isRead: false,
  },
  {
    id: 3,
    type: 'follow',
    user: {
      name: 'Emma Park',
      avatar: '',
    },
    content: 'started following you',
    timestamp: '3h ago',
    isRead: false,
  },
  {
    id: 4,
    type: 'route',
    content: 'New K-Drama spot added near you!',
    timestamp: '5h ago',
    isRead: true,
    actionImage: '',
  },
  {
    id: 5,
    type: 'system',
    content: 'You earned a new stamp: "Seoul Explorer"',
    timestamp: '1d ago',
    isRead: true,
  },
  {
    id: 6,
    type: 'like',
    user: {
      name: 'David Lee',
      avatar: '',
    },
    content: 'and 23 others liked your route',
    timestamp: '2d ago',
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleBack = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(-1);
    }
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'ri-heart-fill text-red-500';
      case 'comment':
        return 'ri-chat-3-fill text-blue-500';
      case 'follow':
        return 'ri-user-add-fill text-teal-500';
      case 'route':
        return 'ri-map-pin-fill text-purple-500';
      case 'system':
        return 'ri-notification-fill text-amber-500';
      default:
        return 'ri-notification-line text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <StatusBar />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 pt-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
          <button onClick={handleMarkAllAsRead} className="text-teal-600 font-semibold text-sm cursor-pointer whitespace-nowrap">
            Mark all
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'unread' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      <div className="pt-36 px-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-notification-off-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-sm text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                className={`bg-white rounded-xl p-4 cursor-pointer transition-all ${
                  !notif.isRead ? 'border-l-4 border-teal-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar or Icon */}
                  {notif.user ? (
                    <PlaceholderImage
                      alt={notif.user.name}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                      iconClassName="text-xl"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className={`${getNotificationIcon(notif.type)} text-xl`}></i>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {notif.user && <span className="font-bold">{notif.user.name} </span>}
                      {notif.content}
                    </p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">{notif.timestamp}</span>
                  </div>

                  {/* Action Image */}
                  {notif.actionImage !== undefined && (
                    <PlaceholderImage
                      alt=""
                      className="w-14 h-14 rounded-lg flex-shrink-0"
                      iconClassName="text-lg"
                    />
                  )}

                  {/* Unread Indicator */}
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}