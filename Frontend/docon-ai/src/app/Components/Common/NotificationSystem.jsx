"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContext = createContext();

const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const getStyles = () => {
    const base = "border-l-4 shadow-lg";
    switch (notification.type) {
      case 'success': return `${base} bg-green-50 border-green-500`;
      case 'error': return `${base} bg-red-50 border-red-500`;
      case 'warning': return `${base} bg-yellow-50 border-yellow-500`;
      default: return `${base} bg-blue-50 border-blue-500`;
    }
  };

  return (
    <div className={`transform transition-all duration-300 ease-in-out mb-3 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${getStyles()} rounded-lg p-4 max-w-sm w-full pointer-events-auto`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          {notification.title && <h4 className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</h4>}
          <p className="text-sm text-gray-700">
  {Array.isArray(notification.message) ? (
    notification.message.map((err, i) => (
      <span key={i} className="block">
        {err?.loc?.slice(1).join('.')}: {err?.msg}
      </span>
    ))
  ) : typeof notification.message === 'string' ? (
    notification.message
  ) : (
    JSON.stringify(notification.message)
  )}
</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button onClick={handleRemove} className="inline-flex text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="flex flex-col-reverse">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onRemove={removeNotification} />
        ))}
      </div>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
    if (newNotification.duration > 0) {
      setTimeout(() => removeNotification(id), newNotification.duration);
    }
    return id;
  }, [removeNotification]);
  
  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
  }), [notifications, addNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const createNotificationHelpers = (addNotification) => ({
  success: (message, options = {}) => addNotification({ type: 'success', message, ...options }),
  error: (message, options = {}) => addNotification({ type: 'error', message, duration: 7000, ...options }),
  warning: (message, options = {}) => addNotification({ type: 'warning', message, ...options }),
  info: (message, options = {}) => addNotification({ type: 'info', message, ...options }),
  custom: (options) => addNotification(options)
});

export const useNotifications = () => {
  const { addNotification } = useNotification();
  return useMemo(() => createNotificationHelpers(addNotification), [addNotification]);
};