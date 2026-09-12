import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
  : 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef({ onBookingNew: new Set(), onBookingUpdated: new Set() });

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server:', newSocket.id);
      setIsConnected(true);

      // Join user specific room
      if (user._id) {
        newSocket.emit('join_user', user._id);
      }
      if (user.role) {
        newSocket.emit('join_role', user.role);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
    });

    // Real-time new booking listener
    newSocket.on('booking:new', (booking) => {
      console.log('🔔 [Real-time] New booking received:', booking);

      // Notify all registered listeners
      listenersRef.current.onBookingNew.forEach(cb => {
        try { cb(booking); } catch (e) { console.error(e); }
      });

      // Show toast if owner or admin
      const clientName = booking.client?.name || 'Un voyageur';
      const propTitle = booking.property?.title || 'votre logement';

      toast((t) => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-base flex-shrink-0 shadow-md">
            🛎️
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Nouvelle réservation !
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {clientName} a réservé <span className="font-semibold">{propTitle}</span>
            </p>
          </div>
        </div>
      ), { duration: 6500 });
    });

    // Real-time booking status update listener
    newSocket.on('booking:updated', (booking) => {
      console.log('🔄 [Real-time] Booking updated:', booking);

      // Notify all registered listeners
      listenersRef.current.onBookingUpdated.forEach(cb => {
        try { cb(booking); } catch (e) { console.error(e); }
      });

      const propTitle = booking.property?.title || 'votre réservation';
      const statusText = booking.status === 'confirmed' 
        ? 'confirmée ✅' 
        : booking.status === 'rejected' 
        ? 'rejetée ❌' 
        : booking.status === 'cancelled'
        ? 'annulée ⚠️'
        : 'mise à jour';

      toast((t) => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-base flex-shrink-0 shadow-md">
            📅
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Réservation {statusText}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              Pour <span className="font-semibold">{propTitle}</span>
            </p>
          </div>
        </div>
      ), { duration: 6000 });
    });

    // Real-time notification listener
    newSocket.on('notification:new', (notification) => {
      console.log('📫 [Real-time] Notification:', notification);
      if (addNotification) {
        addNotification(notification);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, user?.role]);

  // Subscribe to real-time events helpers
  const subscribeToNewBookings = (callback) => {
    listenersRef.current.onBookingNew.add(callback);
    return () => {
      listenersRef.current.onBookingNew.delete(callback);
    };
  };

  const subscribeToBookingUpdates = (callback) => {
    listenersRef.current.onBookingUpdated.add(callback);
    return () => {
      listenersRef.current.onBookingUpdated.delete(callback);
    };
  };

  const value = {
    socket,
    isConnected,
    subscribeToNewBookings,
    subscribeToBookingUpdates,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
