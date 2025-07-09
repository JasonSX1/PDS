import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import '../../styles/Notification.css';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000, // Aumentado de 3000 para 5000ms (5 segundos)
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Aguarda a animação terminar
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={`notification notification-${type} ${isVisible ? 'notification-visible' : 'notification-hidden'}`}>
      <div className="notification-header">
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="notification-content">
          <div className="notification-title">ERP Kanto Íntimo</div>
          <div className="notification-message">{message}</div>
        </div>
        <button className="notification-close" onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Hook para gerenciar notificações
export const useNotification = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>>([]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string, duration?: number) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, {
      id,
      type,
      title: 'ERP Kanto Íntimo',
      message,
      duration
    }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const NotificationContainer = () => (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );

  return {
    showSuccess: (message: string, duration?: number) => showNotification('success', message, duration),
    showError: (message: string, duration?: number) => showNotification('error', message, duration),
    showInfo: (message: string, duration?: number) => showNotification('info', message, duration),
    NotificationContainer
  };
};

export default Notification;
