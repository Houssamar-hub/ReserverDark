import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      console.log(' Socket connected to server:', newSocket.id);
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
      console.log(' Socket disconnected');
      setIsConnected(false);
    });

    // Real-time new booking listener
    newSocket.on('booking:new', (booking) => {
      console.log(' [Real-time] New booking received:', booking);

      // Notify all registered listeners
      listenersRef.current.onBookingNew.forEach(cb => {
        try { cb(booking); } catch (e) { console.error(e); }
      });

      // Show clickable toast if owner or admin
      const clientName = booking.client?.name || 'Un voyageur';
      const propTitle = booking.property?.title || 'votre logement';
      const targetPath = user.role === 'admin' ? '/admin/bookings' : '/owner/bookings';

      toast((t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            navigate(targetPath);
          }}
          className="flex items-center gap-3 cursor-pointer group select-none w-full p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
            
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Nouvelle réservation !
              </p>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Voir →
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
              {clientName} a réservé <span className="font-semibold">{propTitle}</span>
            </p>
          </div>
        </div>
      ), { duration: 7500 });
    });

    // Real-time booking status update listener
    newSocket.on('booking:updated', (booking) => {
      console.log(' [Real-time] Booking updated:', booking);

      // Notify all registered listeners
      listenersRef.current.onBookingUpdated.forEach(cb => {
        try { cb(booking); } catch (e) { console.error(e); }
      });

      const propTitle = booking.property?.title || 'votre réservation';
      const statusText = booking.status === 'confirmed' 
        ? 'confirmée ' 
        : booking.status === 'rejected' 
        ? 'rejetée ' 
        : booking.status === 'cancelled'
        ? 'annulée '
        : 'mise à jour';

      const targetPath = user.role === 'owner' 
        ? '/owner/bookings' 
        : user.role === 'admin'
        ? '/admin/bookings'
        : '/client/bookings';

      toast((t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            navigate(targetPath);
          }}
          className="flex items-center gap-3 cursor-pointer group select-none w-full p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
            
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Réservation {statusText}
              </p>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                Voir →
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
              Pour <span className="font-semibold">{propTitle}</span>
            </p>
          </div>
        </div>
      ), { duration: 7500 });
    });

    // Real-time notification listener
    newSocket.on('notification:new', (notification) => {
      console.log(' [Real-time] Notification:', notification);
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
