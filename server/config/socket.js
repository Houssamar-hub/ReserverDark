import { Server } from 'socket.io';

let io = null;

export const initializeSocket = (server) => {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.CLIENT_URL || '').split(',').map(u => u.trim()).filter(Boolean)
    : (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(u => u.trim()).filter(Boolean);

  try {
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
      transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket) => {
      console.log(' Client connected:', socket.id);

      // Join personal user room
      socket.on('join_user', (userId) => {
        if (userId) {
          const room = `user:${userId}`;
          socket.join(room);
          console.log(` Socket ${socket.id} joined room ${room}`);
        }
      });

      // Join role room (admin, owner, client)
      socket.on('join_role', (role) => {
        if (role) {
          const room = `role:${role}`;
          socket.join(room);
          console.log(` Socket ${socket.id} joined role ${room}`);
        }
      });

      // Leave user room
      socket.on('leave_user', (userId) => {
        if (userId) {
          socket.leave(`user:${userId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(' Client disconnected:', socket.id);
      });

      // Ping-Pong for keep-alive
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    return io;
  } catch (error) {
    console.error('Socket.io initialization error:', error);
    return null;
  }
};

export const getIO = () => {
  if (!io) {
    console.warn('Socket.io not yet initialized');
    return null;
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, data);
};

export const emitToRole = (role, event, data) => {
  if (!io || !role) return;
  io.to(`role:${role}`).emit(event, data);
};

export const broadcastEvent = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

export default { initializeSocket, getIO, emitToUser, emitToRole, broadcastEvent };