import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        const { data } = await apiClient.get('/api/notifications/unread-count');
        setUnreadCount(data?.count || 0);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, [user]);

  return (
    <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
      <span style={{ fontSize: '24px' }}>🔔</span>
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          backgroundColor: 'red',
          color: 'white',
          fontSize: '12px',
          borderRadius: '50%',
          padding: '2px 6px',
          fontWeight: 'bold'
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
