// File: components/NotificationStack.js
import { useEffect, useState } from 'react';
import { Bell, ExternalLink, X } from 'lucide-react';

function Notification({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div 
      className="relative transform transition-all duration-300 ease-out"
      style={{
        maxWidth: 'calc(100vw - 2rem)'
      }}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-green-400" />
            </div>
          </div>
          
          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">
                Payment Received
              </p>
              <button
                onClick={() => onDismiss(notification.id)}
                className="ml-3 flex-shrink-0 rounded-md text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1">
              <p className="text-sm text-gray-300">
                Amount: <span className="font-mono">{notification.amount} XLM</span>
              </p>
              <p className="text-sm text-gray-400">
                From: {notification.from.slice(0, 4)}...{notification.from.slice(-4)}
              </p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${notification.transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300"
              >
                View Transaction <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationStack() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(current => [
      { id, ...notification },
      ...current
    ].slice(0, 5)); // Keep max 5 notifications
  };

  const dismissNotification = (id) => {
    setNotifications(current =>
      current.filter(notification => notification.id !== id)
    );
  };

  // Export method to add notifications
  if (typeof window !== 'undefined' && !window.addNotification) {
    window.addNotification = addNotification;
  }

  return (
    <div 
      aria-live="assertive" 
      className="fixed inset-0 z-50 flex items-end px-4 py-6 pointer-events-none sm:p-6"
    >
      <div className="flex flex-col items-end space-y-4 w-full">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="w-full flex justify-end"
            style={{
              maxWidth: '28rem',
              marginLeft: 'auto',
              transform: `translateY(${index * 10}px)`, // Slight overlap effect
              zIndex: notifications.length - index,
            }}
          >
            <Notification
              notification={notification}
              onDismiss={dismissNotification}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
